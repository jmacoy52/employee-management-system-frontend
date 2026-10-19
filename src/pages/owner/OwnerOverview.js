import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Hourglass, Users, IdCard, TrendingUp, ArrowRight, Inbox } from "lucide-react";
import api, { getErrorMessage } from "../../api/client";
import OwnerNav from "../../components/layout/OwnerNav";
import AppLayout from "../../components/layout/AppLayout";
import { getStoredUser } from "../../auth/session";
import PendingApprovals from "./PendingApprovals";
import { formatDate, EnquiryStatusBadge } from "./ownerShared";
import "./Owner.css";

// Platform overview: real counts from /api/platform/overview, the organisations waiting for
// approval (with their sign-up details) and the newest demo requests.
const OwnerOverview = () => {
  const navigate = useNavigate();
  const me = getStoredUser();
  const [stats, setStats] = useState(null);
  const [enquiries, setEnquiries] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [o, e] = await Promise.all([
        api.get("/api/platform/overview"),
        api.get("/api/platform/enquiries", { params: { status: "new", limit: 5 } }),
      ]);
      setStats(o.data);
      setEnquiries(e.data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load the overview."));
      setEnquiries([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const v = (key) => (stats ? stats[key] : "–");
  const tiles = [
    { label: "Pending approval", value: v("pending"), icon: Hourglass, tone: "accent", to: "/owner/organisations?status=pending" },
    { label: "New enquiries", value: v("enquiries_new"), icon: Inbox, tone: "accent", to: "/owner/enquiries" },
    { label: "Active organisations", value: v("active"), icon: Building2, tone: "", to: "/owner/organisations?status=active" },
    { label: "User accounts", value: v("users"), icon: Users, tone: "", to: "/owner/admins" },
    { label: "Employee records", value: v("employees"), icon: IdCard, tone: "" },
    { label: "New sign-ups (30 days)", value: v("signups_30d"), icon: TrendingUp, tone: "accent" },
  ];

  return (
    <AppLayout
      nav={<OwnerNav />}
      title="Platform overview"
      subtitle={`Signed in as ${me?.username || me?.email || "owner"}. Every organisation on EmploCore.`}
      className="owner-overview"
    >
      {error && <p className="error page-error" role="alert">{error}</p>}
      <div className="stat-grid owner-stats">
        {tiles.map(({ label, value, icon: Icon, tone, to }) => {
          const body = (
            <>
              <span className={`stat-icon ${tone}`}><Icon size={22} /></span>
              <div>
                <p className="stat-label">{label}</p>
                <p className="stat-value">{value}</p>
              </div>
            </>
          );
          return to ? (
            <button type="button" className="stat-tile stat-tile-link" key={label} onClick={() => navigate(to)}>{body}</button>
          ) : (
            <div className="stat-tile" key={label}>{body}</div>
          );
        })}
      </div>

      <div className="owner-grid section">
        <PendingApprovals limit={5} onChanged={load} />

        <div className="owner-stack">
          <section className="card card-flush new-enquiries">
            <div className="card-header">
              <h2 className="card-title owner-card-title">
                <Inbox size={18} aria-hidden="true" /> New enquiries
                {enquiries && enquiries.length > 0 && <span className="count-pill info">{stats?.enquiries_new ?? enquiries.length}</span>}
              </h2>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate("/owner/enquiries")}>View all</button>
            </div>
            {enquiries === null ? (
              <p className="owner-empty">Loading…</p>
            ) : enquiries.length === 0 ? (
              <p className="owner-empty">No new demo requests.</p>
            ) : (
              <ul className="owner-pending-list">
                {enquiries.map((e) => (
                  <li key={e.id}>
                    <div>
                      <span className="owner-pending-name">{e.name}{e.organization_name ? ` · ${e.organization_name}` : ""}</span>
                      <span className="owner-pending-meta">{e.email} · {formatDate(e.created_at)}</span>
                    </div>
                    <EnquiryStatusBadge status={e.status} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card">
            <h2 className="card-title">Manage the platform</h2>
            <p className="owner-section-note">Approve or reject new registrations, follow up demo requests, change plans and seat limits, help organisation admins who are locked out, and review platform-level activity in the audit log.</p>
            <div className="owner-actions" style={{ padding: "var(--space-4) 0 0" }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate("/owner/organisations")}>Organisations <ArrowRight size={14} /></button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate("/owner/enquiries")}>Enquiries <ArrowRight size={14} /></button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate("/owner/admins")}>Organisation admins <ArrowRight size={14} /></button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate("/owner/audit-log")}>Audit log <ArrowRight size={14} /></button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate("/owner/account")}>My account <ArrowRight size={14} /></button>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
};

export default OwnerOverview;
