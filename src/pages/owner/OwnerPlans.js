import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Pencil } from "lucide-react";
import api, { getErrorMessage } from "../../api/client";
import OwnerNav from "../../components/layout/OwnerNav";
import AppLayout from "../../components/layout/AppLayout";
import Modal from "../../components/common/Modal";
import { formatGhs } from "../../api/billing";
import "./Owner.css";

const cedis = (p) => (p === null || p === undefined ? "" : String(p / 100));
const limit = (n) => (n === null || n === undefined ? "Unlimited" : n);

const toForm = (p) => ({
  name: p.name, tagline: p.tagline || "",
  priceMonthly: cedis(p.priceMonthly), priceYearly: cedis(p.priceYearly), extraEmployee: cedis(p.extraEmployee),
  includedEmployees: p.includedEmployees ?? "", maxAdmins: p.maxAdmins ?? "", maxHr: p.maxHr ?? "",
  payroll: p.features.payroll, auditLog: p.features.auditLog, prioritySupport: p.features.prioritySupport,
  isPublic: p.isPublic, highlighted: p.highlighted, featureList: p.featureList.join("\n"),
});

// Owner: edit plan prices, limits and features (no code change needed), and the founding offer
const OwnerPlans = () => {
  const [plans, setPlans] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [p, c] = await Promise.all([api.get("/api/platform/plans"), api.get("/api/platform/coupons")]);
      setPlans(p.data);
      setCoupons(c.data);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "Plans could not be loaded."));
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const open = (p) => { setEditing(p); setForm(toForm(p)); };
  const change = (e) => {
    const { name, type, checked, value } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/api/platform/plans/${editing.code}`, {
        name: form.name, tagline: form.tagline,
        priceMonthly: form.priceMonthly, priceYearly: form.priceYearly, extraEmployee: form.extraEmployee,
        includedEmployees: form.includedEmployees, maxAdmins: form.maxAdmins, maxHr: form.maxHr,
        features: { payroll: form.payroll, auditLog: form.auditLog, prioritySupport: form.prioritySupport },
        isPublic: form.isPublic, highlighted: form.highlighted, featureList: form.featureList,
      });
      toast.success(`${form.name} saved. New prices apply to new payments and renewals.`);
      setEditing(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, "The plan could not be saved."));
    } finally {
      setSaving(false);
    }
  };

  const toggleCoupon = async (c) => {
    try {
      await api.put(`/api/platform/coupons/${c.code}`, { isActive: !c.is_active });
      toast.success(c.is_active ? `${c.name} switched off.` : `${c.name} switched on.`);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, "The offer could not be changed."));
    }
  };

  return (
    <AppLayout nav={<OwnerNav />} title="Plans and prices" subtitle="Edit what each plan costs and includes. Changes show on the public pricing page within a minute." className="owner-plans">
      {error && <p className="error page-error" role="alert">{error}</p>}
      <section className="card card-flush">
        <div className="card-header"><h2 className="card-title">Plans</h2></div>
        <div className="table-wrap">
          <table className="data-table plans-table">
            <thead>
              <tr><th>Plan</th><th className="num">Monthly</th><th className="num">Yearly</th><th className="num">Employees</th><th className="num">Extra employee</th><th className="num">Admins / HR</th><th>Includes</th><th>Shown</th><th /></tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.code} data-plan={p.code}>
                  <td data-label="Plan" className="cell-strong">{p.name}{p.highlighted && <span className="badge badge-primary"> Popular</span>}</td>
                  <td data-label="Monthly" className="num">{formatGhs(p.priceMonthly)}</td>
                  <td data-label="Yearly" className="num">{formatGhs(p.priceYearly)}</td>
                  <td data-label="Employees" className="num">{limit(p.includedEmployees)}</td>
                  <td data-label="Extra employee" className="num">{p.extraEmployee == null ? "–" : `${formatGhs(p.extraEmployee)}/mo`}</td>
                  <td data-label="Admins / HR" className="num">{limit(p.maxAdmins)} / {limit(p.maxHr)}</td>
                  <td data-label="Includes">{[p.features.payroll && "Payroll", p.features.auditLog && "Audit log", p.features.prioritySupport && "Priority support"].filter(Boolean).join(", ") || "Core records"}</td>
                  <td data-label="Shown">{p.isPublic ? "Public" : "Hidden"}</td>
                  <td><button type="button" className="btn btn-ghost btn-sm edit-plan-btn" onClick={() => open(p)} aria-label={`Edit ${p.name}`}><Pencil size={15} /> Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="owner-section-note owner-card-note">Paying organisations keep their current price until their next renewal; Paystack plans are updated when they renew. Enterprise prices are agreed per organisation (Organisations → Assign plan).</p>
      </section>

      <section className="card card-flush section coupons-card">
        <div className="card-header"><h2 className="card-title">Founding offer</h2></div>
        {coupons.map((c) => (
          <div className="coupon-row" key={c.code} data-coupon={c.code}>
            <div>
              <p className="cell-strong">{c.name} <span className={`badge ${c.is_active ? "badge-success" : ""}`}>{c.is_active ? "On" : "Off"}</span></p>
              <p className="owner-section-note">{c.percent_off}% off for {c.duration_months} months. {c.redeemed_count} of {c.max_redemptions ?? "unlimited"} places used.{c.auto_apply ? " Applied automatically at an organisation's first payment." : ""}</p>
            </div>
            <button type="button" className={`btn btn-sm ${c.is_active ? "btn-secondary" : "btn-primary"} coupon-toggle`} onClick={() => toggleCoupon(c)}>
              {c.is_active ? "Switch off" : "Switch on"}
            </button>
          </div>
        ))}
      </section>

      <Modal isOpen={Boolean(editing)} onClose={() => setEditing(null)} title={editing ? `Edit ${editing.name}` : "Edit plan"}>
        {form && (
          <form className="owner-form plan-form" onSubmit={save}>
            <div className="form-grid">
              <div className="field"><label htmlFor="plan-name">Name</label><input id="plan-name" name="name" value={form.name} onChange={change} minLength={2} maxLength={60} required /></div>
              <div className="field"><label htmlFor="plan-tagline">Tagline</label><input id="plan-tagline" name="tagline" value={form.tagline} onChange={change} maxLength={160} /></div>
              <div className="field"><label htmlFor="plan-monthly">Monthly price (GHS)</label><input id="plan-monthly" name="priceMonthly" type="number" min="0" step="0.01" value={form.priceMonthly} onChange={change} placeholder="Custom" /></div>
              <div className="field"><label htmlFor="plan-yearly">Yearly price (GHS)</label><input id="plan-yearly" name="priceYearly" type="number" min="0" step="0.01" value={form.priceYearly} onChange={change} placeholder="Custom" /></div>
              <div className="field"><label htmlFor="plan-included">Employees included</label><input id="plan-included" name="includedEmployees" type="number" min="0" value={form.includedEmployees} onChange={change} placeholder="Unlimited" /></div>
              <div className="field"><label htmlFor="plan-extra">Extra employee a month (GHS)</label><input id="plan-extra" name="extraEmployee" type="number" min="0" step="0.01" value={form.extraEmployee} onChange={change} placeholder="No extras (hard limit)" /></div>
              <div className="field"><label htmlFor="plan-admins">Admin accounts</label><input id="plan-admins" name="maxAdmins" type="number" min="1" value={form.maxAdmins} onChange={change} placeholder="Unlimited" /></div>
              <div className="field"><label htmlFor="plan-hr">HR accounts</label><input id="plan-hr" name="maxHr" type="number" min="0" value={form.maxHr} onChange={change} placeholder="Unlimited" /></div>
            </div>
            <fieldset className="plan-flags">
              <legend>Includes and display</legend>
              {[["payroll", "Payroll and payslips"], ["auditLog", "Organisation audit log"], ["prioritySupport", "Priority support"], ["isPublic", "Show on the pricing page"], ["highlighted", "Mark as most popular"]].map(([k, l]) => (
                <label key={k} className="checkbox"><input type="checkbox" name={k} checked={form[k]} onChange={change} /> {l}</label>
              ))}
            </fieldset>
            <div className="field">
              <label htmlFor="plan-features">Feature list (one per line, shown on the pricing page)</label>
              <textarea id="plan-features" name="featureList" rows={5} value={form.featureList} onChange={change} />
            </div>
            <div className="modal-actions form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary save-plan-btn" disabled={saving}>{saving && <span className="spinner" aria-hidden="true" />} Save plan</button>
            </div>
          </form>
        )}
      </Modal>
    </AppLayout>
  );
};

export default OwnerPlans;
