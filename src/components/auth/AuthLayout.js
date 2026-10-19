import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Users, ScrollText } from "lucide-react";
import Logo from "../brand/Logo";
import "./AuthLayout.css";

// Split sign-in layout: brand panel on the left (hidden on small screens), form card on the right.
const AuthLayout = ({ title, subtitle, children, footer }) => (
  <div className="auth-page">
    <aside className="auth-brand">
      <Logo to="/" tone="light" />
      <div className="auth-brand-body">
        <h2>One place for employee records, roles and access.</h2>
        <ul>
          <li><ShieldCheck size={18} /> Admin, HR and employee dashboards</li>
          <li><Users size={18} /> Employee records linked to user accounts</li>
          <li><ScrollText size={18} /> Every important change in the audit log</li>
        </ul>
      </div>
      <p className="auth-brand-foot">Built by Joseph Migbodzi</p>
    </aside>

    <main className="auth-main">
      <div className="auth-topbar">
        <Logo to="/" />
        <Link to="/" className="auth-home-link">Back to Home</Link>
      </div>
      <div className="auth-container">
        <h1 className="auth-title">{title}</h1>
        {subtitle && <p className="auth-subtitle">{subtitle}</p>}
        {children}
        {footer && <div className="auth-links">{footer}</div>}
      </div>
      <p className="auth-legal">
        <Link to="/privacy">Privacy</Link> · <Link to="/terms">Terms</Link> · <Link to="/contact">Contact</Link>
      </p>
    </main>
  </div>
);

export default AuthLayout;
