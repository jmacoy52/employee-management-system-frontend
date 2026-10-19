import React, { useState } from "react";
import api, { getErrorMessage } from "../../api/client";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import PasswordInput from "../../components/auth/PasswordInput";
import SubmitButton from "../../components/auth/SubmitButton";
import { ROLE_HOME, PATHS } from "../../routes/paths";
import { DEMO_ACCOUNTS, findDemoAccount, isDemoMode } from "../../config/demo";
import { toast } from "react-hot-toast"; // toast for notifications
import { saveSession } from "../../auth/session";

const Login = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  // /login?demo=admin|hr|employee pre-fills a public demo account (from the landing page)
  const preset = findDemoAccount(params.get("demo"));
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
      navigate(ROLE_HOME[user.role] || PATHS.employee);
      toast.success("Login successful!");
    } catch (err) {
      setError(getErrorMessage(err, "Login failed. Please try again."));
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
            Don't have an account? <Link to="/register">Register</Link>
          </span>
        </>
      }
    >
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
        <SubmitButton loading={loading} loadingText="Signing in…">
          Login
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
