import React from "react";
import api from "../../api/client";

// Money arrives from the API in whole pesewas (GHS 1.00 = 100) and is only formatted here.

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// 123456 -> "1,234.56"
export function formatAmount(pesewas) {
  const n = Number(pesewas) || 0;
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  const whole = Math.floor(abs / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${sign}${whole}.${String(abs % 100).padStart(2, "0")}`;
}

// 123456 -> "GHS 1,234.56"
export const formatMoney = (pesewas, currency = "GHS") => `${currency} ${formatAmount(pesewas)}`;

// 123456 -> "1234.56" (form inputs)
export const toInputAmount = (pesewas) => (pesewas === null || pesewas === undefined ? "" : (Number(pesewas) / 100).toFixed(2));

// "2026-09" -> "September 2026"
export function periodLabel(period) {
  const [y, m] = String(period || "").split("-");
  return MONTHS[Number(m) - 1] ? `${MONTHS[Number(m) - 1]} ${y}` : String(period || "");
}

// "2026-09-30" -> "30 September 2026" (date only, no time-zone shift)
export function dateLabel(value) {
  const [y, m, d] = String(value || "").slice(0, 10).split("-");
  return MONTHS[Number(m) - 1] ? `${Number(d)} ${MONTHS[Number(m) - 1]} ${y}` : "–";
}

// 550 -> "5.5%"
export const rateLabel = (bp) => `${Number(bp) / 100}%`;

// Only the last four digits of a bank account are shown on payslips
export function maskAccount(account) {
  if (!account) return "";
  const s = String(account).replace(/\s+/g, "");
  return s.length <= 4 ? s : `•••• ${s.slice(-4)}`;
}

// The current month, "YYYY-MM"
export const currentPeriod = () => new Date().toISOString().slice(0, 7);

// Last working day (Mon–Fri) of a month: the usual pay date
export function lastWorkingDay(period) {
  const [y, m] = period.split("-").map(Number);
  const d = new Date(Date.UTC(y, m, 0));
  while (d.getUTCDay() === 0 || d.getUTCDay() === 6) d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export const PayslipStatusBadge = ({ status }) => (
  <span className={`badge payslip-status payslip-status-${status}`}>{status === "published" ? "Published" : "Draft"}</span>
);

// Downloads a PDF from the API (with the session token) and saves it under the given name
export async function downloadPdf(url, filename) {
  const res = await api.get(url, { responseType: "blob" });
  const blob = res.data instanceof Blob ? res.data : new Blob([res.data], { type: "application/pdf" });
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
}

export const pdfFilename = (payslip) => `payslip-${payslip.period}-${payslip.reference}.pdf`;
