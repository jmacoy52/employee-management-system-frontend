import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, Download, Printer, FileText } from "lucide-react";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../../api/client";
import EmployeeNav from "../../components/layout/EmployeeNav";
import AppLayout from "../../components/layout/AppLayout";
import { formatMoney, periodLabel, dateLabel, downloadPdf, pdfFilename } from "./payrollShared";
import "./Payroll.css";

// The signed-in employee's published payslips, newest first: view, download PDF or print.
const MyPayslips = () => {
  const navigate = useNavigate();
  const [payslips, setPayslips] = useState(null);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    api.get("/api/payroll/my-payslips")
      .then((res) => setPayslips(res.data))
      .catch((err) => { setError(getErrorMessage(err, "Your payslips could not be loaded.")); setPayslips([]); });
  }, []);

  const download = async (p) => {
    setDownloading(p.id);
    try {
      await downloadPdf(`/api/payroll/my-payslips/${p.id}/pdf`, pdfFilename(p));
    } catch (err) {
      toast.error(getErrorMessage(err, "The PDF could not be downloaded."));
    } finally {
      setDownloading(null);
    }
  };

  return (
    <AppLayout nav={<EmployeeNav />} className="my-payslips-page" title="My payslips" subtitle="Your monthly payslips, as published by HR. View, download or print any month.">
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {payslips === null && <p className="muted">Loading payslips…</p>}
      {payslips && payslips.length === 0 && !error && (
        <div className="card empty-state">
          <FileText size={32} aria-hidden="true" />
          <h2>No payslips yet</h2>
          <p>Your payslips appear here once HR publishes them.</p>
        </div>
      )}
      {payslips && payslips.length > 0 && (
        <ul className="payslip-list" aria-label="Payslips">
          {payslips.map((p) => (
            <li key={p.id} className="card payslip-row">
              <div className="payslip-row-main">
                <h2>{periodLabel(p.period)}</h2>
                <p>Paid {dateLabel(p.pay_date)} · <span className="badge-mono">{p.reference}</span></p>
              </div>
              <div className="payslip-row-net">
                <span>Net pay</span>
                <strong>{formatMoney(p.net_pesewas, p.currency)}</strong>
              </div>
              <div className="row-actions">
                <Link className="btn btn-primary btn-sm" to={`/employee/payslips/${p.id}`} aria-label={`View payslip for ${periodLabel(p.period)}`}>
                  <Eye size={16} /> View
                </Link>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => download(p)} disabled={downloading === p.id} aria-label={`Download PDF for ${periodLabel(p.period)}`}>
                  {downloading === p.id ? <span className="spinner" aria-hidden="true" /> : <Download size={16} />} Download PDF
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate(`/employee/payslips/${p.id}?print=1`)} aria-label={`Print payslip for ${periodLabel(p.period)}`}>
                  <Printer size={16} /> Print
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AppLayout>
  );
};

export default MyPayslips;
