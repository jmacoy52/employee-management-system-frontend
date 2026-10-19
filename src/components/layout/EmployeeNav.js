import React from "react";
import { UserCircle, KeyRound } from "lucide-react";
import AppNav from "./AppNav";

const EMPLOYEE_ITEMS = [
  { to: "/employee", label: "My Dashboard", icon: UserCircle },
  { to: "/account/password", label: "Change Password", icon: KeyRound },
];

const EmployeeNav = () => <AppNav items={EMPLOYEE_ITEMS} home="/employee" label="Employee" className="employee-nav" />;

export default EmployeeNav;
