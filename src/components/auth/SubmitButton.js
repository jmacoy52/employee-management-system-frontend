import React from "react";

// Primary submit button with a spinner while the request is running.
const SubmitButton = ({ loading, loadingText, children, className = "" }) => (
  <button type="submit" className={`btn btn-primary btn-lg btn-block ${className}`.trim()} disabled={loading} aria-busy={loading}>
    {loading && <span className="spinner" aria-hidden="true" />}
    {loading ? loadingText : children}
  </button>
);

export default SubmitButton;
