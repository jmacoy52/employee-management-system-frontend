// Demo mode: the public portfolio deployment shows demo logins on the landing and sign-in
// pages. Set REACT_APP_DEMO_MODE=false (Vercel env, or .env.production) for a real deployment;
// the demo logins, "Try the demo" buttons and demo-account badges then disappear.
// Read at call time so tests can switch it; the build inlines the value.
export const isDemoMode = () => String(process.env.REACT_APP_DEMO_MODE).toLowerCase() === "true";

// Public demo accounts (seeded by the backend's db/seed.sql). They are shown on the
// landing and sign-in pages on purpose so visitors can try each role.
export const DEMO_ACCOUNTS = [
  {
    key: "admin",
    role: "Admin",
    name: "Nana Agyeman",
    email: "admin@emplocore.demo",
    password: "Admin@EmploCore2026",
    summary: "Manage user accounts, roles and passwords, and read the audit log.",
  },
  {
    key: "hr",
    role: "HR",
    name: "Adwoa Boateng",
    email: "hr@emplocore.demo",
    password: "Hr@EmploCore2026",
    summary: "Manage departments and employee records, and link records to user accounts.",
  },
  {
    key: "employee",
    role: "Employee",
    name: "Kwame Mensah",
    email: "kwame.mensah@emplocore.demo",
    password: "Staff@EmploCore2026",
    summary: "See your own profile and employment record, and change your password.",
  },
];

export const findDemoAccount = (key) => (isDemoMode() && DEMO_ACCOUNTS.find((a) => a.key === key)) || null;

// The backend refuses destructive changes to these logins (403), so the UI labels them.
export const isDemoEmail = (email) =>
  isDemoMode() && DEMO_ACCOUNTS.some((a) => a.email === String(email || "").trim().toLowerCase());

export const PORTFOLIO_URL = "https://mjay-portfolio.vercel.app";
