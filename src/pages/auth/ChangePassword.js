import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api, { getErrorMessage } from "../../api/client";
import PageLayout from "../../components/layout/PageLayout";
import { ROLE_HOME, PATHS } from "../../routes/paths";
import { getStoredUser, saveSession } from "../../auth/session";
import "./Login.css";

const MIN_PASSWORD_LENGTH = 8;

// Change own password. Also used to replace an admin-issued temporary password.
const ChangePassword = () => {
  const navigate = useNavigate();
  const user = getStoredUser();
  const forced = Boolean(user?.mustChangePassword);
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`New password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.put("/api/users/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      saveSession(res.data.token, res.data.user); // other devices are signed out; this one continues
      toast.success("Password changed.");
      navigate(ROLE_HOME[res.data.user.role] || PATHS.employee);
    } catch (err) {
      setError(getErrorMessage(err, "Could not change password."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="auth-container">
        <h2>{forced ? "Set a new password" : "Change password"}</h2>
        {forced && (
          <p className="auth-text">
            Your administrator gave you a temporary password. Choose your own
            password to continue.
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <input type="password" name="currentPassword" placeholder={forced ? "Temporary password" : "Current password"}
            value={form.currentPassword} onChange={handleChange} required autoComplete="current-password" />
          <input type="password" name="newPassword" placeholder={`New password (min. ${MIN_PASSWORD_LENGTH}, letters and numbers)`}
            value={form.newPassword} onChange={handleChange} minLength={MIN_PASSWORD_LENGTH} required autoComplete="new-password" />
          <input type="password" name="confirmPassword" placeholder="Confirm new password"
            value={form.confirmPassword} onChange={handleChange} required autoComplete="new-password" />
          {error && <p className="error" role="alert">{error}</p>}
          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? "Saving…" : "Change password"}
          </button>
        </form>
        {!forced && user && (
          <div className="auth-links">
            <Link to={ROLE_HOME[user.role] || PATHS.employee}>Back to dashboard</Link>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default ChangePassword;
