import React from "react";
import { LayoutDashboard, Building2, Users, ScrollText, KeyRound } from "lucide-react";
import AppNav from "./AppNav";

const OWNER_ITEMS = [
  { to: "/owner", label: "Overview", icon: LayoutDashboard },
  { to: "/owner/organisations", label: "Organisations", icon: Building2, end: false },
  { to: "/owner/users", label: "All users", icon: Users },
  { to: "/owner/audit-log", label: "Audit log", icon: ScrollText },
  { to: "/account/password", label: "Change Password", icon: KeyRound },
];

// Platform owner console navigation (separate from every organisation's admin area)
const OwnerNav = () => <AppNav items={OWNER_ITEMS} home="/owner" label="Owner console" className="owner-nav wide" />;

export default OwnerNav;
