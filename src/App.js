import { Toaster } from "react-hot-toast";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Pages/Home";
import Login from "./components/Pages/Auth/Login";
import Register from "./components/Pages/Auth/Register";
import HRDashboard from "./components/Pages/Dashboards/HRDashboard/HRDashboard";
import AdminDashboard from "./components/Pages/Dashboards/AdminDashboard/AdminDashboard";
import PrivateRoute from "./components/Pages/Auth/PrivateRoute";
import UserList from "./components/Pages/Dashboards/AdminDashboard/UserList";
import UserManagement from "./components/Pages/Dashboards/AdminDashboard/UserManagement";
import AuditLog from "./components/Pages/Dashboards/AdminDashboard/AuditLog";
import EmployeeListPage from "./components/Pages/Dashboards/HRDashboard/EmployeeListPage";
import AddEmployeePage from "./components/Pages/Dashboards/HRDashboard/AddEmployeePage";
import MyProfilePage from "./components/Pages/Dashboards/HRDashboard/MyProfilePage";

import './App.css';

function App() {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* HR Routes - Protected */}
        <Route element={<PrivateRoute allowedRoles={["hr", "admin"]} />}>
          <Route path="/HRDashboard" element={<HRDashboard />} />
          <Route path="/hr/employees" element={<EmployeeListPage />} />
          <Route path="/hr/create-employee" element={<AddEmployeePage />} />
          <Route path="/hr/profile" element={<MyProfilePage />} />
        </Route>

        {/* Admin Routes - Protected */}
        <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
          <Route path="/AdminDashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserList />} />
          <Route path="/admin/usermanagement" element={<UserManagement />} />
          <Route path="/admin/auditlog" element={<AuditLog />} />
          <Route path="/admin/hr" element={<HRDashboard />} />
         
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
