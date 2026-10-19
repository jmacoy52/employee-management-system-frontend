import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import api, { getErrorMessage } from "../../api/client";
import AuthLayout from "../../components/auth/AuthLayout";
import PasswordInput from "../../components/auth/PasswordInput";
import SubmitButton from "../../components/auth/SubmitButton";
import { PATHS } from "../../routes/paths";

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
    <AuthLayout
      title="Reset your password"
      subtitle={token ? "Choose a new password for your account." : undefined}
      footer={<Link to={PATHS.login}>Back to Login</Link>}
    >
      {!token ? (
        <p className="auth-text">
          This page needs the reset link from your administrator. Ask them to
          generate a new one.
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="reset-new">New password</label>
            <PasswordInput id="reset-new" name="newPassword" placeholder={`Min. ${MIN_PASSWORD_LENGTH} characters, letters and numbers`}
              value={form.newPassword} onChange={handleChange} minLength={MIN_PASSWORD_LENGTH} required autoComplete="new-password" />
          </div>
          <div className="field">
            <label htmlFor="reset-confirm">Confirm new password</label>
            <PasswordInput id="reset-confirm" name="confirmPassword" placeholder="Type it again"
              value={form.confirmPassword} onChange={handleChange} required autoComplete="new-password" />
          </div>
          {error && <p className="error" role="alert">{error}</p>}
          <SubmitButton loading={loading} loadingText="Saving…">
            Reset password
          </SubmitButton>
        </form>
      )}
    </AuthLayout>
  );
};

export default ResetPassword;
