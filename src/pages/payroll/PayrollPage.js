import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Play, Pencil, Plus, Trash2, Wallet, Receipt, Landmark, CalendarDays, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../../api/client";
import HRNav from "../../components/layout/HRNav";
import AdminNav from "../../components/layout/AdminNav";
import AppLayout from "../../components/layout/AppLayout";
import Modal from "../../components/common/Modal";
import { formatMoney, formatAmount, periodLabel, dateLabel, rateLabel, toInputAmount, currentPeriod, lastWorkingDay } from "./payrollShared";
import "../hr/HRDashboard.css";
import "./Payroll.css";

// Payroll (HR and admins): payroll months with totals, running payroll for a month, and each
// employee's pay details (basic salary, allowances, other deductions, bank). PAYE and SSNIT are
// calculated by the server with the Ghana rules in its config (shown on the "Tax rates" tab).

const TABS = [
  { id: "runs", label: "Payroll months" },
  { id: "pay", label: "Pay details" },
  { id: "rates", label: "Tax rates" },
];

// ---------- pay details form (with a live calculation)

const emptyLine = () => ({ name: "", amount: "" });

const LineEditor = ({ title, kind, lines, onChange, disabled }) => (
  <div className="pay-section">
    <h4>{title}</h4>
    {lines.length === 0 && <p className="muted field-hint">None.</p>}
    <div className="pay-lines">
      {lines.map((line, i) => (
        <div className="pay-line" key={i}>
          <input className="input" aria-label={`${kind} ${i + 1} name`} placeholder={kind === "Allowance" ? "e.g. Transport" : "e.g. Staff welfare"} maxLength={80} value={line.name} disabled={disabled}
            onChange={(e) => onChange(lines.map((l, j) => (j === i ? { ...l, name: e.target.value } : l)))} />
          <input className="input" aria-label={`${kind} ${i + 1} amount (GHS)`} inputMode="decimal" placeholder="0.00" value={line.amount} disabled={disabled}
            onChange={(e) => onChange(lines.map((l, j) => (j === i ? { ...l, amount: e.target.value } : l)))} />
          <button type="button" className="icon-btn" aria-label={`Remove ${kind.toLowerCase()} ${i + 1}`} disabled={disabled} onClick={() => onChange(lines.filter((_, j) => j !== i))}>
            <Trash2 size={16} />
          </button>
        </div>
      ))}
    </div>
    <div>
      <button type="button" className="btn btn-ghost btn-sm" disabled={disabled || lines.length >= 20} onClick={() => onChange([...lines, emptyLine()])}>
        <Plus size={16} /> Add {kind.toLowerCase()}
      </button>
    </div>
  </div>
);

const toForm = (s) => ({
  basicSalary: toInputAmount(s.basic),
  allowances: (s.allowances || []).map((a) => ({ name: a.name, amount: toInputAmount(a.amount) })),
  deductions: (s.deductions || []).map((d) => ({ name: d.name, amount: toInputAmount(d.amount) })),
  bankName: s.bankName || "",
  bankAccount: s.bankAccount || "",
  ssnitNumber: s.ssnitNumber || "",
});

// Lines with nothing typed in are ignored
const cleanLines = (lines) => lines.filter((l) => l.name.trim() || String(l.amount).trim());

export const PayDetailsForm = ({ employee, onSaved, onCancel }) => {
  const [details, setDetails] = useState(null);
  const [form, setForm] = useState(null);
  const [preview, setPreview] = useState(null);
  const [previewError, setPreviewError] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/api/payroll/employees/${employee.employeeId}/pay-details`)
      .then((res) => { setDetails(res.data); setForm(toForm(res.data)); })
      .catch((err) => setError(getErrorMessage(err, "Pay details could not be loaded.")));
  }, [employee.employeeId]);

  // Recalculate shortly after typing stops
  useEffect(() => {
    if (!form) return undefined;
    const t = setTimeout(() => {
      api.post("/api/payroll/preview", { ...form, allowances: cleanLines(form.allowances), deductions: cleanLines(form.deductions) })
        .then((res) => { setPreview(res.data); setPreviewError(""); })
        .catch((err) => { setPreview(null); setPreviewError(getErrorMessage(err, "")); });
    }, 350);
    return () => clearTimeout(t);
  }, [form]);

  if (error) return <div className="alert alert-danger" role="alert">{error}</div>;
  if (!form) return <p className="muted">Loading…</p>;
  const locked = Boolean(details.demoProtected);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/api/payroll/employees/${employee.employeeId}/pay-details`, { ...form, allowances: cleanLines(form.allowances), deductions: cleanLines(form.deductions) });
      toast.success(`Pay details of ${employee.name} saved.`);
      onSaved();
    } catch (err) {
      toast.error(getErrorMessage(err, "Pay details could not be saved."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="pay-form" onSubmit={submit}>
      {locked && (
        <div className="alert alert-info" role="note">
          This is the demo employee whose payslips the public demo login shows, so these pay details can't be changed.
        </div>
      )}
      <div className="form-grid">
        <div className="field">
          <label htmlFor="pay-basic">Basic monthly salary (GHS)</label>
          <input id="pay-basic" className="input" inputMode="decimal" required value={form.basicSalary} onChange={set("basicSalary")} disabled={locked} />
          <span className="field-hint">SSNIT is calculated on the basic salary.</span>
        </div>
        <div className="field">
          <label htmlFor="pay-ssnit">SSNIT number <span className="field-optional">(optional)</span></label>
          <input id="pay-ssnit" className="input" maxLength={20} value={form.ssnitNumber} onChange={set("ssnitNumber")} disabled={locked} />
        </div>
        <div className="field">
          <label htmlFor="pay-bank">Bank <span className="field-optional">(optional)</span></label>
          <input id="pay-bank" className="input" maxLength={100} placeholder="e.g. GCB Bank" value={form.bankName} onChange={set("bankName")} disabled={locked} />
        </div>
        <div className="field">
          <label htmlFor="pay-account">Account number <span className="field-optional">(optional)</span></label>
          <input id="pay-account" className="input" maxLength={40} value={form.bankAccount} onChange={set("bankAccount")} disabled={locked} />
          <span className="field-hint">Payslips show only the last four digits.</span>
        </div>
      </div>
      <LineEditor title="Allowances (taxable, added to gross pay)" kind="Allowance" lines={form.allowances} disabled={locked} onChange={(allowances) => setForm({ ...form, allowances })} />
      <LineEditor title="Other deductions (after tax, e.g. loan repayment)" kind="Deduction" lines={form.deductions} disabled={locked} onChange={(deductions) => setForm({ ...form, deductions })} />

      <div className="pay-preview" aria-live="polite">
        {preview ? (
          <dl>
            <div><dt>Gross</dt><dd>{formatAmount(preview.gross)}</dd></div>
            <div><dt>SSNIT 5.5%</dt><dd>{formatAmount(preview.ssnitEmployee)}</dd></div>
            <div><dt>PAYE</dt><dd>{formatAmount(preview.paye)}</dd></div>
            <div><dt>Other deductions</dt><dd>{formatAmount(preview.deductionsTotal)}</dd></div>
            <div className="net"><dt>Net pay (GHS)</dt><dd>{formatAmount(preview.net)}</dd></div>
          </dl>
        ) : (
          <span className="muted">{previewError || "Calculating…"}</span>
        )}
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>{locked ? "Close" : "Cancel"}</button>
        {!locked && (
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving && <span className="spinner" aria-hidden="true" />} Save pay details
          </button>
        )}
      </div>
    </form>
  );
};

// ---------- run payroll

const RunPayrollForm = ({ employees, onDone, onCancel }) => {
  const [period, setPeriod] = useState(currentPeriod());
  const [payDate, setPayDate] = useState(lastWorkingDay(currentPeriod()));
  const [scope, setScope] = useState("all");
  const [selected, setSelected] = useState([]);
  const [busy, setBusy] = useState(false);
  const payable = employees.filter((e) => e.basic > 0);

  const changePeriod = (value) => {
    setPeriod(value);
    if (/^\d{4}-\d{2}$/.test(value)) setPayDate(lastWorkingDay(value));
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api.post("/api/payroll/runs", { period, payDate, ...(scope === "selected" ? { employeeIds: selected } : {}) });
      const { created, skipped, noSalary } = res.data;
      toast.success(res.data.message);
      if (skipped && created) toast(`${skipped} employee(s) already had a payslip for ${periodLabel(period)}.`);
      if (noSalary?.length) toast(`Left out (no salary): ${noSalary.map((n) => n.name).join(", ")}`);
      onDone(period);
    } catch (err) {
      toast.error(getErrorMessage(err, "Payroll could not be run."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="pay-form" onSubmit={submit}>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="run-period">Month</label>
          <input id="run-period" className="input" type="month" required value={period} onChange={(e) => changePeriod(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="run-paydate">Pay date</label>
          <input id="run-paydate" className="input" type="date" required value={payDate} onChange={(e) => setPayDate(e.target.value)} />
        </div>
      </div>
      <fieldset className="option-list inline">
        <legend className="field-label">Employees</legend>
        <label className="option-row">
          <input type="radio" name="scope" value="all" checked={scope === "all"} onChange={() => setScope("all")} />
          <span className="option-text">All employees ({payable.length})</span>
        </label>
        <label className="option-row">
          <input type="radio" name="scope" value="selected" checked={scope === "selected"} onChange={() => setScope("selected")} />
          <span className="option-text">Selected employees</span>
        </label>
      </fieldset>
      {scope === "selected" && (
        <div className="employee-picker option-list" role="group" aria-label="Select employees">
          {payable.map((e) => (
            <label key={e.employeeId} className="option-row">
              <input type="checkbox" checked={selected.includes(e.employeeId)}
                onChange={(ev) => setSelected(ev.target.checked ? [...selected, e.employeeId] : selected.filter((id) => id !== e.employeeId))} />
              <span className="option-text">{e.name} <span className="muted">· {formatMoney(e.basic)}</span></span>
            </label>
          ))}
        </div>
      )}
      <p className="field-hint">Creates draft payslips from the current pay details. Employees see them only after you publish. Anyone who already has a payslip for the month is left as it is.</p>
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={busy || (scope === "selected" && !selected.length)}>
          {busy && <span className="spinner" aria-hidden="true" />} Create draft payslips
        </button>
      </div>
    </form>
  );
};

// ---------- tax rates

const bandRows = (bands) => {
  let lower = 0;
  return bands.map((b) => {
    const row = { from: lower, upTo: b.upTo, rateBp: b.rateBp };
    lower = b.upTo;
    return row;
  });
};

const TaxRates = ({ rules }) => {
  if (!rules) return <p className="muted">Loading…</p>;
  return (
    <div className="two-col">
      {rules.paye.map((t) => (
        <section className="card card-flush tax-bands" key={t.effectiveFrom}>
          <div className="card-header"><h2 className="card-title">PAYE from {dateLabel(t.effectiveFrom)}</h2></div>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th scope="col">Monthly taxable income (GHS)</th><th scope="col" className="num">Rate</th></tr></thead>
              <tbody>
                {bandRows(t.bands).map((b) => (
                  <tr key={b.from}>
                    <td>{b.upTo === null ? `Above ${formatAmount(b.from)}` : b.from === 0 ? `First ${formatAmount(b.upTo)}` : `${formatAmount(b.from)} – ${formatAmount(b.upTo)}`}</td>
                    <td className="num">{rateLabel(b.rateBp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="muted field-hint" style={{ padding: "0 var(--space-5) var(--space-4)" }}>{t.label}</p>
        </section>
      ))}
      <section className="card">
        <div className="card-header"><h2 className="card-title">SSNIT (Tier 1)</h2></div>
        <dl className="detail-list">
          {rules.ssnit.map((s) => (
            <React.Fragment key={s.effectiveFrom}>
              <div><dt>From {dateLabel(s.effectiveFrom)}</dt><dd>Employee {rateLabel(s.employeeRateBp)}, employer {rateLabel(s.employerRateBp)}</dd></div>
              <div><dt>Maximum insurable</dt><dd>{formatMoney(s.maxInsurablePesewas)} a month</dd></div>
            </React.Fragment>
          ))}
        </dl>
        <p className="muted field-hint">Employee SSNIT is deducted before PAYE. Employer SSNIT is shown on payslips for information and is not deducted. Payroll can be run from {periodLabel(rules.earliestPeriod)}.</p>
      </section>
    </div>
  );
};

// ---------- page

const PayrollPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminArea = location.pathname.startsWith("/admin");
  const base = isAdminArea ? "/admin/payroll" : "/hr/payroll";
  const [tab, setTab] = useState("runs");
  const [runs, setRuns] = useState(null);
  const [employees, setEmployees] = useState(null);
  const [rules, setRules] = useState(null);
  const [running, setRunning] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [r, p] = await Promise.all([api.get("/api/payroll/runs"), api.get("/api/payroll/pay-details")]);
      setRuns(r.data);
      setEmployees(p.data);
    } catch (err) {
      setError(getErrorMessage(err, "Payroll could not be loaded."));
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (tab === "rates" && !rules) api.get("/api/payroll/tax-rules").then((res) => setRules(res.data)).catch(() => {});
  }, [tab, rules]);

  const latest = runs && runs[0];
  const monthlyNet = useMemo(() => (employees || []).reduce((t, e) => t + (e.net || 0), 0), [employees]);

  return (
    <AppLayout
      nav={isAdminArea ? <AdminNav /> : <HRNav />}
      className="payroll-page"
      title="Payroll"
      subtitle="Run monthly payroll, publish payslips to employees and keep each person's pay details up to date. PAYE and SSNIT follow the current Ghana rates."
      actions={
        <button type="button" className="btn btn-primary run-payroll" onClick={() => setRunning(true)} disabled={!employees}>
          <Play size={18} /> Run payroll
        </button>
      }
    >
      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <div className="stat-grid payroll-stats">
        <div className="stat-tile">
          <span className="stat-icon"><CalendarDays size={22} /></span>
          <div><p className="stat-label">Latest month</p><p className="stat-value">{runs ? (latest ? periodLabel(latest.period) : "None yet") : "–"}</p></div>
        </div>
        <div className="stat-tile">
          <span className="stat-icon accent"><Wallet size={22} /></span>
          <div><p className="stat-label">Net pay, latest month</p><p className="stat-value">{latest ? formatMoney(latest.net) : "–"}</p></div>
        </div>
        <div className="stat-tile">
          <span className="stat-icon"><Landmark size={22} /></span>
          <div><p className="stat-label">PAYE, latest month</p><p className="stat-value">{latest ? formatMoney(latest.paye) : "–"}</p></div>
        </div>
        <div className="stat-tile">
          <span className="stat-icon accent"><Receipt size={22} /></span>
          <div><p className="stat-label">Monthly net, current pay</p><p className="stat-value">{employees ? formatMoney(monthlyNet) : "–"}</p></div>
        </div>
      </div>

      <div className="payroll-tabs" role="tablist" aria-label="Payroll sections">
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" id={`tab-${t.id}`} aria-selected={tab === t.id} aria-controls={`panel-${t.id}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {tab === "runs" && (
        <section className="card card-flush" role="tabpanel" id="panel-runs" aria-labelledby="tab-runs">
          <div className="card-header"><h2 className="card-title">Payroll months</h2></div>
          <div className="table-wrap">
            <table className="data-table stack">
              <thead>
                <tr>
                  <th scope="col">Month</th><th scope="col">Pay date</th><th scope="col">Payslips</th>
                  <th scope="col" className="num">Gross</th><th scope="col" className="num">PAYE</th><th scope="col" className="num">SSNIT (employee)</th><th scope="col" className="num">Net pay</th><th scope="col"><span className="visually-hidden">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {runs === null && <tr className="empty-row"><td colSpan={8}>Loading…</td></tr>}
                {runs && runs.length === 0 && <tr className="empty-row"><td colSpan={8}>No payroll yet. Set pay details, then choose "Run payroll".</td></tr>}
                {runs && runs.map((r) => (
                  <tr key={r.id}>
                    <td data-label="Month" className="cell-strong">{periodLabel(r.period)}</td>
                    <td data-label="Pay date" className="cell-nowrap">{dateLabel(r.pay_date)}</td>
                    <td data-label="Payslips">
                      {r.published_count > 0 && <span className="badge payslip-status-published">{r.published_count} published</span>}{" "}
                      {r.draft_count > 0 && <span className="badge payslip-status-draft">{r.draft_count} draft</span>}
                    </td>
                    <td data-label="Gross" className="num">{formatAmount(r.gross)}</td>
                    <td data-label="PAYE" className="num">{formatAmount(r.paye)}</td>
                    <td data-label="SSNIT (employee)" className="num">{formatAmount(r.ssnit_employee)}</td>
                    <td data-label="Net pay" className="num cell-strong">{formatAmount(r.net)}</td>
                    <td className="td-actions"><Link className="btn btn-secondary btn-sm" to={`${base}/${r.period}`} aria-label={`Open payroll for ${periodLabel(r.period)}`}>Open</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "pay" && (
        <section className="card card-flush" role="tabpanel" id="panel-pay" aria-labelledby="tab-pay">
          <div className="card-header"><h2 className="card-title">Pay details</h2><span className="muted">Amounts in GHS a month · net at this month's rates</span></div>
          <div className="table-wrap">
            <table className="data-table stack">
              <thead>
                <tr>
                  <th scope="col">Employee</th><th scope="col">Department</th><th scope="col" className="num">Basic</th><th scope="col" className="num">Allowances</th>
                  <th scope="col" className="num">Other deductions</th><th scope="col" className="num">Net pay</th><th scope="col">Bank</th><th scope="col"><span className="visually-hidden">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {employees === null && <tr className="empty-row"><td colSpan={8}>Loading…</td></tr>}
                {employees && employees.length === 0 && <tr className="empty-row"><td colSpan={8}>No employees yet. Add employees first.</td></tr>}
                {employees && employees.map((e) => (
                  <tr key={e.employeeId}>
                    <td data-label="Employee"><span className="cell-strong">{e.name}</span><br /><span className="cell-muted">{e.employeeNumber} · {e.jobTitle}</span></td>
                    <td data-label="Department">{e.department || "–"}</td>
                    <td data-label="Basic" className="num">{formatAmount(e.basic)}{!e.saved && <span className="cell-muted" title="From the employee record; not saved as pay details yet"> *</span>}</td>
                    <td data-label="Allowances" className="num">{formatAmount(e.allowances.reduce((t, a) => t + a.amount, 0))}</td>
                    <td data-label="Other deductions" className="num">{formatAmount(e.deductions.reduce((t, d) => t + d.amount, 0))}</td>
                    <td data-label="Net pay" className="num cell-strong">{e.net === null ? "–" : formatAmount(e.net)}</td>
                    <td data-label="Bank">{e.bankName || <span className="cell-muted">–</span>}</td>
                    <td className="td-actions">
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditing(e)} aria-label={`Edit pay details of ${e.name}`}><Pencil size={15} /> Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {employees && employees.some((e) => !e.saved) && <p className="muted field-hint" style={{ padding: "var(--space-3) var(--space-5)" }}>* Basic salary taken from the employee record until pay details are saved.</p>}
        </section>
      )}

      {tab === "rates" && (
        <div role="tabpanel" id="panel-rates" aria-labelledby="tab-rates">
          <TaxRates rules={rules} />
          <p className="muted field-hint"><ShieldCheck size={14} aria-hidden="true" /> Rates are set in the server's payroll configuration with their legal source and effective date. Each payslip keeps the rates it was calculated with.</p>
        </div>
      )}

      <Modal isOpen={running} onClose={() => setRunning(false)} title="Run payroll" className="pay-modal">
        {employees && <RunPayrollForm employees={employees} onCancel={() => setRunning(false)} onDone={(period) => { setRunning(false); navigate(`${base}/${period}`); }} />}
      </Modal>
      <Modal isOpen={Boolean(editing)} onClose={() => setEditing(null)} title={editing ? `Pay details – ${editing.name}` : ""} className="pay-modal">
        {editing && <PayDetailsForm employee={editing} onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
      </Modal>
    </AppLayout>
  );
};

export default PayrollPage;
