import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { CreditCard, Download, X } from "lucide-react";
import api, { getErrorMessage } from "../../api/client";
import AppLayout from "../../components/layout/AppLayout";
import AdminNav from "../../components/layout/AdminNav";
import PricingPlans from "../../components/billing/PricingPlans";
import IntervalToggle from "../../components/billing/IntervalToggle";
import PlanBanner from "../../components/billing/PlanBanner";
import { formatGhs, formatDay, STATUS_LABELS, STATUS_TONES } from "../../api/billing";
import { downloadPdf } from "../payroll/payrollShared";
import "./Billing.css";

const PAYMENT_LABELS = { success: "Paid", failed: "Failed", pending: "Pending", abandoned: "Not completed" };

const Meter = ({ label, used, limit, testId }) => {
  const pct = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const over = limit != null && used > limit;
  return (
    <div className={`usage-meter${over ? " over" : ""}`} data-testid={testId}>
      <div className="usage-meter-head">
        <span>{label}</span>
        <strong>{used}{limit != null ? ` / ${limit}` : ""}{limit == null && <span className="muted"> (no limit)</span>}</strong>
      </div>
      {limit != null && (
        <div className="usage-bar" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={limit} aria-valuenow={used}>
          <span style={{ width: `${limit === 0 ? 100 : pct}%` }} />
        </div>
      )}
    </div>
  );
};

// Organisation admin: plan, usage, change plan (Paystack checkout), renewal, payments and invoices
const Billing = () => {
  const [data, setData] = useState(null);
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState("");
  const [interval, setInterval] = useState("monthly");
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    try {
      const [o, p] = await Promise.all([api.get("/api/billing"), api.get("/api/billing/payments")]);
      setData(o.data);
      setPayments(p.data);
      if (o.data.subscription.interval) setInterval(o.data.subscription.interval);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "Billing could not be loaded."));
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const choose = async (plan) => {
    if (plan.code === "free") return cancel();
    setBusy(plan.code);
    try {
      const res = await api.post("/api/billing/checkout", { plan: plan.code, interval });
      window.location.assign(res.data.authorizationUrl);
    } catch (err) {
      toast.error(getErrorMessage(err, "The payment could not be started."));
      setBusy("");
    }
  };

  const cancel = async () => {
    const end = formatDay(data.subscription.currentPeriodEnd);
    if (!window.confirm(`Stop automatic renewal? Your plan stays active until ${end}. After that you have a 7-day grace period, then the organisation moves to Free. No data is deleted.`)) return;
    setBusy("cancel");
    try {
      await api.post("/api/billing/cancel");
      toast.success("Automatic renewal stopped.");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, "The renewal could not be cancelled."));
    } finally {
      setBusy("");
    }
  };

  const manageCard = async () => {
    setBusy("card");
    try {
      const res = await api.post("/api/billing/manage-card");
      window.open(res.data.link, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(getErrorMessage(err, "The card page could not be opened."));
    } finally {
      setBusy("");
    }
  };

  const dismiss = async (id) => {
    try {
      await api.post(`/api/billing/notices/${id}/dismiss`);
      setData((d) => ({ ...d, notices: d.notices.filter((n) => n.id !== id) }));
    } catch {
      /* the notice simply stays */
    }
  };

  const invoice = (p) => downloadPdf(`/api/billing/payments/${p.id}/invoice`, `${p.invoice_number || p.reference}.pdf`).catch(() => toast.error("The invoice could not be downloaded."));

  const sub = data && data.subscription;
  const ent = data && data.entitlements;
  const exempt = sub && sub.billingMode === "exempt";
  const manual = sub && sub.billingMode === "manual";
  const paidActive = sub && sub.billingMode === "paystack" && sub.status === "active";

  const dateFact = () => {
    if (!sub) return null;
    if (exempt) return ["Billing", "Not billed (demo organisation)"];
    if (sub.status === "trialing") return ["Trial ends", formatDay(sub.trialEndsAt)];
    if (sub.status === "grace") return ["Grace period ends", formatDay(sub.graceEndsAt)];
    if (manual) return ["Arranged until", sub.manualUntil ? formatDay(sub.manualUntil) : "No end date"];
    if (paidActive) return [sub.cancelAtPeriodEnd ? "Plan ends" : "Renews on", formatDay(sub.currentPeriodEnd)];
    return null;
  };

  return (
    <AppLayout
      nav={<AdminNav />}
      title="Billing"
      subtitle="Your plan, usage, payments and invoices."
      className="billing-page"
    >
      {error && <p className="error page-error" role="alert">{error}</p>}
      {!data && !error && <p className="muted">Loading…</p>}
      {data && (
        <>
          {!exempt && <PlanBanner role="admin" status={{ ...data.subscription, planName: sub.plan.name, features: ent.features, employees: data.usage.employees, employeeCap: ent.employeeCap, overEmployeeLimit: data.overLimit.employees }} />}
          {data.notices.map((n) => (
            <div key={n.id} className={`alert alert-${n.kind.includes("grace") || n.kind.includes("failed") ? "warning" : "info"} billing-notice`} role="status">
              <span>{n.message}</span>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => dismiss(n.id)} aria-label="Dismiss notice"><X size={16} /></button>
            </div>
          ))}
          {exempt && (
            <div className="alert alert-info billing-exempt" role="status">
              This is the public demo organisation. It stays on the Growth plan and is never billed, so plan changes are switched off here.
            </div>
          )}

          <div className="billing-top">
            <section className="card card-flush billing-current">
              <div className="card-header">
                <h2 className="card-title">Current plan</h2>
                <span className={`badge badge-${STATUS_TONES[sub.status] || "neutral"} billing-status`}>{exempt ? "Demo" : manual && sub.status === "active" ? "Arranged plan" : STATUS_LABELS[sub.status]}</span>
              </div>
              <div className="billing-plan-name">
                <strong className="current-plan-name">{sub.plan.name}</strong>
                {sub.status === "trialing" && <span className="muted"> trial</span>}
              </div>
              <dl className="billing-facts">
                {dateFact() && (<><dt>{dateFact()[0]}</dt><dd className="billing-date">{dateFact()[1]}</dd></>)}
                {paidActive && (<><dt>Billing period</dt><dd>{sub.interval === "yearly" ? "Yearly" : "Monthly"}</dd></>)}
                {paidActive && sub.amount != null && (<><dt>Amount</dt><dd>{formatGhs(sub.amount)} per {sub.interval === "yearly" ? "year" : "month"}{sub.extraEmployeesBilled ? ` (includes ${sub.extraEmployeesBilled} extra employee${sub.extraEmployeesBilled === 1 ? "" : "s"})` : ""}</dd></>)}
                {sub.discount && (<><dt>Discount</dt><dd>{sub.discount.percent}% until {formatDay(sub.discount.endsAt)}</dd></>)}
                {sub.lastPaymentAt && (<><dt>Last payment</dt><dd>{PAYMENT_LABELS[sub.lastPaymentStatus] || sub.lastPaymentStatus} on {formatDay(sub.lastPaymentAt)}</dd></>)}
              </dl>
              {sub.billingMode === "paystack" && (sub.hasPaystackSubscription || (paidActive && !sub.cancelAtPeriodEnd)) && (
                <div className="billing-actions">
                  {sub.hasPaystackSubscription && data.paymentsEnabled && (
                    <button type="button" className="btn btn-secondary btn-sm manage-card-btn" onClick={manageCard} disabled={Boolean(busy)}>
                      <CreditCard size={16} /> Update card
                    </button>
                  )}
                  {paidActive && !sub.cancelAtPeriodEnd && (
                    <button type="button" className="btn btn-ghost btn-sm cancel-renewal-btn" onClick={cancel} disabled={Boolean(busy)}>Cancel renewal</button>
                  )}
                </div>
              )}
            </section>

            <section className="card card-flush billing-usage">
              <div className="card-header"><h2 className="card-title">Usage</h2></div>
              <div className="usage-list">
                <Meter label="Employee records" used={data.usage.employees} limit={ent.employeeLimit} testId="usage-employees" />
                <Meter label="Admin accounts" used={data.usage.admins} limit={ent.maxAdmins} testId="usage-admins" />
                <Meter label="HR accounts" used={data.usage.hr} limit={ent.maxHr} testId="usage-hr" />
              </div>
              {ent.employeeLimit != null && ent.employeeCap == null && data.usage.employees > ent.employeeLimit && (
                <p className="muted usage-note">Employees over the included {ent.employeeLimit} are billed as extras at your next renewal.</p>
              )}
              <ul className="feature-flags">
                <li className={ent.features.payroll ? "on" : "off"}>Payroll and payslips {ent.features.payroll ? "included" : "not included"}</li>
                <li className={ent.features.auditLog ? "on" : "off"}>Organisation audit log {ent.features.auditLog ? "included" : "not included"}</li>
                <li className={ent.features.prioritySupport ? "on" : "off"}>Priority support {ent.features.prioritySupport ? "included" : "not included"}</li>
              </ul>
            </section>
          </div>

          {!exempt && (
            <section className="card section billing-plans">
              <div className="card-header billing-plans-head">
                <h2 className="card-title">{paidActive ? "Change plan" : "Choose a plan"}</h2>
                <IntervalToggle value={interval} onChange={setInterval} idPrefix="billing" />
              </div>
              {!data.paymentsEnabled && (
                <div className="alert alert-info payments-coming-soon" role="status">
                  <strong>Payments coming soon, contact us.</strong> Online payment is not switched on yet. To move to a paid plan now,{" "}
                  <Link to="/contact#request-demo">contact the EmploCore team</Link> and we will set it up for you.
                </div>
              )}
              {manual && sub.status === "active" && (
                <p className="muted">Your plan was arranged with the EmploCore team. Contact us to change it.</p>
              )}
              {data.discount && !data.discount.endsAt && data.paymentsEnabled && (
                <p className="billing-offer">Founding offer: your first payment includes {data.discount.percent}% off for {data.discount.months} months.</p>
              )}
              <PricingPlans
                plans={data.plans.filter((p) => p.isPublic)}
                interval={interval}
                mode="billing"
                current={{ plan: sub.subscribedPlan.code, interval: sub.interval, status: sub.status, billingMode: sub.billingMode, cancelAtPeriodEnd: sub.cancelAtPeriodEnd }}
                employees={data.usage.employees}
                discountPercent={data.discount ? data.discount.percent : 0}
                paymentsEnabled={data.paymentsEnabled && !(manual && sub.status === "active")}
                busy={busy}
                onChoose={choose}
              />
              <p className="muted billing-small">A new plan starts a new billing period from the day you pay. You are charged through Paystack and can stop renewal at any time.</p>
            </section>
          )}

          <section className="card card-flush section billing-payments">
            <div className="card-header"><h2 className="card-title">Payment history</h2></div>
            {payments.length === 0 ? (
              <p className="empty-state billing-no-payments">No payments yet.</p>
            ) : (
              <div className="table-wrap">
                <table className="data-table payments-table">
                  <thead>
                    <tr><th>Date</th><th>Description</th><th className="num">Amount</th><th>Status</th><th>Invoice</th></tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id}>
                        <td data-label="Date">{formatDay(p.paid_at || p.created_at)}</td>
                        <td data-label="Description">{p.description || `${p.plan_code} (${p.billing_interval})`}</td>
                        <td data-label="Amount" className="num">{formatGhs(p.amount_pesewas, { always2: true })}</td>
                        <td data-label="Status"><span className={`badge badge-${p.status === "success" ? "success" : p.status === "failed" ? "danger" : "neutral"}`}>{PAYMENT_LABELS[p.status] || p.status}</span></td>
                        <td data-label="Invoice">
                          {p.status === "success" ? (
                            <button type="button" className="btn btn-ghost btn-sm invoice-btn" onClick={() => invoice(p)}><Download size={15} /> {p.invoice_number || "Invoice"}</button>
                          ) : "–"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </AppLayout>
  );
};

export default Billing;
