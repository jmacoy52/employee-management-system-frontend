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

// Plan / subscription cell for the organisation list
const SUB_LABELS = { trialing: "trial", active: "active", grace: "grace", free: "free", paused: "paused" };
const SUB_TONES = { trialing: "badge-info", active: "badge-success", grace: "badge-warning", free: "", paused: "badge-warning" };
export const SubscriptionCell = ({ sub, fallback }) => {
  if (!sub) return <span>{fallback || "–"}</span>;
  const name = sub.plan_code.charAt(0).toUpperCase() + sub.plan_code.slice(1);
  const until = sub.status === "trialing" ? sub.trial_ends_at : sub.status === "grace" ? sub.grace_ends_at : sub.status === "active" && sub.billing_mode === "paystack" ? sub.current_period_end : null;
  return (
    <span className="sub-cell">
      <span className="cell-strong">{sub.status === "free" ? "Free" : name}</span>{" "}
      <span className={`badge ${sub.billing_mode === "exempt" ? "" : SUB_TONES[sub.status]}`}>{sub.billing_mode === "exempt" ? "exempt" : sub.billing_mode === "manual" && sub.status === "active" ? "arranged" : SUB_LABELS[sub.status]}</span>
      {until && <span className="cell-muted sub-until"> until {formatDate(until)}</span>}
    </span>
  );
};
