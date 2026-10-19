import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, CalendarRange, Wallet, Hourglass } from "lucide-react";
import api, { getErrorMessage } from "../../api/client";
import OwnerNav from "../../components/layout/OwnerNav";
import AppLayout from "../../components/layout/AppLayout";
import { formatGhs, formatDay } from "../../api/billing";
import PaymentsSettingsCard from "./PaymentsSettingsCard";
import "./Owner.css";

const PAY_LABELS = { success: "Paid", failed: "Failed", pending: "Pending", abandoned: "Not completed" };

// Owner: revenue overview. MRR counts active paid subscriptions (yearly / 12) plus arranged monthly prices.
const OwnerBilling = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/api/platform/billing").then((res) => setData(res.data)).catch((err) => setError(getErrorMessage(err, "Revenue could not be loaded.")));
  }, []);

  const tiles = data ? [
    { label: "Monthly recurring revenue", value: formatGhs(data.mrr), icon: TrendingUp },
    { label: "Annual run rate", value: formatGhs(data.arr), icon: CalendarRange },
    { label: "Collected (last 30 days)", value: formatGhs(data.collectedLast30Days), icon: Wallet },
    { label: "Trials ending in 7 days", value: data.counts.trialsEnding7d, icon: Hourglass, tone: "accent" },
  ] : [];

  return (
    <AppLayout nav={<OwnerNav />} title="Revenue" subtitle="Subscriptions and payments across all organisations." className="owner-billing">
      {error && <p className="error page-error" role="alert">{error}</p>}
      {data && (
        <>
          {!data.paymentsEnabled && (
            <div className="alert alert-info owner-payments-off" role="status">
              Online payments are switched off: no Paystack keys are set on the server. Organisation admins see &ldquo;Payments coming soon, contact us&rdquo;. You can still record cash, mobile money and bank payments on each organisation&apos;s page.
            </div>
          )}
          <div className="stat-grid owner-stats">
            {tiles.map(({ label, value, icon: Icon, tone }) => (
              <div className="stat-tile" key={label}>
                <span className={`stat-icon ${tone || ""}`}><Icon size={22} /></span>
                <div><p className="stat-label">{label}</p><p className="stat-value revenue-value">{value}</p></div>
              </div>
            ))}
          </div>

          <div className="owner-grid section">
            <section className="card card-flush">
              <div className="card-header"><h2 className="card-title">Organisations by status</h2></div>
              <div className="table-wrap">
                <table className="data-table status-count-table">
                  <tbody>
                    {[["Paying (Paystack)", "paying"], ["Paid manually / arranged", "manual"], ["Paused", "paused"], ["On trial", "trialing"], ["In grace period", "grace"], ["On Free", "free"], ["Exempt (demo)", "exempt"]].map(([label, key]) => (
                      <tr key={key}><td>{label}</td><td className="num">{data.counts[key]}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            <section className="card card-flush">
              <div className="card-header"><h2 className="card-title">MRR by plan</h2></div>
              {data.byPlan.length === 0 ? <p className="owner-empty">No active subscriptions yet.</p> : (
                <div className="table-wrap">
                  <table className="data-table mrr-plan-table">
                    <thead><tr><th>Plan</th><th className="num">Organisations</th><th className="num">MRR</th></tr></thead>
                    <tbody>
                      {data.byPlan.map((r) => <tr key={r.plan}><td>{r.name}</td><td className="num">{r.organisations}</td><td className="num">{formatGhs(r.mrr)}</td></tr>)}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>

          <section className="card card-flush section">
            <div className="card-header"><h2 className="card-title">Recent payments</h2></div>
            {data.recentPayments.length === 0 ? <p className="owner-empty">No payments yet.</p> : (
              <div className="table-wrap">
                <table className="data-table recent-payments-table">
                  <thead><tr><th>Date</th><th>Organisation</th><th>Invoice</th><th>Plan</th><th className="num">Amount</th><th>Status</th></tr></thead>
                  <tbody>
                    {data.recentPayments.map((p) => (
                      <tr key={p.id}>
                        <td data-label="Date">{formatDay(p.paid_at || p.created_at)}</td>
                        <td data-label="Organisation"><Link to={`/owner/organisations/${p.organization_id}`}>{p.organization_name}</Link></td>
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
          </section>
          <PaymentsSettingsCard />
          <p className="owner-section-note">Change prices and the founding offer on <Link to="/owner/plans">Plans and prices</Link>. Manage one organisation&apos;s subscription from its page under Organisations.</p>
        </>
      )}
    </AppLayout>
  );
};

export default OwnerBilling;
