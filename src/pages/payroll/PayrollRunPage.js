import React, { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, Send, Eye, Download, Trash2, Wallet, Landmark, Users, Building } from "lucide-react";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../../api/client";
import HRNav from "../../components/layout/HRNav";
import AdminNav from "../../components/layout/AdminNav";
import AppLayout from "../../components/layout/AppLayout";
import { formatAmount, formatMoney, periodLabel, dateLabel, PayslipStatusBadge, downloadPdf, pdfFilename } from "./payrollShared";
import "../hr/HRDashboard.css";
import "./Payroll.css";

// One payroll month: every payslip with totals; publish drafts (all or selected), delete a
// draft (to re-run it after a pay change), view or download any payslip.
const PayrollRunPage = () => {
  const { period } = useParams();
  const location = useLocation();
  const isAdminArea = location.pathname.startsWith("/admin");
  const area = isAdminArea ? "/admin" : "/hr";
  const [run, setRun] = useState(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/api/payroll/runs/${period}`);
      setRun(res.data);
      setSelected([]);
    } catch (err) {
      setError(err.response?.status === 404 ? `There is no payroll for ${periodLabel(period)} yet.` : getErrorMessage(err, "Payroll could not be loaded."));
    }
  }, [period]);

  useEffect(() => { load(); }, [load]);

  const drafts = run ? run.payslips.filter((p) => p.status === "draft") : [];
  const t = run ? run.totals : {};

  const publish = async (ids) => {
    const count = ids ? ids.length : drafts.length;
    if (!window.confirm(`Publish ${count} payslip(s) for ${periodLabel(period)}? Employees will be able to see them, and published payslips cannot be changed.`)) return;
    setBusy(true);
    try {
      const res = await api.post(`/api/payroll/runs/${period}/publish`, ids ? { payslipIds: ids } : {});
      toast.success(res.data.message);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Payslips could not be published."));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete the draft payslip of ${p.employee_name}? You can run payroll again for this month to recreate it.`)) return;
    try {
      await api.delete(`/api/payroll/payslips/${p.id}`);
      toast.success("Draft payslip deleted.");
      if (run.payslips.length === 1) setRun({ ...run, payslips: [], totals: {} });
      else load();
    } catch (err) {
      toast.error(getErrorMessage(err, "The draft could not be deleted."));
    }
  };

  const download = async (p) => {
    try {
      await downloadPdf(`/api/payroll/payslips/${p.id}/pdf`, pdfFilename(p));
    } catch (err) {
      toast.error(getErrorMessage(err, "The PDF could not be downloaded."));
    }
  };

  return (
    <AppLayout
      nav={isAdminArea ? <AdminNav /> : <HRNav />}
      className="payroll-run-page"
      title={`Payroll – ${periodLabel(period)}`}
      subtitle={run ? `Pay date ${dateLabel(run.pay_date)} · ${run.payslips.length} payslip(s), ${drafts.length} draft` : undefined}
      actions={
        <div className="payslip-toolbar">
          <Link className="btn btn-ghost" to={`${area}/payroll`}><ArrowLeft size={16} /> Payroll</Link>
          {drafts.length > 0 && (
            <>
              {selected.length > 0 && (
                <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => publish(selected)}>
                  <Send size={16} /> Publish selected ({selected.length})
                </button>
              )}
              <button type="button" className="btn btn-primary publish-all" disabled={busy} onClick={() => publish(null)}>
                <Send size={16} /> Publish all drafts ({drafts.length})
              </button>
            </>
          )}
        </div>
      }
    >
      {error && <div className="alert alert-info" role="status">{error} <Link to={`${area}/payroll`}>Back to payroll</Link></div>}
      {!run && !error && <p className="muted">Loading…</p>}
      {run && (
        <>
          <div className="stat-grid payroll-stats">
            <div className="stat-tile"><span className="stat-icon"><Users size={22} /></span><div><p className="stat-label">Gross pay</p><p className="stat-value">{formatMoney(t.gross_pesewas || 0)}</p></div></div>
            <div className="stat-tile"><span className="stat-icon accent"><Landmark size={22} /></span><div><p className="stat-label">PAYE to GRA</p><p className="stat-value">{formatMoney(t.paye_pesewas || 0)}</p></div></div>
            <div className="stat-tile"><span className="stat-icon"><Building size={22} /></span><div><p className="stat-label">SSNIT (5.5% + 13%)</p><p className="stat-value">{formatMoney((t.ssnit_employee_pesewas || 0) + (t.ssnit_employer_pesewas || 0))}</p></div></div>
            <div className="stat-tile"><span className="stat-icon accent"><Wallet size={22} /></span><div><p className="stat-label">Net pay</p><p className="stat-value">{formatMoney(t.net_pesewas || 0)}</p></div></div>
          </div>

          <section className="card card-flush">
            <div className="card-header"><h2 className="card-title">Payslips</h2><span className="muted">Amounts in GHS</span></div>
            <div className="table-wrap">
              <table className="data-table stack">
                <thead>
                  <tr>
                    <th scope="col"><span className="visually-hidden">Select</span></th>
                    <th scope="col">Employee</th><th scope="col">Status</th>
                    <th scope="col" className="num">Gross</th><th scope="col" className="num">SSNIT</th><th scope="col" className="num">PAYE</th>
                    <th scope="col" className="num">Other deductions</th><th scope="col" className="num">Net pay</th><th scope="col" className="num">Employer SSNIT</th>
                    <th scope="col"><span className="visually-hidden">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {run.payslips.length === 0 && <tr className="empty-row"><td colSpan={10}>No payslips for this month. Run payroll to create them.</td></tr>}
                  {run.payslips.map((p) => (
                    <tr key={p.id}>
                      <td>
                        {p.status === "draft" && (
                          <input type="checkbox" aria-label={`Select ${p.employee_name}`} checked={selected.includes(p.id)}
                            onChange={(e) => setSelected(e.target.checked ? [...selected, p.id] : selected.filter((id) => id !== p.id))} />
                        )}
                      </td>
                      <td data-label="Employee"><span className="cell-strong">{p.employee_name}</span><br /><span className="cell-muted">{p.employee_number} · {p.department_name || "–"}</span></td>
                      <td data-label="Status"><PayslipStatusBadge status={p.status} /></td>
                      <td data-label="Gross" className="num">{formatAmount(p.gross_pesewas)}</td>
                      <td data-label="SSNIT" className="num">{formatAmount(p.ssnit_employee_pesewas)}</td>
                      <td data-label="PAYE" className="num">{formatAmount(p.paye_pesewas)}</td>
                      <td data-label="Other deductions" className="num">{formatAmount(p.other_deductions_pesewas)}</td>
                      <td data-label="Net pay" className="num cell-strong">{formatAmount(p.net_pesewas)}</td>
                      <td data-label="Employer SSNIT" className="num cell-muted">{formatAmount(p.ssnit_employer_pesewas)}</td>
                      <td className="td-actions">
                        <div className="row-actions">
                          <Link className="btn btn-secondary btn-sm" to={`${area}/payslips/${p.id}`} aria-label={`View payslip of ${p.employee_name}`}><Eye size={15} /> View</Link>
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => download(p)} aria-label={`Download PDF of ${p.employee_name}`}><Download size={15} /> PDF</button>
                          {p.status === "draft" && (
                            <button type="button" className="btn btn-danger-soft btn-sm" onClick={() => remove(p)} aria-label={`Delete draft of ${p.employee_name}`}><Trash2 size={15} /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {run.payslips.length > 0 && (
                  <tfoot>
                    <tr>
                      <td />
                      <th scope="row">Totals</th>
                      <td />
                      <td data-label="Gross" className="num">{formatAmount(t.gross_pesewas)}</td>
                      <td data-label="SSNIT" className="num">{formatAmount(t.ssnit_employee_pesewas)}</td>
                      <td data-label="PAYE" className="num">{formatAmount(t.paye_pesewas)}</td>
                      <td data-label="Other deductions" className="num">{formatAmount(t.other_deductions_pesewas)}</td>
                      <td data-label="Net pay" className="num">{formatAmount(t.net_pesewas)}</td>
                      <td data-label="Employer SSNIT" className="num">{formatAmount(t.ssnit_employer_pesewas)}</td>
                      <td />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </section>
        </>
      )}
    </AppLayout>
  );
};

export default PayrollRunPage;
