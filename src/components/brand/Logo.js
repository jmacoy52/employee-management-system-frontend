import React from "react";
import { Link } from "react-router-dom";
import "./Logo.css";

// EmploCore mark: three blocks forming an "E" on a rounded tile. The short teal
// middle block is the "core" (the one record everything else hangs off).
// Kept in sync with public/favicon.svg.
export const LogoMark = ({ size = 32, title }) => (
  <svg
    className="logo-mark"
    width={size}
    height={size}
    viewBox="0 0 32 32"
    role={title ? "img" : undefined}
    aria-hidden={title ? undefined : true}
    aria-label={title}
    focusable="false"
  >
    <rect width="32" height="32" rx="8" fill="#2453D6" />
    <rect x="8.5" y="7.5" width="15" height="4" rx="2" fill="#FFFFFF" />
    <rect x="8.5" y="7.5" width="4" height="17" rx="2" fill="#FFFFFF" />
    <rect x="8.5" y="20.5" width="15" height="4" rx="2" fill="#FFFFFF" />
    <rect x="14.5" y="14" width="7" height="4" rx="2" fill="#5EEAD4" />
  </svg>
);

// Mark + "EmploCore" wordmark. tone="light" for dark backgrounds.
const Logo = ({ to, tone = "dark", size = 32, className = "" }) => {
  const content = (
    <>
      <LogoMark size={size} />
      <span className="logo-word">
        Emplo<span className="logo-word-core">Core</span>
      </span>
    </>
  );
  const classes = `logo logo-${tone} ${className}`.trim();
  if (to) {
    return (
      <Link to={to} className={classes} aria-label="EmploCore home">
        {content}
      </Link>
    );
  }
  return <span className={classes}>{content}</span>;
};

export default Logo;
