import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api, { getErrorMessage } from "../../api/client";
import OwnerNav from "../../components/layout/OwnerNav";
import AppLayout from "../../components/layout/AppLayout";
import PasswordInput from "../../components/auth/PasswordInput";
import { getStoredUser, saveSession } from "../../auth/session";
import { formatDateTime } from "./ownerShared";
import "./Owner.css";

// Same rules as the API (config/roles.js ownerPasswordProblem): 12+ characters, a letter and a
// number, at least 6 different characters, and not containing the e-mail name.
export function ownerPasswordProblem(password, email = "") {
  const value = String(password || "");
  if (value.length < 12) return "Use at least 12 characters.";
  if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) return "Use at least one letter and one number.";
  if (new Set(value).size < 6) return "Use at least 6 different characters.";
  const local = String(email).split("@")[0].toLowerCase();
  if (local.length >= 4 && value.toLowerCase().includes(local)) return "Do not include your e-mail name in the password.";
  return "";
}

const keepToken = () => localStorage.getItem("token");

// The platform owner's own account: display name and e-mail (the e-mail needs the current
// password), and the password.
const OwnerAccount = () => {
  const [account, setAccount] = useState(null);
  const [details, setDetails] = useState({ name: "", email: "", currentPassword: "" });
  const [savingDetails, setSavingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [savingPw, setSavingPw] = useState(false);
  const [pwError, setPwError] = useState("");

  const load = async () => {
    try {
      const res = await api.get("/api/platform/account");
      setAccount(res.data);
      setDetails({ name: res.data.username, email: res.data.email, currentPassword: "" });
    } catch (err) {
      setDetailsError(getErrorMessage(err, "Failed to load your account."));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const emailChanged = account && details.email.trim().toLowerCase() !== account.email;

  const saveDetails = async (e) => {
    e.preventDefault();
    setDetailsError("");
    if (emailChanged && !details.currentPassword) {
      setDetailsError("Enter your current password to change your e-mail address.");
      return;
    }
    setSavingDetails(true);
    try {
      const res = await api.put("/api/platform/account", {
        name: details.name,
        email: details.email,
        currentPassword: emailChanged ? details.currentPassword : undefined,
      });
      // A new e-mail signs out other sessions and returns a fresh token for this one
      saveSession(res.data.token || keepToken(), { ...getStoredUser(), ...res.data.user });
      toast.success(res.data.message);
      load();
    } catch (err) {
      setDetailsError(getErrorMessage(err, "Failed to update your account."));
    } finally {
      setSavingDetails(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setPwError("");
    const problem = ownerPasswordProblem(pw.newPassword, account?.email);
    if (problem) {
      setPwError(problem);
      return;
    }
    if (pw.newPassword !== pw.confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }
    setSavingPw(true);
    try {
      const res = await api.put("/api/users/change-password", { currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      saveSession(res.data.token, { ...getStoredUser(), ...res.data.user });
      setPw({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password changed. Other sessions have been signed out.");
      load();
    } catch (err) {
      setPwError(getErrorMessage(err, "Could not change the password."));
    } finally {
      setSavingPw(false);
    }
  };

  const changeDetails = (e) => setDetails({ ...details, [e.target.name]: e.target.value });
  const changePw = (e) => setPw({ ...pw, [e.target.name]: e.target.value });

  return (
    <AppLayout nav={<OwnerNav />} title="My account" subtitle="Your platform owner sign-in details. Every change is recorded in the audit log." className="owner-account">
      <div className="owner-account-grid">
        <section className="card card-flush">
          <div className="card-header"><h2 className="card-title">Name and e-mail</h2></div>
          <form className="owner-form account-details-form" onSubmit={saveDetails}>
            <div className="field">
              <label htmlFor="account-name">Display name</label>
              <input id="account-name" name="name" value={details.name} onChange={changeDetails} minLength={2} maxLength={100} autoComplete="name" required />
            </div>
            <div className="field">
              <label htmlFor="account-email">E-mail (used to sign in)</label>
              <input id="account-email" name="email" type="email" value={details.email} onChange={changeDetails} maxLength={150} autoComplete="email" required />
            </div>
            {emailChanged && (
              <div className="field">
                <label htmlFor="account-current-password">Current password</label>
                <PasswordInput id="account-current-password" name="currentPassword" value={details.currentPassword} onChange={changeDetails} autoComplete="current-password" required />
                <p className="field-hint">Needed to change your e-mail. Other sessions will be signed out.</p>
              </div>
            )}
            {detailsError && <p className="error" role="alert">{detailsError}</p>}
            {account && (
              <p className="field-hint">Account created {formatDateTime(account.created_at)}{account.password_changed_at ? ` · password last changed ${formatDateTime(account.password_changed_at)}` : ""}</p>
            )}
            <div className="form-actions">
              <button type="submit" className="btn btn-primary save-account-btn" disabled={savingDetails || !account}>
                {savingDetails && <span className="spinner" aria-hidden="true" />} Save changes
              </button>
            </div>
          </form>
        </section>

        <section className="card card-flush">
          <div className="card-header"><h2 className="card-title">Change password</h2></div>
          <form className="owner-form account-password-form" onSubmit={savePassword}>
            <div className="field">
              <label htmlFor="account-pw-current">Current password</label>
              <PasswordInput id="account-pw-current" name="currentPassword" value={pw.currentPassword} onChange={changePw} autoComplete="current-password" required />
            </div>
            <div className="field">
              <label htmlFor="account-pw-new">New password</label>
              <PasswordInput id="account-pw-new" name="newPassword" value={pw.newPassword} onChange={changePw} autoComplete="new-password" required />
              <p className="field-hint">At least 12 characters with a letter and a number; do not include your e-mail name.</p>
            </div>
            <div className="field">
              <label htmlFor="account-pw-confirm">Confirm new password</label>
              <PasswordInput id="account-pw-confirm" name="confirmPassword" value={pw.confirmPassword} onChange={changePw} autoComplete="new-password" required />
            </div>
            {pwError && <p className="error" role="alert">{pwError}</p>}
            <div className="form-actions">
              <button type="submit" className="btn btn-primary change-password-btn" disabled={savingPw}>
                {savingPw && <span className="spinner" aria-hidden="true" />} Change password
              </button>
            </div>
          </form>
        </section>
      </div>
    </AppLayout>
  );
};

export default OwnerAccount;
