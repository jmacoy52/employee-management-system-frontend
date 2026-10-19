import React from "react";
import { Users, Settings, ScrollText, UserCheck, Home, KeyRound, Building2, Wallet, CreditCard } from "lucide-react";
import AppNav from "./AppNav";

const ADMIN_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: Home },
  { to: "/admin/users", label: "View Users", icon: Users },
  { to: "/admin/user-management", label: "User Management", icon: Settings },
  { to: "/admin/audit-log", label: "Audit Log", icon: ScrollText },
  { to: "/admin/departments", label: "Departments", icon: Building2 },
  { to: "/admin/payroll", label: "Payroll", icon: Wallet, end: false },
  { to: "/admin/billing", label: "Billing", icon: CreditCard, end: false },
  { to: "/admin/hr", label: "HR Dashboard", icon: UserCheck },
  { to: "/account/password", label: "Change Password", icon: KeyRound },
];

const AdminNav = () => <AppNav items={ADMIN_ITEMS} home="/admin" label="Admin" className="admin-nav wide" />;

export default AdminNav;
