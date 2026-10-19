import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import Logo from "../brand/Logo";
import { logout as signOut, getStoredUser } from "../../auth/session";
import "./AppNav.css";

const ROLE_LABEL = { owner: "Platform owner", admin: "Admin", hr: "HR", employee: "Employee" };

// Top bar shared by the admin, HR and employee areas.
//   items:   [{ to, label, icon: LucideIcon, end, badge (count, shown when > 0), badgeLabel }]
//   home:    where the logo links to
//   actions: extra buttons shown before Logout (e.g. "Back to Admin")
const AppNav = ({ items, home, label, actions = null, className = "" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getStoredUser();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [location.pathname]);

  const logout = async () => {
    await signOut();
    navigate("/");
  };

  const displayName = user?.username || user?.email;

  return (
    <nav className={`app-nav ${className}`.trim()} aria-label={label}>
      <div className="app-nav-inner">
        <Logo to={home} />
        <button
          type="button"
          className="icon-btn app-nav-toggle"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className={`app-nav-panel ${open ? "open" : ""}`}>
          <ul className="nav-menu">
            {items.map(({ to, label: text, icon: Icon, end, badge, badgeLabel }) => (
              <li key={to}>
                <NavLink to={to} end={end !== false}>
                  {Icon && <Icon size={17} aria-hidden="true" />} {text}
                  {badge > 0 && (
                    <span className="nav-badge" aria-label={`${badge} ${badgeLabel || ""}`.trim()}>{badge}</span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="nav-right">
            {user && (
              <span className="nav-user" title={user.email}>
                <span className="nav-avatar" aria-hidden="true">
                  {(displayName || "?").trim().charAt(0).toUpperCase()}
                </span>
                <span className="nav-user-text">
                  <span className="nav-user-name">{displayName}</span>
                  <span className="nav-user-role">
                    {ROLE_LABEL[user.role] || user.role}
                    {user.organization?.name && <span className="nav-user-org"> · {user.organization.name}</span>}
                  </span>
                </span>
              </span>
            )}
            {actions}
            <button type="button" className="btn btn-ghost logout-btn" onClick={logout}>
              <LogOut size={17} aria-hidden="true" /> Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AppNav;
