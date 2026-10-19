// Every route path in one place. Use lowercase kebab-case for new routes.
export const PATHS = {
  home: "/",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  privacy: "/privacy",
  terms: "/terms",
  contact: "/contact",
  resetPassword: "/reset-password",

  changePassword: "/account/password",

  employee: "/employee",

  hr: "/hr",
  hrEmployees: "/hr/employees",
  hrCreateEmployee: "/hr/create-employee",
  hrProfile: "/hr/profile",

  admin: "/admin",
  adminUsers: "/admin/users",
  adminUserManagement: "/admin/user-management",
  adminAuditLog: "/admin/audit-log",
  adminHr: "/admin/hr",
};

// Old URLs that may be bookmarked or linked elsewhere -> new URLs.
export const LEGACY_REDIRECTS = {
  "/AdminDashboard": PATHS.admin,
  "/HRDashboard": PATHS.hr,
  "/EmployeeDashboard": PATHS.employee,
  "/admin/usermanagement": PATHS.adminUserManagement,
  "/admin/auditlog": PATHS.adminAuditLog,
};

// Where each role lands after signing in.
export const ROLE_HOME = {
  admin: PATHS.admin,
  hr: PATHS.hr,
  employee: PATHS.employee,
};
