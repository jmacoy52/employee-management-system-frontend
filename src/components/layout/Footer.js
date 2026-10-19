import React from "react";
import { Link } from "react-router-dom";
import Logo from "../brand/Logo";
import { PORTFOLIO_URL, isDemoMode } from "../../config/demo";
import "./Footer.css";

// variant="compact" is used inside the signed-in app; the full footer on public pages.
const Footer = ({ variant = "full" }) => {
  const year = new Date().getFullYear();

  if (variant === "compact") {
    return (
      <footer className="footer footer-compact">
        <p>&copy; {year} EmploCore. All rights reserved.</p>
        <div className="footer-links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/contact">Contact</Link>
        </div>
      </footer>
    );
  }

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Logo to="/" tone="light" />
          <p>
            Staff records, departments and controlled access, with a full audit
            trail, for growing organisations.
          </p>
        </div>
        <nav className="footer-col" aria-label="Product">
          <h4>Product</h4>
          <a href="/#features">Features</a>
          <a href="/#why">Why EmploCore</a>
          <a href="/#organisations">For organisations</a>
          {isDemoMode() && <a href="/#demo">Demo logins</a>}
          <Link to="/login">Sign in</Link>
        </nav>
        <nav className="footer-col" aria-label="Legal">
          <h4>Legal</h4>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms</Link>
        </nav>
        <nav className="footer-col" aria-label="Company">
          <h4>Company</h4>
          <Link to="/contact">Request a demo</Link>
          <Link to="/contact">Contact us</Link>
        </nav>
      </div>
      <div className="footer-bottom">
        <p>&copy; {year} EmploCore. All rights reserved.</p>
        <p>
          Built by{" "}
          <a href={PORTFOLIO_URL} target="_blank" rel="noopener noreferrer">Joseph Migbodzi</a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
