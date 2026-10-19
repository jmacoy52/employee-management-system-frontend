import React from "react";

export const ORG_STATUS_LABEL = { pending: "Pending approval", active: "Active", suspended: "Suspended" };

export const OrgStatusBadge = ({ status }) => (
  <span className={`badge org-status org-status-${status}`}>{ORG_STATUS_LABEL[status] || status}</span>
);

export const formatDate = (value) => (value ? new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "–");
export const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : "–");
export const seatsLabel = (org) => (org.seat_limit ? `${org.active_user_count} / ${org.seat_limit}` : `${org.active_user_count} (no limit)`);
