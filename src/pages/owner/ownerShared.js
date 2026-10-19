import React from "react";

export const ORG_STATUS_LABEL = { pending: "Pending approval", active: "Active", suspended: "Suspended", rejected: "Rejected" };

export const ENQUIRY_STATUS_LABEL = { new: "New", contacted: "Contacted", closed: "Closed" };

export const EnquiryStatusBadge = ({ status }) => (
  <span className={`badge enquiry-status enquiry-status-${status}`}>{ENQUIRY_STATUS_LABEL[status] || status}</span>
);

// "Kumasi, Ghana"
export const placeLabel = (org) => [org.city, org.country].filter(Boolean).join(", ") || "–";

export const OrgStatusBadge = ({ status }) => (
  <span className={`badge org-status org-status-${status}`}>{ORG_STATUS_LABEL[status] || status}</span>
);

export const formatDate = (value) => (value ? new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "–");
export const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : "–");
export const seatsLabel = (org) => (org.seat_limit ? `${org.active_user_count} / ${org.seat_limit}` : `${org.active_user_count} (no limit)`);

// The owner nav shows pending / new-enquiry counts; pages call this after changing them.
export const OWNER_COUNTS_EVENT = "emplocore:owner-counts";
export const notifyOwnerCountsChanged = () => window.dispatchEvent(new Event(OWNER_COUNTS_EVENT));
