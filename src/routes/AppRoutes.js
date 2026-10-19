import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import { PATHS, LEGACY_REDIRECTS } from "./paths";

import Home from "../pages/public/Home";
import Privacy from "../pages/public/Privacy";
import Terms from "../pages/public/Terms";
import Contact from "../pages/public/Contact";
import Pricing from "../pages/public/Pricing";
import Billing from "../pages/billing/Billing";
import BillingCallback, { BillingCallbackRedirect } from "../pages/billing/BillingCallback";
import OwnerPlans from "../pages/owner/OwnerPlans";
import OwnerBilling from "../pages/owner/OwnerBilling";
import NotFound from "../pages/public/NotFound";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import RegisterOrganisation from "../pages/auth/RegisterOrganisation";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import ChangePassword from "../pages/auth/ChangePassword";
import EmployeeDashboard from "../pages/employee/EmployeeDashboard";
import HRDashboard from "../pages/hr/HRDashboard";
import EmployeeListPage from "../pages/hr/EmployeeListPage";
import AddEmployeePage from "../pages/hr/AddEmployeePage";
import MyProfilePage from "../pages/hr/MyProfilePage";
import DepartmentsPage from "../pages/hr/DepartmentsPage";
import AdminDashboard from "../pages/admin/AdminDashboard";
import UserList from "../pages/admin/UserList";
import UserManagement from "../pages/admin/UserManagement";
import AuditLog from "../pages/admin/AuditLog";
import OwnerOverview from "../pages/owner/OwnerOverview";
import OwnerOrganisations from "../pages/owner/OwnerOrganisations";
import OwnerOrganisationDetail from "../pages/owner/OwnerOrganisationDetail";
import OwnerAdmins from "../pages/owner/OwnerAdmins";
import OwnerAuditLog from "../pages/owner/OwnerAuditLog";
import OwnerEnquiries from "../pages/owner/OwnerEnquiries";
import OwnerAccount from "../pages/owner/OwnerAccount";
import MyPayslips from "../pages/payroll/MyPayslips";
import PayslipPage from "../pages/payroll/PayslipPage";
import PayrollPage from "../pages/payroll/PayrollPage";
import PayrollRunPage from "../pages/payroll/PayrollRunPage";

const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path={PATHS.home} element={<Home />} />
    <Route path={PATHS.login} element={<Login />} />
    <Route path={PATHS.register} element={<Register />} />
    <Route path={PATHS.registerOrganisation} element={<RegisterOrganisation />} />
    <Route path={PATHS.forgotPassword} element={<ForgotPassword />} />
    <Route path={PATHS.resetPassword} element={<ResetPassword />} />
    <Route path={PATHS.privacy} element={<Privacy />} />
    <Route path={PATHS.terms} element={<Terms />} />
    <Route path={PATHS.contact} element={<Contact />} />
    <Route path={PATHS.pricing} element={<Pricing />} />
    <Route path={PATHS.billingCallback} element={<BillingCallbackRedirect />} />
    {/* Public: the payer may be signed out (another device or an expired session) */}
    <Route path={PATHS.adminBillingCallback} element={<BillingCallback />} />

    {/* Employee (any signed-in role) */}
    <Route element={<PrivateRoute allowedRoles={["employee", "hr", "admin"]} />}>
      <Route path={PATHS.employee} element={<EmployeeDashboard />} />
      <Route path={PATHS.employeePayslips} element={<MyPayslips />} />
      <Route path={PATHS.employeePayslip} element={<PayslipPage mode="employee" />} />
    </Route>

    {/* Any signed-in account, including the platform owner */}
    <Route element={<PrivateRoute allowedRoles={["employee", "hr", "admin", "owner"]} />}>
      <Route path={PATHS.changePassword} element={<ChangePassword />} />
    </Route>

    {/* Platform owner console */}
    <Route element={<PrivateRoute allowedRoles={["owner"]} />}>
      <Route path={PATHS.owner} element={<OwnerOverview />} />
      <Route path={PATHS.ownerOrganisations} element={<OwnerOrganisations />} />
      <Route path={PATHS.ownerOrganisation} element={<OwnerOrganisationDetail />} />
      <Route path={PATHS.ownerAdmins} element={<OwnerAdmins />} />
      <Route path={PATHS.ownerUsers} element={<Navigate to={PATHS.ownerAdmins} replace />} />
      <Route path={PATHS.ownerAuditLog} element={<OwnerAuditLog />} />
      <Route path={PATHS.ownerEnquiries} element={<OwnerEnquiries />} />
      <Route path={PATHS.ownerAccount} element={<OwnerAccount />} />
      <Route path={PATHS.ownerBilling} element={<OwnerBilling />} />
      <Route path={PATHS.ownerPlans} element={<OwnerPlans />} />
    </Route>

    {/* HR (admins are allowed too) */}
    <Route element={<PrivateRoute allowedRoles={["hr", "admin"]} />}>
      <Route path={PATHS.hr} element={<HRDashboard />} />
      <Route path={PATHS.hrEmployees} element={<EmployeeListPage />} />
      <Route path={PATHS.hrCreateEmployee} element={<AddEmployeePage />} />
      <Route path={PATHS.hrProfile} element={<MyProfilePage />} />
      <Route path={PATHS.hrDepartments} element={<DepartmentsPage />} />
      <Route path={PATHS.hrPayroll} element={<PayrollPage />} />
      <Route path={PATHS.hrPayrollRun} element={<PayrollRunPage />} />
      <Route path={PATHS.hrPayslip} element={<PayslipPage mode="hr" />} />
    </Route>

    {/* Admin */}
    <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
      <Route path={PATHS.admin} element={<AdminDashboard />} />
      <Route path={PATHS.adminUsers} element={<UserList />} />
      <Route path={PATHS.adminUserManagement} element={<UserManagement />} />
      <Route path={PATHS.adminAuditLog} element={<AuditLog />} />
      <Route path={PATHS.adminBilling} element={<Billing />} />
      <Route path={PATHS.adminHr} element={<HRDashboard />} />
      <Route path={PATHS.adminDepartments} element={<DepartmentsPage />} />
      <Route path={PATHS.adminPayroll} element={<PayrollPage />} />
      <Route path={PATHS.adminPayrollRun} element={<PayrollRunPage />} />
      <Route path={PATHS.adminPayslip} element={<PayslipPage mode="hr" />} />
    </Route>

    {/* Old URLs keep working */}
    {Object.entries(LEGACY_REDIRECTS).map(([from, to]) => (
      <Route key={from} path={from} element={<Navigate to={to} replace />} />
    ))}

    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
