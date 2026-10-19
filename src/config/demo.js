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
    summary: "Add, edit and delete employee records and link them to user accounts.",
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

export const findDemoAccount = (key) => DEMO_ACCOUNTS.find((a) => a.key === key) || null;

export const PORTFOLIO_URL = "https://mjay-portfolio.vercel.app";
export const GITHUB_URL = "https://github.com/jmacoy52";
