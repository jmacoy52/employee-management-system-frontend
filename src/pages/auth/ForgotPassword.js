import React from "react";
import { Link } from "react-router-dom";
import { KeyRound, Link2 } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";

// EmploCore accounts are managed by administrators, so password resets are
// handled by them rather than by a self-service email flow.
const ForgotPassword = () => (
  <AuthLayout
    title="Forgot your password?"
    subtitle="Password resets are handled by your organisation's EmploCore administrator."
    footer={
      <>
        <Link to="/login">Back to Login</Link>
        <Link to="/">Back to Home</Link>
      </>
    }
  >
    <p className="auth-text">
      Please contact your administrator and ask them to reset your password. They can either:
    </p>
    <ul className="reset-options">
      <li>
        <KeyRound size={18} aria-hidden="true" />
        <span>give you a <strong>temporary password</strong>; you will choose a new one when you sign in, or</span>
      </li>
      <li>
        <Link2 size={18} aria-hidden="true" />
        <span>send you a <strong>one-time reset link</strong>.</span>
      </li>
    </ul>
    <p className="auth-text">
      Once your password has been reset, you can sign in again.
    </p>
  </AuthLayout>
);

export default ForgotPassword;
