import React from "react";
import { Link } from "react-router-dom";
import PageLayout from "../PageLayout";

const NotFound = () => (
  <PageLayout>
    <div className="not-found">
      <p className="code">404</p>
      <h1>Page not found</h1>
      <p>The page you are looking for doesn't exist or has moved.</p>
      <div className="actions">
        <Link to="/" className="btn-link">Go to Home</Link>
        <Link to="/login" className="btn-link outline">Sign In</Link>
      </div>
    </div>
  </PageLayout>
);

export default NotFound;
