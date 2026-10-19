import React from "react";
import { Users, Settings, ScrollText, UserCheck, Home, KeyRound } from "lucide-react";
import AppNav from "./AppNav";

const ADMIN_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: Home },
  { to: "/admin/users", label: "View Users", icon: Users },
  { to: "/admin/user-management", label: "User Management", icon: Settings },
  { to: "/admin/audit-log", label: "Audit Log", icon: ScrollText },
  { to: "/admin/hr", label: "HR Dashboard", icon: UserCheck },
  { to: "/account/password", label: "Change Password", icon: KeyRound },
];

const AdminNav = () => <AppNav items={ADMIN_ITEMS} home="/admin" label="Admin" className="admin-nav wide" />;

export default AdminNav;
