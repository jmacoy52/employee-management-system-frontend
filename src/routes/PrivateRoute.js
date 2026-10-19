import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { PATHS, ROLE_HOME } from "./paths";

// Guards a group of routes. Not signed in -> /login. Signed in but wrong role ->
// that role's own home page. Admins can open every protected route.
const PrivateRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  if (!token || !user) return <Navigate to={PATHS.login} replace />;

  if (user.role === "admin") return <Outlet />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_HOME[user.role] || PATHS.login} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
