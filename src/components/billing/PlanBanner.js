import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import { formatDay, daysUntil } from "../../api/billing";

// Trial / grace / limit banner. Loads GET /api/billing/status (any signed-in organisation user) unless
// a status is passed in. Only admins get the "Go to Billing" link; others are told to ask their admin.
//   feature: "payroll" also explains that payroll is not included in the current plan
export function planBannerFor(status, { isAdmin = false, feature = null } = {}) {
  if (!status || status.billingMode === "exempt") return null;
  const who = isAdmin ? "" : " Ask your organisation admin to choose a plan.";
  if (feature === "payroll" && status.features && !status.features.payroll) {
    return { tone: "warning", text: `Payroll is not included in the ${status.planName} plan. Existing payroll records stay available to view; new runs and changes need Starter or above.${who}` };
  }
  if (status.status === "grace") {
    return { tone: "danger", text: `Payment needed: your plan stays active until ${formatDay(status.graceEndsAt)}, then the organisation moves to Free. No data is deleted.${who}` };
  }
  if (status.overEmployeeLimit) {
    return { tone: "warning", text: `You have ${status.employees} employee records and the ${status.planName} plan includes ${status.employeeCap}. Records over the limit are read-only until you upgrade or remove some.${who}` };
  }
  if (status.status === "trialing") {
    const days = daysUntil(status.trialEndsAt);
    if (days !== null && days <= 7) {
      return { tone: "info", text: `Your free ${status.planName} trial ends on ${formatDay(status.trialEndsAt)} (${days <= 0 ? "today" : `${days} day${days === 1 ? "" : "s"} left`}). Choose a plan to keep your features.${who}` };
    }
  }
  return null;
}

const PlanBanner = ({ role, feature = null, status: given = null }) => {
  const [status, setStatus] = useState(given);
  useEffect(() => {
    if (given) { setStatus(given); return undefined; }
    let alive = true;
    api.get("/api/billing/status").then((res) => alive && setStatus(res.data)).catch(() => {});
    return () => { alive = false; };
  }, [given]);
  const isAdmin = role === "admin";
  const banner = planBannerFor(status, { isAdmin, feature });
  if (!banner) return null;
  return (
    <div className={`alert alert-${banner.tone} plan-banner`} role="status">
      <span>{banner.text}</span>
      {isAdmin && <Link to="/admin/billing" className="btn btn-sm btn-secondary plan-banner-link">Go to Billing</Link>}
    </div>
  );
};

export default PlanBanner;
