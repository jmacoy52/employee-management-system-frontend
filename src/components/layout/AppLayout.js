import React from "react";
import Footer from "./Footer";

// Signed-in page frame: role nav, page heading (title, optional subtitle and actions),
// page content, and the compact footer.
const AppLayout = ({ nav, title, subtitle, actions, children, className = "", width = "wide" }) => (
  <div className={`app-shell ${className}`.trim()}>
    {nav}
    <main className={`app-main app-main-${width}`}>
      {(title || actions) && (
        <header className="page-header">
          <div className="page-header-text">
            {title && <h1 className="page-title">{title}</h1>}
            {subtitle && <p className="page-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="page-actions">{actions}</div>}
        </header>
      )}
      {children}
    </main>
    <Footer variant="compact" />
  </div>
);

export default AppLayout;
