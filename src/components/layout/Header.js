import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, CircleHelp } from "lucide-react";
import Logo from "../brand/Logo";
import Modal from "../common/Modal";
import { isDemoMode } from "../../config/demo";
import "./Header.css";

// Public pages: logo, section links, Help and Sign in. Collapses into a menu on small screens.
const SECTION_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#why", label: "Why EmploCore" },
  { href: "/#organisations", label: "For organisations" },
  { href: "/#demo", label: "Demo", demoOnly: true },
];

const Header = () => {
  const [showHelp, setShowHelp] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const toggleHelp = () => {
    setShowHelp(!showHelp);
    setMenuOpen(false);
  };

  // Close the mobile menu whenever the page changes.
  useEffect(() => setMenuOpen(false), [location.pathname, location.hash]);

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <Logo to="/" />
          <button
            type="button"
            className="icon-btn header-menu-btn"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="public-nav"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <nav id="public-nav" className={`navbar ${menuOpen ? "open" : ""}`} aria-label="Main">
            <ul className="navbar-links">
              {SECTION_LINKS.filter((l) => !l.demoOnly || isDemoMode()).map((l) => (
                <li key={l.href}>
                  <a href={l.href}>{l.label}</a>
                </li>
              ))}
              <li>
                <NavLink to="/contact">Contact</NavLink>
              </li>
            </ul>
            <div className="navbar-actions">
              <button type="button" onClick={toggleHelp} className="btn btn-ghost help-btn">
                <CircleHelp size={18} /> Help
              </button>
              <Link to="/login" className="btn btn-primary signin">Sign In</Link>
            </div>
          </nav>
        </div>
      </header>

      <Modal isOpen={showHelp} onClose={toggleHelp} title="Help & Support">
        <div className="help-sections">
          <div className="help-section">
            <h4>Getting Started</h4>
            <p>Welcome to EmploCore! Sign in with the account your organisation's admin or HR team created for you. Setting up EmploCore for your organisation? Use Register your organisation.{isDemoMode() && " You can also try one of the demo logins on the home page."}</p>
          </div>
          <div className="help-section">
            <h4>User Roles</h4>
            <ul>
              <li><strong>Admin:</strong> Full access to user management, audit logs, and HR functions.</li>
              <li><strong>HR:</strong> Manage employee records and departments, and link records to user accounts.</li>
              <li><strong>Employee:</strong> View and update your own profile and see your employment record.</li>
            </ul>
          </div>
          <div className="help-section">
            <h4>Features</h4>
            <ul>
              <li>Role-based access for administrators, HR and employees</li>
              <li>Staff records organised by department</li>
              <li>Self-service profiles for employees</li>
              <li>An audit trail of sign-ins and changes</li>
              <li>Works on phone, tablet and desktop</li>
            </ul>
          </div>
          <div className="help-section">
            <h4>Need More Help?</h4>
            <p>Contact your system administrator or refer to the <a href="https://docs.google.com/document/d/1pUthuDwy0-GOIGQ5uUa88VbBpJwvW4poGGqxuwasj10/edit?usp=sharing" target="_blank" rel="noopener noreferrer">documentation</a>.</p>
          </div>
        </div>
        <div className="form-actions">
          <button type="button" onClick={toggleHelp} className="btn btn-primary close-help">Close</button>
        </div>
      </Modal>
    </>
  );
};

export default Header;


// This Header component serves as the top navigation bar for the application.
