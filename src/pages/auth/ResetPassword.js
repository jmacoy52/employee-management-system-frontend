import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import api, { getErrorMessage } from "../../api/client";
import PageLayout from "../../components/layout/PageLayout";
import { PATHS } from "../../routes/paths";
import "./Login.css";

const MIN_PASSWORD_LENGTH = 8;

// Opened from a one-time reset link that an administrator generated and shared.
const ResetPassword = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/api/users/reset-password", { token, newPassword: form.newPassword });
      toast.success("Password reset. Please sign in.");
      navigate(PATHS.login);
    } catch (err) {
      setError(getErrorMessage(err, "Could not reset password."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="auth-container">
        <h2>Reset your password</h2>
        {!token ? (
          <p className="auth-text">
            This page needs the reset link from your administrator. Ask them to
            generate a new one.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <input type="password" name="newPassword" placeholder={`New password (min. ${MIN_PASSWORD_LENGTH}, letters and numbers)`}
              value={form.newPassword} onChange={handleChange} minLength={MIN_PASSWORD_LENGTH} required autoComplete="new-password" />
            <input type="password" name="confirmPassword" placeholder="Confirm new password"
              value={form.confirmPassword} onChange={handleChange} required autoComplete="new-password" />
            {error && <p className="error" role="alert">{error}</p>}
            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? "Saving…" : "Reset password"}
            </button>
          </form>
        )}
        <div className="auth-links">
          <Link to={PATHS.login}>Back to Login</Link>
        </div>
      </div>
    </PageLayout>
  );
};

export default ResetPassword;
