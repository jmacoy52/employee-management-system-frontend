import React from "react";

const ROLE_LABEL = { owner: "Owner", admin: "Admin", hr: "HR", employee: "Employee" };

export const RoleBadge = ({ role }) => (
  <span className={`badge badge-${role}`}>{ROLE_LABEL[role] || role}</span>
);

export const StatusBadge = ({ active }) => (
  <span className={`status-badge badge ${active ? "active" : "inactive"}`}>
    {active ? "Active" : "Deactivated"}
  </span>
);
