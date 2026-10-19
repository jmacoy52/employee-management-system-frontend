import React from "react";
import { Link } from "react-router-dom";
import PageLayout from "../../components/layout/PageLayout";
import "./Login.css";

// EmploCore accounts are managed by administrators, so password resets are
// handled by them rather than by a self-service email flow.
const ForgotPassword = () => (
  <PageLayout>
    <div className="auth-container">
      <h2>Forgot your password?</h2>
      <p className="auth-text">
        Password resets are handled by your organisation's EmploCore
        administrator. Please contact your administrator and ask them to reset
        your password. They can either give you a temporary password (you will
        choose a new one when you sign in) or send you a one-time reset link.
      </p>
      <p className="auth-text">
        Once your password has been reset, you can sign in again.
      </p>
      <div className="auth-links">
        <Link to="/login">Back to Login</Link>
        <Link to="/">Back to Home</Link>
      </div>
    </div>
  </PageLayout>
);

export default ForgotPassword;
