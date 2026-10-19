import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api, { getErrorMessage } from "../../api/client";
import Modal from "../../components/common/Modal";
import { formatGhs, formatDay, STATUS_LABELS, STATUS_TONES } from "../../api/billing";

const MODE_LABELS = { paystack: "Paystack", manual: "Arranged by owner / paid manually", exempt: "Exempt (demo)" };
const PAY_LABELS = { success: "Paid", failed: "Failed", pending: "Pending", abandoned: "Not completed" };

// Owner: one organisation's subscription with manual actions (audit-logged as platform scope by the API)
const OrgSubscriptionPanel = ({ org, onChanged }) => {
  const sub = org.subscription;
  const [plans, setPlans] = useState([]);
  const [dialog, setDialog] = useState("");
  const [saving, setSaving] = useState(false);
  const [days, setDays] = useState("14");
  const [assign, setAssign] = useState({ plan: "enterprise", months: "12", employeeLimit: "", monthlyPrice: "", note: "" });
  const today = new Date().toISOString().slice(0, 10);
  const [paid, setPaid] = useState({ plan: "starter", months: "1", amount: "", method: "momo", reference: "", paidAt: today, note: "" });
  const [trialTo, setTrialTo] = useState("grace");
  const [cancelWhen, setCancelWhen] = useState("now");

  useEffect(() => {
    api.get("/api/platform/plans").then((res) => setPlans(res.data)).catch(() => {});
  }, []);

  if (!sub) return null;
  const exempt = sub.billingMode === "exempt";

  const run = async (path, body, done) => {
    setSaving(true);
    try {
      await api.post(`/api/platform/organizations/${org.id}/subscription/${path}`, body);
      toast.success(done);
      setDialog("");
      onChanged();
    } catch (err) {
      toast.error(getErrorMessage(err, "The change could not be saved."));
    } finally {
      setSaving(false);
    }
  };

  const founding = () => {
    if (!window.confirm(`Give ${org.name} the founding discount? It takes one of the limited places and applies to its Paystack payments for the coupon's duration.`)) return;
    run("founding-discount", {}, "Founding discount applied.");
  };

  const date = sub.status === "trialing" ? ["Trial ends", sub.trialEndsAt]
    : sub.status === "grace" ? ["Grace ends", sub.graceEndsAt]
    : sub.status === "paused" ? null
    : sub.billingMode === "manual" ? ["Paid / arranged until", sub.manualUntil]
    : sub.status === "active" ? [sub.cancelAtPeriodEnd ? "Ends" : "Renews", sub.currentPeriodEnd] : null;

  return (
    <section className="card card-flush section org-subscription-card">
      <div className="card-header">
        <h2 className="card-title">Subscription</h2>
        <span className={`badge badge-${STATUS_TONES[sub.status] || "neutral"} org-sub-status`}>{exempt ? "Exempt" : STATUS_LABELS[sub.status]}</span>
      </div>
      <dl className="owner-facts">
        <dt>Plan</dt><dd className="org-sub-plan">{sub.planName}{sub.planCode !== sub.effectivePlan ? ` (subscribed: ${sub.planCode})` : ""}</dd>
        <dt>Billing</dt><dd>{MODE_LABELS[sub.billingMode]}{sub.interval ? `, ${sub.interval}` : ""}</dd>
        {date && (<><dt>{date[0]}</dt><dd className="org-sub-date">{date[1] ? formatDay(date[1]) : "No end date"}</dd></>)}
        <dt>Amount</dt><dd>{sub.billingMode === "manual" ? (sub.manualMonthly != null ? `${formatGhs(sub.manualMonthly)} a month (arranged)` : "Free of charge") : sub.amount != null ? `${formatGhs(sub.amount)} per ${sub.interval === "yearly" ? "year" : "month"}` : "–"}</dd>
        <dt>Discount</dt><dd>{sub.discountPercent ? `${sub.discountPercent}% until ${formatDay(sub.discountEndsAt)}` : "None"}</dd>
        <dt>Last payment</dt><dd className="org-sub-payment">{sub.lastPaymentStatus ? `${PAY_LABELS[sub.lastPaymentStatus] || sub.lastPaymentStatus}, ${formatDay(sub.lastPaymentAt)}` : "No payments yet"}</dd>
        <dt>Employees</dt><dd>{sub.usage.employees}{sub.entitlements.employeeLimit != null ? ` of ${sub.entitlements.employeeLimit} included` : " (no limit)"}</dd>
        {sub.note && (<><dt>Note</dt><dd>{sub.note}</dd></>)}
      </dl>
      {exempt ? (
        <p className="owner-section-note owner-card-note">The demo organisation stays on Growth and is never billed. Subscription actions are switched off.</p>
      ) : (
        <div className="owner-actions">
          <button type="button" className="btn btn-secondary btn-sm extend-trial-btn" onClick={() => setDialog("extend")}>Extend trial</button>
          <button type="button" className="btn btn-secondary btn-sm assign-plan-btn" onClick={() => setDialog("assign")}>Assign plan</button>
          {!sub.discountPercent && <button type="button" className="btn btn-ghost btn-sm founding-btn" onClick={founding}>Apply founding discount</button>}
          {sub.status === "trialing" && <button type="button" className="btn btn-secondary btn-sm end-trial-btn" onClick={() => setDialog("endTrial")}>End trial now</button>}
          <button type="button" className="btn btn-primary btn-sm mark-paid-btn" onClick={() => setDialog("paid")}>Record payment</button>
          {sub.status === "paused" ? (
            <button type="button" className="btn btn-success-soft btn-sm resume-btn" onClick={() => run("resume", {}, "Subscription resumed.")}>Resume</button>
          ) : sub.status !== "free" && (
            <button type="button" className="btn btn-secondary btn-sm pause-btn" onClick={() => { if (window.confirm(`Pause ${org.name}'s subscription? Paystack renewals stop and paid features are switched off until you resume. No data is deleted.`)) run("pause", {}, "Subscription paused."); }}>Pause</button>
          )}
          {sub.status !== "free" && <button type="button" className="btn btn-danger-soft btn-sm cancel-sub-btn" onClick={() => setDialog("cancel")}>Cancel subscription</button>}
        </div>
      )}

      {sub.payments && sub.payments.length > 0 && (
        <div className="table-wrap">
          <table className="data-table org-payments-table">
            <thead><tr><th>Date</th><th>Invoice</th><th>Plan</th><th className="num">Amount</th><th>Status</th></tr></thead>
            <tbody>
              {sub.payments.map((p) => (
                <tr key={p.id}>
                  <td data-label="Date">{formatDay(p.paid_at || p.created_at)}</td>
                  <td data-label="Invoice">{p.invoice_number || "–"}</td>
                  <td data-label="Plan">{p.plan_code} ({p.billing_interval})</td>
                  <td data-label="Amount" className="num">{formatGhs(p.amount_pesewas, { always2: true })}</td>
                  <td data-label="Status">{PAY_LABELS[p.status] || p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={dialog === "extend"} onClose={() => setDialog("")} title={`Extend ${org.name}'s trial`}>
        <form onSubmit={(e) => { e.preventDefault(); run("extend-trial", { days: Number(days) }, "Trial extended."); }}>
          <p className="owner-temp-note">Adds days to the current trial, or starts a new Growth trial if the organisation is on Free or in its grace period.</p>
          <div className="field">
            <label htmlFor="extend-days">Days to add (1 to 90)</label>
            <input id="extend-days" type="number" min="1" max="90" value={days} onChange={(e) => setDays(e.target.value)} required />
          </div>
          <div className="modal-actions form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setDialog("")}>Cancel</button>
            <button type="submit" className="btn btn-primary confirm-extend-btn" disabled={saving}>{saving && <span className="spinner" aria-hidden="true" />} Extend trial</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={dialog === "endTrial"} onClose={() => setDialog("")} title={`End ${org.name}'s trial now`}>
        <form onSubmit={(e) => { e.preventDefault(); run("end-trial", { to: trialTo }, "Trial ended."); }}>
          <div className="field">
            <label htmlFor="end-trial-to">After the trial</label>
            <select id="end-trial-to" value={trialTo} onChange={(e) => setTrialTo(e.target.value)}>
              <option value="grace">7-day grace period, then Free (the usual rule)</option>
              <option value="free">Move to Free straight away</option>
            </select>
          </div>
          <p className="owner-temp-note">The organisation admin sees a notice. No data is deleted.</p>
          <div className="modal-actions form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setDialog("")}>Cancel</button>
            <button type="submit" className="btn btn-primary confirm-end-trial-btn" disabled={saving}>{saving && <span className="spinner" aria-hidden="true" />} End trial</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={dialog === "paid"} onClose={() => setDialog("")} title={`Record a payment from ${org.name}`}>
        <form onSubmit={(e) => { e.preventDefault(); run("mark-paid", paid, "Payment recorded and invoice created."); }}>
          <p className="owner-temp-note">For money received outside Paystack. The organisation gets the plan for the period, a paid invoice appears on its Billing page, and any Paystack subscription is stopped. When the period ends, the usual 7-day grace period applies.</p>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="paid-plan">Plan</label>
              <select id="paid-plan" value={paid.plan} onChange={(e) => setPaid({ ...paid, plan: e.target.value })}>
                {plans.filter((p) => p.code !== "free").map((p) => <option key={p.code} value={p.code}>{p.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="paid-months">Period (months)</label>
              <input id="paid-months" type="number" min="1" max="36" value={paid.months} onChange={(e) => setPaid({ ...paid, months: e.target.value })} required />
            </div>
            <div className="field">
              <label htmlFor="paid-amount">Amount received (GHS)</label>
              <input id="paid-amount" type="number" min="0.01" step="0.01" value={paid.amount} onChange={(e) => setPaid({ ...paid, amount: e.target.value })} required />
            </div>
            <div className="field">
              <label htmlFor="paid-method">Paid by</label>
              <select id="paid-method" value={paid.method} onChange={(e) => setPaid({ ...paid, method: e.target.value })}>
                <option value="momo">Mobile money</option>
                <option value="bank">Bank transfer</option>
                <option value="cash">Cash</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="paid-ref">Reference (MoMo or bank)</label>
              <input id="paid-ref" maxLength={60} value={paid.reference} onChange={(e) => setPaid({ ...paid, reference: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="paid-date">Date received</label>
              <input id="paid-date" type="date" max={today} value={paid.paidAt} onChange={(e) => setPaid({ ...paid, paidAt: e.target.value })} required />
            </div>
          </div>
          <div className="field">
            <label htmlFor="paid-note">Note (internal)</label>
            <input id="paid-note" maxLength={255} value={paid.note} onChange={(e) => setPaid({ ...paid, note: e.target.value })} />
          </div>
          <div className="modal-actions form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setDialog("")}>Cancel</button>
            <button type="submit" className="btn btn-primary confirm-paid-btn" disabled={saving}>{saving && <span className="spinner" aria-hidden="true" />} Record payment</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={dialog === "cancel"} onClose={() => setDialog("")} title={`Cancel ${org.name}'s subscription`}>
        <form onSubmit={(e) => { e.preventDefault(); run("cancel", { when: cancelWhen }, cancelWhen === "now" ? "Subscription cancelled; the organisation is on Free." : "Renewal cancelled."); }}>
          <div className="field">
            <label htmlFor="cancel-when">When</label>
            <select id="cancel-when" value={cancelWhen} onChange={(e) => setCancelWhen(e.target.value)}>
              <option value="now">Now: move to Free straight away</option>
              <option value="period_end" disabled={!(sub.status === "active" && sub.billingMode === "paystack")}>At the end of the paid period (Paystack subscriptions)</option>
            </select>
          </div>
          <p className="owner-temp-note">Paystack stops charging. No data is deleted; anything over the Free limits becomes read-only.</p>
          <div className="modal-actions form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setDialog("")}>Keep subscription</button>
            <button type="submit" className="btn btn-danger confirm-cancel-btn" disabled={saving}>{saving && <span className="spinner" aria-hidden="true" />} Cancel subscription</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={dialog === "assign"} onClose={() => setDialog("")} title={`Assign a plan to ${org.name}`}>
        <form onSubmit={(e) => { e.preventDefault(); run("assign", assign, "Plan assigned."); }}>
          <p className="owner-temp-note">Use this for Enterprise agreements and complimentary plans. Any Paystack subscription is stopped first. When the end date passes, the organisation gets the usual 7-day grace period.</p>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="assign-plan">Plan</label>
              <select id="assign-plan" value={assign.plan} onChange={(e) => setAssign({ ...assign, plan: e.target.value })}>
                {plans.map((p) => <option key={p.code} value={p.code}>{p.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="assign-months">Months (empty for no end date)</label>
              <input id="assign-months" type="number" min="1" max="60" value={assign.months} onChange={(e) => setAssign({ ...assign, months: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="assign-limit">Employee limit (empty for the plan default)</label>
              <input id="assign-limit" type="number" min="1" value={assign.employeeLimit} onChange={(e) => setAssign({ ...assign, employeeLimit: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="assign-price">Agreed monthly price in GHS (empty if free)</label>
              <input id="assign-price" type="number" min="0" step="0.01" value={assign.monthlyPrice} onChange={(e) => setAssign({ ...assign, monthlyPrice: e.target.value })} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="assign-note">Note (internal)</label>
            <input id="assign-note" maxLength={255} value={assign.note} onChange={(e) => setAssign({ ...assign, note: e.target.value })} placeholder="e.g. Annual agreement signed 1 November" />
          </div>
          <div className="modal-actions form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setDialog("")}>Cancel</button>
            <button type="submit" className="btn btn-primary confirm-assign-btn" disabled={saving}>{saving && <span className="spinner" aria-hidden="true" />} Assign plan</button>
          </div>
        </form>
      </Modal>
    </section>
  );
};

export default OrgSubscriptionPanel;
