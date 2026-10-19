// Every route path in one place. Use lowercase kebab-case for new routes.
export const PATHS = {
  home: "/",
  login: "/login",
  register: "/register",
  registerOrganisation: "/register-organisation",
  forgotPassword: "/forgot-password",
  privacy: "/privacy",
  terms: "/terms",
  contact: "/contact",
  pricing: "/pricing",
  resetPassword: "/reset-password",

  changePassword: "/account/password",

  employee: "/employee",
  employeePayslips: "/employee/payslips",
  employeePayslip: "/employee/payslips/:id",

  hr: "/hr",
  hrEmployees: "/hr/employees",
  hrCreateEmployee: "/hr/create-employee",
  hrProfile: "/hr/profile",
  hrDepartments: "/hr/departments",
  hrPayroll: "/hr/payroll",
  hrPayrollRun: "/hr/payroll/:period",
  hrPayslip: "/hr/payslips/:id",

  owner: "/owner",
  ownerOrganisations: "/owner/organisations",
  ownerOrganisation: "/owner/organisations/:id",
  ownerAdmins: "/owner/admins",
  ownerUsers: "/owner/users", // old "All users" page: redirects to ownerAdmins
  ownerAuditLog: "/owner/audit-log",
  ownerEnquiries: "/owner/enquiries",
  ownerAccount: "/owner/account",
  ownerBilling: "/owner/billing",
  ownerPlans: "/owner/plans",

  admin: "/admin",
  adminUsers: "/admin/users",
  adminUserManagement: "/admin/user-management",
  adminAuditLog: "/admin/audit-log",
  adminBilling: "/admin/billing",
  adminBillingCallback: "/admin/billing/callback",
  billingCallback: "/billing/callback", // the Callback URL saved in the Paystack dashboard
  adminHr: "/admin/hr",
  adminDepartments: "/admin/departments",
  adminPayroll: "/admin/payroll",
  adminPayrollRun: "/admin/payroll/:period",
  adminPayslip: "/admin/payslips/:id",
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
  owner: PATHS.owner,
  admin: PATHS.admin,
  hr: PATHS.hr,
  employee: PATHS.employee,
};
