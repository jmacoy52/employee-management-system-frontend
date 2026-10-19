import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api, { getErrorMessage } from "../../api/client";
import AuthLayout from "../../components/auth/AuthLayout";
import AppLayout from "../../components/layout/AppLayout";
import AdminNav from "../../components/layout/AdminNav";
import HRNav from "../../components/layout/HRNav";
import EmployeeNav from "../../components/layout/EmployeeNav";
import OwnerNav from "../../components/layout/OwnerNav";
import PasswordInput from "../../components/auth/PasswordInput";
import SubmitButton from "../../components/auth/SubmitButton";
import { ROLE_HOME, PATHS } from "../../routes/paths";
import { getStoredUser, saveSession } from "../../auth/session";

const MIN_PASSWORD_LENGTH = 8;

const NAV_FOR_ROLE = { owner: OwnerNav, admin: AdminNav, hr: HRNav, employee: EmployeeNav };

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

  const formEl = (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="cp-current">{forced ? "Temporary password" : "Current password"}</label>
        <PasswordInput id="cp-current" name="currentPassword" placeholder={forced ? "The password your administrator gave you" : "Your current password"}
          value={form.currentPassword} onChange={handleChange} required autoComplete="current-password" />
      </div>
      <div className="field">
        <label htmlFor="cp-new">New password</label>
        <PasswordInput id="cp-new" name="newPassword" placeholder={`Min. ${MIN_PASSWORD_LENGTH} characters, letters and numbers`}
          value={form.newPassword} onChange={handleChange} minLength={MIN_PASSWORD_LENGTH} required autoComplete="new-password" />
      </div>
      <div className="field">
        <label htmlFor="cp-confirm">Confirm new password</label>
        <PasswordInput id="cp-confirm" name="confirmPassword" placeholder="Type it again"
          value={form.confirmPassword} onChange={handleChange} required autoComplete="new-password" />
      </div>
      {error && <p className="error" role="alert">{error}</p>}
      <SubmitButton loading={loading} loadingText="Saving…">
        Change password
      </SubmitButton>
    </form>
  );

  // Forced change (temporary password): the full-screen sign-in layout, no navigation.
  if (forced || !user) {
    return (
      <AuthLayout
        title="Set a new password"
        subtitle="Your administrator gave you a temporary password. Choose your own password to continue."
      >
        {formEl}
      </AuthLayout>
    );
  }

  const Nav = NAV_FOR_ROLE[user.role] || EmployeeNav;
  return (
    <AppLayout
      nav={<Nav />}
      title="Change password"
      subtitle="Other devices signed in to your account will be signed out."
      width="narrow"
    >
      <div className="card change-password-card">
        {formEl}
        <div className="auth-links">
          <Link to={ROLE_HOME[user.role] || PATHS.employee}>Back to dashboard</Link>
        </div>
      </div>
    </AppLayout>
  );
};

export default ChangePassword;
