import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Mail, Globe, Building2, CheckCircle2, Loader2 } from "lucide-react";
import PageLayout from "../../components/layout/PageLayout";
import api, { getErrorMessage } from "../../api/client";
import { PORTFOLIO_URL } from "../../config/demo";
import { PHONE_RE } from "../../config/signupOptions";

const CONTACT_EMAIL = "josephmacoy52@gmail.com";
const DEMO_REQUEST_SUBJECT = "EmploCore demo request";
const DEMO_REQUEST_BODY = [
  "Organisation name:",
  "Type of organisation (business, school, NGO, other):",
  "Number of staff:",
  "Number of departments:",
  "How you manage staff records now:",
  "When you would like to start:",
].join("\n");
const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(DEMO_REQUEST_SUBJECT)}&body=${encodeURIComponent(DEMO_REQUEST_BODY)}`;

const EMPTY = { name: "", organizationName: "", email: "", phone: "", message: "", website: "" };

// "Request a demo": stored as an enquiry for the EmploCore team (owner console → Enquiries).
// E-mail stays available as a fallback.
const DemoRequestForm = () => {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState("");

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.phone.trim() && !PHONE_RE.test(form.phone.trim())) {
      setError("Enter a valid phone number (digits, spaces, +, - and brackets), or leave it empty.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/api/enquiries", form);
      setDone(res.data.message);
      setForm(EMPTY);
    } catch (err) {
      setError(getErrorMessage(err, "Your request could not be sent. Please e-mail us instead."));
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="register-success demo-request-done" role="status">
        <CheckCircle2 size={36} aria-hidden="true" />
        <p>{done}</p>
        <button type="button" className="btn btn-secondary" onClick={() => setDone("")}>Send another request</button>
      </div>
    );
  }

  return (
    <form className="demo-request-form" onSubmit={submit}>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="enq-name">Your name</label>
          <input id="enq-name" name="name" autoComplete="name" minLength={2} maxLength={100} value={form.name} onChange={change} required />
        </div>
        <div className="field">
          <label htmlFor="enq-org">Organisation <span className="optional">(optional)</span></label>
          <input id="enq-org" name="organizationName" autoComplete="organization" maxLength={150} value={form.organizationName} onChange={change} />
        </div>
        <div className="field">
          <label htmlFor="enq-email">E-mail</label>
          <input id="enq-email" name="email" type="email" autoComplete="email" maxLength={150} value={form.email} onChange={change} required />
        </div>
        <div className="field">
          <label htmlFor="enq-phone">Phone <span className="optional">(optional)</span></label>
          <input id="enq-phone" name="phone" type="tel" autoComplete="tel" maxLength={25} value={form.phone} onChange={change} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="enq-message">Message</label>
        <textarea
          id="enq-message"
          name="message"
          rows={5}
          minLength={10}
          maxLength={3000}
          placeholder="Tell us a little about your organisation: its size, its departments and how you keep staff records now."
          value={form.message}
          onChange={change}
          required
        />
      </div>
      {/* Left empty by people; filled in by bots */}
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="enq-website">Website</label>
        <input id="enq-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={change} />
      </div>
      {loading && (
        <p className="contact-small" role="status">
          <Loader2 size={14} className="spin-icon" aria-hidden="true" /> Sending… if the server has been asleep this can take up to a minute.
        </p>
      )}
      {error && <p className="error" role="alert">{error}</p>}
      <button type="submit" className="btn btn-primary send-demo-request" disabled={loading}>
        {loading && <span className="spinner" aria-hidden="true" />} Send demo request
      </button>
      <p className="contact-small">
        Prefer e-mail? <a href={mailto} className="request-demo-email">E-mail a demo request</a> to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </form>
  );
};

const Contact = () => {
  const location = useLocation();

  // /contact#request-demo (from the landing page) scrolls to the form
  useEffect(() => {
    if (location.hash === "#request-demo") document.getElementById("request-demo")?.scrollIntoView();
  }, [location.hash]);

  return (
    <PageLayout>
      <article className="content-page">
        <h1>Contact us</h1>
        <p>
          Interested in EmploCore for your organisation? Register your organisation to get
          started straight away, or request a demo and we will walk you through the system first.
        </p>

        <div className="contact-cards">
          <div className="contact-card">
            <h3><Building2 size={18} aria-hidden="true" /> Register your organisation</h3>
            <p>Create your organisation and its first administrator account. We approve new organisations, then you can sign in and add your team.</p>
            <Link to="/register-organisation" className="btn btn-primary register-org-cta">Register your organisation</Link>
          </div>
          <div className="contact-card">
            <h3><Globe size={18} aria-hidden="true" /> Questions and feedback</h3>
            <p>For general questions, feedback or partnership enquiries, email us or get in touch through the developer&apos;s website.</p>
            <a href={PORTFOLIO_URL} target="_blank" rel="noopener noreferrer">
              mjay-portfolio.vercel.app
            </a>
          </div>
        </div>

        <section className="contact-card demo-request-card" id="request-demo" aria-labelledby="request-demo-title">
          <h2 id="request-demo-title"><Mail size={20} aria-hidden="true" /> Request a demo</h2>
          <p>Leave your details and we will get back to you to arrange a walkthrough.</p>
          <DemoRequestForm />
        </section>

        <h2>Need help with your account?</h2>
        <p>
          If you can't sign in, need a password reset or need a different role, please contact your
          organisation's EmploCore administrator or HR team. They manage accounts for your organisation.
        </p>
      </article>
    </PageLayout>
  );
};

export default Contact;
