import React from "react";
import { useNavigate } from "react-router-dom";
import { getStoredUser } from "../../auth/session";
import { Users, Plus, UserCircle, Home, ArrowLeft, KeyRound, Building2 } from "lucide-react";
import AppNav from "./AppNav";

const HR_ITEMS = [
  { to: "/hr", label: "Dashboard", icon: Home },
  { to: "/hr/employees", label: "Employee List", icon: Users },
  { to: "/hr/departments", label: "Departments", icon: Building2 },
  { to: "/hr/create-employee", label: "Add Employee", icon: Plus },
  { to: "/hr/profile", label: "My Profile", icon: UserCircle },
  { to: "/account/password", label: "Change Password", icon: KeyRound },
];

const HRNav = () => {
  const navigate = useNavigate();
  const user = getStoredUser();
  const isAdmin = user?.role === "admin";

  const switchToAdmin = () => {
    navigate("/admin");
  };

  return (
    <AppNav
      items={HR_ITEMS}
      home={isAdmin ? "/admin" : "/hr"}
      label="HR"
      className={`hr-nav ${isAdmin ? "wide" : ""}`}
      actions={
        isAdmin && (
          <button type="button" className="btn btn-secondary btn-sm switch-btn" onClick={switchToAdmin}>
            <ArrowLeft size={16} /> Back to Admin
          </button>
        )
      }
    />
  );
};

export default HRNav;
