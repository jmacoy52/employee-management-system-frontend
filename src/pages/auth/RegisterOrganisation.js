import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, CheckCircle2, Info } from "lucide-react";
import api, { getErrorMessage } from "../../api/client";
import AuthLayout from "../../components/auth/AuthLayout";
import PasswordInput from "../../components/auth/PasswordInput";
import SubmitButton from "../../components/auth/SubmitButton";
import { passwordProblem } from "./Register";

const EMPTY = { organizationName: "", adminName: "", email: "", password: "", website: "" };

// Public "Register your organisation": creates the organisation (pending) and its first
// administrator. The administrator can sign in once EmploCore has approved the organisation.
const RegisterOrganisation = () => {
  const [form, setForm] = useState(EMPTY);
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(null); // { name, message }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === "password" && passwordError) setPasswordError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const problem = passwordProblem(form.password);
    if (problem) {
      setPasswordError(problem);
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/api/organizations/register", form);
      setDone({ name: res.data.organization?.name || form.organizationName, message: res.data.message });
      setForm(EMPTY);
    } catch (err) {
      setError(getErrorMessage(err, "Registration failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <AuthLayout title="Registration received" footer={<span><Link to="/">Back to Home</Link></span>}>
        <div className="register-success" role="status">
          <CheckCircle2 size={40} aria-hidden="true" />
          <h2>{done.name} is registered</h2>
          <p>
            Your organisation is waiting for approval. Once EmploCore has approved it, sign in
            with the e-mail and password you just chose, then add your HR team and staff.
          </p>
          <Link to="/login" className="btn btn-primary btn-block">Go to sign in</Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Register your organisation"
      subtitle="Set up EmploCore for your team. You will be the first administrator."
      footer={
        <span>
          Already registered? <Link to="/login">Sign in</Link> · Want a walkthrough first? <Link to="/contact">Request a demo</Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="register-org-form">
        <div className="field">
          <label htmlFor="org-name">Organisation name</label>
          <input id="org-name" name="organizationName" type="text" placeholder="e.g. Accra Logistics Ltd" autoComplete="organization" minLength={2} maxLength={150} value={form.organizationName} onChange={handleChange} required />
        </div>
        <div className="field">
          <label htmlFor="org-admin-name">Your name</label>
          <input id="org-admin-name" name="adminName" type="text" placeholder="e.g. Ama Owusu" autoComplete="name" minLength={2} maxLength={100} value={form.adminName} onChange={handleChange} required />
        </div>
        <div className="field">
          <label htmlFor="org-email">Work e-mail</label>
          <input id="org-email" name="email" type="email" placeholder="you@yourorganisation.com" autoComplete="email" maxLength={150} value={form.email} onChange={handleChange} required />
          <p className="field-hint">You will sign in with this address as the organisation&apos;s administrator.</p>
        </div>
        <div className="field">
          <label htmlFor="org-password">Password</label>
          <PasswordInput
            id="org-password"
            name="password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            minLength={8}
            aria-invalid={Boolean(passwordError)}
            aria-describedby="org-password-help"
            required
          />
          {passwordError ? (
            <p id="org-password-help" className="field-error error" role="alert">{passwordError}</p>
          ) : (
            <p id="org-password-help" className="field-hint">Use 8+ characters with at least one letter and one number.</p>
          )}
        </div>
        {/* Left empty by people; filled in by bots */}
        <div className="hp-field" aria-hidden="true">
          <label htmlFor="org-website">Website</label>
          <input id="org-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={handleChange} />
        </div>
        <p className="auth-hint waking">
          <Info size={16} aria-hidden="true" />
          New organisations are checked and approved by EmploCore before anyone can sign in.
        </p>
        {loading && (
          <p className="auth-hint waking" role="status">
            <Loader2 size={16} className="spin-icon" aria-hidden="true" />
            Contacting the server… if it has been asleep this can take up to a minute.
          </p>
        )}
        {error && <p className="error" role="alert">{error}</p>}
        <SubmitButton loading={loading} loadingText="Registering…" className="btn-register">
          Register organisation
        </SubmitButton>
      </form>
    </AuthLayout>
  );
};

export default RegisterOrganisation;
