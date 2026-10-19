import React from "react";
import { formatAmount, formatMoney, periodLabel, dateLabel, rateLabel, maskAccount, PayslipStatusBadge } from "./payrollShared";
import "./Payroll.css";

// One payslip, as published: shown on screen and printed (see the print styles in Payroll.css).
// Everything comes from the payslip snapshot, never from the current pay details.
const PayslipDocument = ({ payslip, showStatus = false }) => {
  const cur = payslip.currency || "GHS";
  const lines = payslip.lines || {};
  const rules = lines.rules || {};
  const earnings = [{ name: "Basic salary", amount: payslip.basic_pesewas }, ...(lines.allowances || [])];
  const deductions = [
    { name: `SSNIT (employee ${rateLabel(rules.ssnitEmployeeRateBp || 550)})`, amount: payslip.ssnit_employee_pesewas },
    { name: "Income tax (PAYE)", amount: payslip.paye_pesewas },
    ...(lines.deductions || []),
  ];
  const totalDeductions = Number(payslip.ssnit_employee_pesewas) + Number(payslip.paye_pesewas) + Number(payslip.other_deductions_pesewas);
  const paidTo = [payslip.bank_name, maskAccount(payslip.bank_account)].filter(Boolean).join(" ");

  return (
    <article className="payslip-doc" aria-label={`Payslip for ${periodLabel(payslip.period)}`}>
      <header className="payslip-head">
        <div>
          <p className="payslip-org">{payslip.organization_name}</p>
          {showStatus && <PayslipStatusBadge status={payslip.status} />}
        </div>
        <div className="payslip-title">
          <h2>Payslip</h2>
          <p>{periodLabel(payslip.period)}</p>
        </div>
      </header>

      <dl className="payslip-details">
        <div><dt>Employee</dt><dd>{payslip.employee_name}</dd></div>
        <div><dt>Employee ID</dt><dd>{payslip.employee_number}</dd></div>
        <div><dt>Department</dt><dd>{payslip.department_name || "–"}</dd></div>
        <div><dt>Job title</dt><dd>{payslip.job_title || "–"}</dd></div>
        <div><dt>Pay period</dt><dd>{periodLabel(payslip.period)}</dd></div>
        <div><dt>Pay date</dt><dd>{dateLabel(payslip.pay_date)}</dd></div>
        <div><dt>Reference</dt><dd className="payslip-ref">{payslip.reference}</dd></div>
        {paidTo && <div><dt>Paid to</dt><dd>{paidTo}</dd></div>}
        {payslip.ssnit_number && <div><dt>SSNIT number</dt><dd>{payslip.ssnit_number}</dd></div>}
      </dl>

      <div className="payslip-tables">
        <table className="payslip-table">
          <caption>Earnings</caption>
          <thead><tr><th scope="col">Item</th><th scope="col" className="num">{cur}</th></tr></thead>
          <tbody>
            {earnings.map((e, i) => <tr key={`e${i}`}><td>{e.name}</td><td className="num">{formatAmount(e.amount)}</td></tr>)}
          </tbody>
          <tfoot><tr><th scope="row">Gross pay</th><td className="num">{formatAmount(payslip.gross_pesewas)}</td></tr></tfoot>
        </table>
        <table className="payslip-table">
          <caption>Deductions</caption>
          <thead><tr><th scope="col">Item</th><th scope="col" className="num">{cur}</th></tr></thead>
          <tbody>
            {deductions.map((d, i) => <tr key={`d${i}`}><td>{d.name}</td><td className="num">{formatAmount(d.amount)}</td></tr>)}
          </tbody>
          <tfoot><tr><th scope="row">Total deductions</th><td className="num">{formatAmount(totalDeductions)}</td></tr></tfoot>
        </table>
      </div>

      <div className="payslip-net">
        <span>Net pay</span>
        <strong>{formatMoney(payslip.net_pesewas, cur)}</strong>
      </div>

      <section className="payslip-summary" aria-label="Tax summary">
        <h3>Tax summary</h3>
        <dl>
          <div><dt>Gross pay</dt><dd>{formatMoney(payslip.gross_pesewas, cur)}</dd></div>
          <div><dt>Less employee SSNIT</dt><dd>{formatMoney(payslip.ssnit_employee_pesewas, cur)}</dd></div>
          <div><dt>Taxable income</dt><dd>{formatMoney(payslip.taxable_pesewas, cur)}</dd></div>
          <div><dt>PAYE</dt><dd>{formatMoney(payslip.paye_pesewas, cur)}</dd></div>
          <div><dt>Employer SSNIT ({rateLabel(rules.ssnitEmployerRateBp || 1300)}, paid by the employer, not deducted)</dt><dd>{formatMoney(payslip.ssnit_employer_pesewas, cur)}</dd></div>
        </dl>
        {rules.payeTable && <p className="payslip-rules">PAYE: {rules.payeTable}. SSNIT Tier 1 on basic salary.</p>}
      </section>

      <footer className="payslip-foot">{payslip.reference} · This payslip is confidential.</footer>
    </article>
  );
};

export default PayslipDocument;
