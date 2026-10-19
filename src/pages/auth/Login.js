import React, { useState } from "react";
import api, { getErrorMessage } from "../../api/client";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Loader2, LogIn } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import PasswordInput from "../../components/auth/PasswordInput";
import SubmitButton from "../../components/auth/SubmitButton";
import { ROLE_HOME, PATHS } from "../../routes/paths";
import { DEMO_ACCOUNTS, findDemoAccount, isDemoMode } from "../../config/demo";
import { toast } from "react-hot-toast"; // toast for notifications
import { saveSession } from "../../auth/session";

// Only same-site paths ("/admin/billing"), never "//evil.com" or full URLs.
export const safeNext = (value) =>
  typeof value === "string" && /^\/(?![/\\])/.test(value) && !value.startsWith("/login") ? value : null;

const LOGIN_NOTICES = {
  suspended: "Your organisation's EmploCore account is suspended, so you have been signed out. Please contact EmploCore.",
  pending: "Your organisation is waiting for approval. You can sign in once EmploCore has approved it.",
  rejected: "Your organisation's registration was not approved, so you have been signed out. Please contact EmploCore if you think this is a mistake.",
};

const Login = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  // /login?demo=admin|hr|employee pre-fills a public demo account (from the landing page)
  const preset = findDemoAccount(params.get("demo"));
  // Signed out because the organisation was suspended / is awaiting approval
  const notice = LOGIN_NOTICES[params.get("notice")] || "";
  const [formData, setFormData] = useState({
    email: preset?.email || "",
    password: preset?.password || "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // handle field change
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const fillDemo = (account) => {
    setFormData({ email: account.email, password: account.password });
    setError("");
  };

  // handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/api/users/login", formData);

      // save JWT and the user returned by the server
      const { token, user } = res.data;
      saveSession(token, user);

      // an admin-issued temporary password must be replaced first
      if (user.mustChangePassword) {
        navigate(PATHS.changePassword);
        toast("Please set a new password to continue.");
        return;
      }

      // redirect based on role (unknown roles fall back to the employee page)
      navigate(safeNext(params.get("next")) || ROLE_HOME[user.role] || PATHS.employee);
      toast.success("Login successful!");
    } catch (err) {
      // A rejected registration can carry the reviewer's reason
      const reason = err.response?.data?.reason;
      const message = getErrorMessage(err, "Login failed. Please try again.");
      setError(reason ? `${message} Reason: ${reason}` : message);
    } finally {
      setLoading(false);
    }
  };

  //  UI
  return (
    <AuthLayout
      title="Sign in"
      subtitle="Welcome back. Sign in to open your dashboard."
      footer={
        <>
          <span>
            New to EmploCore? <Link to="/register-organisation">Register your organisation</Link>
          </span>
        </>
      }
    >
      {notice && !error && (
        <p className="error login-notice" role="alert">{notice}</p>
      )}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            name="email"
            placeholder="you@company.com"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            aria-invalid={Boolean(error)}
            required
          />
        </div>
        <div className="field">
          <div className="field-row">
            <label htmlFor="login-password">Password</label>
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
          <PasswordInput
            id="login-password"
            name="password"
            placeholder="Your password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            aria-invalid={Boolean(error)}
            required
          />
        </div>
        {loading && (
          <p className="auth-hint waking" role="status">
            <Loader2 size={16} className="spin-icon" aria-hidden="true" />
            Contacting the server… if it has been asleep this can take up to
            a minute.
          </p>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <SubmitButton loading={loading} loadingText="Signing in…" className="signin-submit">
          <LogIn size={18} aria-hidden="true" /> Sign in
        </SubmitButton>
      </form>

      {isDemoMode() && (
      <div className="demo-picker">
        <p>Trying EmploCore? Fill in a demo account:</p>
        <div className="demo-picker-buttons">
          {DEMO_ACCOUNTS.map((a) => (
            <button
              key={a.key}
              type="button"
              className="btn btn-secondary btn-sm"
              aria-pressed={formData.email === a.email}
              onClick={() => fillDemo(a)}
            >
              {a.role}
            </button>
          ))}
        </div>
      </div>
      )}
    </AuthLayout>
  );
};

export default Login;
