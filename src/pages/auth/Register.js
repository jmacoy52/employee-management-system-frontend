import React from "react";
import { Link } from "react-router-dom";
import { Users, Building2, ArrowRight, LogIn } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";

const MIN_PASSWORD_LENGTH = 8;

// Returns the first problem with a password, or "" when it is acceptable.
// (Shared with the organisation sign-up form; the backend applies the same rules.)
export function passwordProblem(password) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return "Password must contain at least one letter and one number.";
  }
  return "";
}

// There is no public employee sign-up: accounts belong to an organisation and are created by
// its admin or HR team. This page (kept at /register for old links) explains where to go.
const Register = () => (
  <AuthLayout
    title="Create an account"
    subtitle="EmploCore accounts belong to an organisation."
    footer={
      <span>
        Already have an account? <Link to="/login">Sign in</Link>
      </span>
    }
  >
    <div className="register-choice">
      <section className="register-option">
        <h2><Users size={18} aria-hidden="true" /> Joining your organisation?</h2>
        <p>
          Your organisation&apos;s admin or HR team creates your account and gives you your
          sign-in details. Ask them for an account, then sign in.
        </p>
        <Link to="/login" className="btn btn-secondary btn-block">
          <LogIn size={16} aria-hidden="true" /> Sign in
        </Link>
      </section>
      <section className="register-option">
        <h2><Building2 size={18} aria-hidden="true" /> Setting up EmploCore for your organisation?</h2>
        <p>Register your organisation and its first administrator account.</p>
        <Link to="/register-organisation" className="btn btn-primary btn-block register-org-cta">
          Register your organisation <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </section>
    </div>
  </AuthLayout>
);

export default Register;
