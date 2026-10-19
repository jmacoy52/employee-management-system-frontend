import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import { PATHS, LEGACY_REDIRECTS } from "./paths";

import Home from "../pages/public/Home";
import Privacy from "../pages/public/Privacy";
import Terms from "../pages/public/Terms";
import Contact from "../pages/public/Contact";
import NotFound from "../pages/public/NotFound";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
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

const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path={PATHS.home} element={<Home />} />
    <Route path={PATHS.login} element={<Login />} />
    <Route path={PATHS.register} element={<Register />} />
    <Route path={PATHS.forgotPassword} element={<ForgotPassword />} />
    <Route path={PATHS.resetPassword} element={<ResetPassword />} />
    <Route path={PATHS.privacy} element={<Privacy />} />
    <Route path={PATHS.terms} element={<Terms />} />
    <Route path={PATHS.contact} element={<Contact />} />

    {/* Employee (any signed-in role) */}
    <Route element={<PrivateRoute allowedRoles={["employee", "hr", "admin"]} />}>
      <Route path={PATHS.employee} element={<EmployeeDashboard />} />
      <Route path={PATHS.changePassword} element={<ChangePassword />} />
    </Route>

    {/* HR (admins are allowed too) */}
    <Route element={<PrivateRoute allowedRoles={["hr", "admin"]} />}>
      <Route path={PATHS.hr} element={<HRDashboard />} />
      <Route path={PATHS.hrEmployees} element={<EmployeeListPage />} />
      <Route path={PATHS.hrCreateEmployee} element={<AddEmployeePage />} />
      <Route path={PATHS.hrProfile} element={<MyProfilePage />} />
      <Route path={PATHS.hrDepartments} element={<DepartmentsPage />} />
    </Route>

    {/* Admin */}
    <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
      <Route path={PATHS.admin} element={<AdminDashboard />} />
      <Route path={PATHS.adminUsers} element={<UserList />} />
      <Route path={PATHS.adminUserManagement} element={<UserManagement />} />
      <Route path={PATHS.adminAuditLog} element={<AuditLog />} />
      <Route path={PATHS.adminHr} element={<HRDashboard />} />
      <Route path={PATHS.adminDepartments} element={<DepartmentsPage />} />
    </Route>

    {/* Old URLs keep working */}
    {Object.entries(LEGACY_REDIRECTS).map(([from, to]) => (
      <Route key={from} path={from} element={<Navigate to={to} replace />} />
    ))}

    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
