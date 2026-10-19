import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, Download, Printer } from "lucide-react";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../../api/client";
import EmployeeNav from "../../components/layout/EmployeeNav";
import HRNav from "../../components/layout/HRNav";
import AdminNav from "../../components/layout/AdminNav";
import AppLayout from "../../components/layout/AppLayout";
import PayslipDocument from "./PayslipDocument";
import { periodLabel, formatAmount, formatMoney, rateLabel, dateLabel, downloadPdf, pdfFilename } from "./payrollShared";
import "./Payroll.css";

// One payslip with Print and Download PDF.
//   mode "employee": /employee/payslips/:id (own published payslips only)
//   mode "hr":       /hr/payslips/:id and /admin/payslips/:id (any payslip of the organisation)
// ?print=1 opens the print dialog once the payslip has loaded (the Print button of the list).
// How the PAYE on this payslip was worked out, band by band (screen only)
const PayeWorking = ({ payslip }) => {
  const bands = payslip.lines?.payeBands || [];
  const rules = payslip.lines?.rules || {};
  return (
    <aside className="card paye-working no-print" aria-label="How PAYE was worked out">
      <h2 className="card-title">How PAYE was worked out</h2>
      <p className="muted field-hint">
        Taxable income is gross pay less employee SSNIT: {formatMoney(payslip.gross_pesewas)} − {formatMoney(payslip.ssnit_employee_pesewas)} = <strong>{formatMoney(payslip.taxable_pesewas)}</strong>.
      </p>
      <table className="payslip-table">
        <thead><tr><th scope="col">Band (GHS)</th><th scope="col" className="num">Rate</th><th scope="col" className="num">Tax</th></tr></thead>
        <tbody>
          {bands.map((b) => (
            <tr key={b.from}>
              <td>{formatAmount(b.slice)} {b.from === 0 ? "(first)" : `above ${formatAmount(b.from)}`}</td>
              <td className="num">{rateLabel(b.rateBp)}</td>
              <td className="num">{formatAmount(b.tax)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot><tr><th scope="row" colSpan={2}>PAYE</th><td className="num">{formatAmount(payslip.paye_pesewas)}</td></tr></tfoot>
      </table>
      {rules.payeEffectiveFrom && <p className="muted field-hint">Monthly resident rates in force from {dateLabel(rules.payeEffectiveFrom)}. The total is rounded once, so it can differ from the sum of the bands by a pesewa.</p>}
    </aside>
  );
};

const PayslipPage = ({ mode = "employee" }) => {
  const { id } = useParams();
  const location = useLocation();
  const [payslip, setPayslip] = useState(null);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const printed = useRef(false);
  const isAdminArea = location.pathname.startsWith("/admin");
  const base = mode === "employee" ? "/api/payroll/my-payslips" : "/api/payroll/payslips";

  useEffect(() => {
    setPayslip(null);
    setError("");
    api.get(`${base}/${id}`)
      .then((res) => setPayslip(res.data))
      .catch((err) => setError(err.response?.status === 404 ? "This payslip was not found." : getErrorMessage(err, "The payslip could not be loaded.")));
  }, [base, id]);

  useEffect(() => {
    if (payslip && !printed.current && new URLSearchParams(location.search).get("print") === "1") {
      printed.current = true;
      setTimeout(() => window.print(), 300);
    }
  }, [payslip, location.search]);

  const download = async () => {
    setDownloading(true);
    try {
      await downloadPdf(`${base}/${id}/pdf`, pdfFilename(payslip));
    } catch (err) {
      toast.error(getErrorMessage(err, "The PDF could not be downloaded."));
    } finally {
      setDownloading(false);
    }
  };

  const back = mode === "employee"
    ? { to: "/employee/payslips", label: "My payslips" }
    : { to: `${isAdminArea ? "/admin" : "/hr"}/payroll${payslip ? `/${payslip.period}` : ""}`, label: payslip ? `Payroll ${periodLabel(payslip.period)}` : "Payroll" };
  const nav = mode === "employee" ? <EmployeeNav /> : isAdminArea ? <AdminNav /> : <HRNav />;

  return (
    <AppLayout
      nav={nav}
      className="payslip-page"
      title={payslip ? `Payslip – ${periodLabel(payslip.period)}` : "Payslip"}
      subtitle={payslip && mode !== "employee" ? payslip.employee_name : undefined}
      actions={
        <div className="payslip-toolbar">
          <Link className="btn btn-ghost" to={back.to}><ArrowLeft size={16} /> {back.label}</Link>
          {payslip && (
            <>
              <button type="button" className="btn btn-secondary" onClick={() => window.print()}><Printer size={16} /> Print</button>
              <button type="button" className="btn btn-primary" onClick={download} disabled={downloading}>
                {downloading ? <span className="spinner" aria-hidden="true" /> : <Download size={16} />} Download PDF
              </button>
            </>
          )}
        </div>
      }
    >
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {!payslip && !error && <p className="muted">Loading payslip…</p>}
      {payslip && (
        <div className="payslip-layout">
          <div className="payslip-view">
            <PayslipDocument payslip={payslip} showStatus={mode !== "employee"} />
          </div>
          <PayeWorking payslip={payslip} />
        </div>
      )}
    </AppLayout>
  );
};

export default PayslipPage;
