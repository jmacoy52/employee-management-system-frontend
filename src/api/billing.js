// Billing helpers shared by the pricing section, the admin Billing page and the owner console.
// Amounts from the API are integer pesewas (GHS 1 = 100 pesewas).

// 9900 -> "GHS 99"; 14940 -> "GHS 149.40"
export function formatGhs(pesewas, { always2 = false } = {}) {
  if (pesewas === null || pesewas === undefined) return "Custom";
  const value = Number(pesewas) / 100;
  const whole = Number.isInteger(value) && !always2;
  return `GHS ${value.toLocaleString("en-GB", { minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 })}`;
}

export const YEARLY_EXTRA_MULTIPLIER = 10;

// Price for a plan, interval and number of employees with an optional discount (mirrors the API's quote)
export function quote(plan, interval, employees = 0, discountPercent = 0) {
  const base = interval === "yearly" ? plan.priceYearly : plan.priceMonthly;
  if (base === null || base === undefined) return null;
  const hasExtras = plan.includedEmployees !== null && plan.extraEmployee !== null;
  const extras = hasExtras ? Math.max(0, employees - plan.includedEmployees) : 0;
  const unit = hasExtras ? plan.extraEmployee * (interval === "yearly" ? YEARLY_EXTRA_MULTIPLIER : 1) : 0;
  const subtotal = base + extras * unit;
  const discount = discountPercent ? Math.round((subtotal * discountPercent) / 100) : 0;
  return { base, extras, unit, subtotal, discount, total: subtotal - discount };
}

export function employeesLine(plan) {
  if (plan.includedEmployees === null) return "No set employee limit";
  const base = `Up to ${plan.includedEmployees} employees`;
  return plan.extraEmployee !== null ? `${base}, then ${formatGhs(plan.extraEmployee)} per extra employee a month` : base;
}

export const STATUS_LABELS = {
  trialing: "Free trial",
  active: "Active",
  grace: "Grace period",
  free: "Free plan",
  paused: "Paused",
};

export const STATUS_TONES = { trialing: "info", active: "success", grace: "warning", free: "neutral", paused: "warning" };

// "19 October 2026, 18:05 (Accra)"
export function formatDateTime(value) {
  if (!value) return "–";
  const d = new Date(value);
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Africa/Accra" });
  return `${formatDay(d)}, ${time} (Accra)`;
}

// "19 October 2026" (Accra is UTC+0, so UTC dates are the local dates)
export function formatDay(value) {
  if (!value) return "–";
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Accra" });
}

export function daysUntil(value) {
  if (!value) return null;
  return Math.ceil((new Date(value).getTime() - Date.now()) / 86400000);
}
