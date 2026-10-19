import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { PATHS, ROLE_HOME } from "./paths";

function isExpired(token) {
  try {
    const { exp } = jwtDecode(token);
    return typeof exp === "number" && exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

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

  // Expired or unreadable token: clear the session and sign in again.
  if (isExpired(token)) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to={PATHS.login} replace />;
  }

  if (user.role === "admin") return <Outlet />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_HOME[user.role] || PATHS.login} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
