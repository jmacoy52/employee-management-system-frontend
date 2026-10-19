import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, CheckCircle2, Info } from "lucide-react";
import api, { getErrorMessage } from "../../api/client";
import AuthLayout from "../../components/auth/AuthLayout";
import PasswordInput from "../../components/auth/PasswordInput";
import SubmitButton from "../../components/auth/SubmitButton";
import { passwordProblem } from "./Register";
import { ORG_TYPES, SIZE_RANGES, PHONE_RE } from "../../config/signupOptions";

const EMPTY = {
  organizationName: "", organizationType: "", sizeRange: "", country: "Ghana", city: "", phone: "",
  contactName: "", contactEmail: "",
  adminName: "", email: "", password: "", website: "",
};

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
    if (!PHONE_RE.test(form.phone.trim())) {
      setError("Enter a valid phone number (digits, spaces, +, - and brackets).");
      return;
    }
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
        <fieldset className="form-section">
          <legend>Your organisation</legend>
          <div className="field">
            <label htmlFor="org-name">Organisation name</label>
            <input id="org-name" name="organizationName" type="text" placeholder="e.g. Accra Logistics Ltd" autoComplete="organization" minLength={2} maxLength={150} value={form.organizationName} onChange={handleChange} required />
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="org-type">Type of organisation</label>
              <select id="org-type" name="organizationType" value={form.organizationType} onChange={handleChange} required>
                <option value="">Choose…</option>
                {ORG_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="org-size">Number of staff</label>
              <select id="org-size" name="sizeRange" value={form.sizeRange} onChange={handleChange} required>
                <option value="">Choose…</option>
                {SIZE_RANGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="org-country">Country</label>
              <input id="org-country" name="country" type="text" autoComplete="country-name" minLength={2} maxLength={80} value={form.country} onChange={handleChange} required />
            </div>
            <div className="field">
              <label htmlFor="org-city">City or town <span className="optional">(optional)</span></label>
              <input id="org-city" name="city" type="text" placeholder="e.g. Kumasi" autoComplete="address-level2" maxLength={80} value={form.city} onChange={handleChange} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="org-phone">Phone number</label>
            <input id="org-phone" name="phone" type="tel" placeholder="e.g. +233 20 123 4567" autoComplete="tel" maxLength={25} value={form.phone} onChange={handleChange} required />
          </div>
        </fieldset>

        <fieldset className="form-section">
          <legend>Your administrator account</legend>
          <p className="field-hint form-section-note">You will be the organisation&apos;s first administrator and can add HR and staff accounts after approval.</p>
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
        </fieldset>

        <fieldset className="form-section">
          <legend>Contact person <span className="optional">(optional)</span></legend>
          <p className="field-hint form-section-note">Who should EmploCore contact about this registration? Leave empty if it is you.</p>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="org-contact-name">Name</label>
              <input id="org-contact-name" name="contactName" type="text" maxLength={100} value={form.contactName} onChange={handleChange} />
            </div>
            <div className="field">
              <label htmlFor="org-contact-email">E-mail</label>
              <input id="org-contact-email" name="contactEmail" type="email" maxLength={150} value={form.contactEmail} onChange={handleChange} />
            </div>
          </div>
        </fieldset>
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
