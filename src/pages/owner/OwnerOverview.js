import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Hourglass, Ban, Users, IdCard, TrendingUp, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";
import api, { getErrorMessage } from "../../api/client";
import OwnerNav from "../../components/layout/OwnerNav";
import AppLayout from "../../components/layout/AppLayout";
import { getStoredUser } from "../../auth/session";
import { formatDate } from "./ownerShared";
import "./Owner.css";

// Platform overview: real counts from /api/platform/overview and the organisations waiting for approval.
const OwnerOverview = () => {
  const navigate = useNavigate();
  const me = getStoredUser();
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [o, p] = await Promise.all([
        api.get("/api/platform/overview"),
        api.get("/api/platform/organizations", { params: { status: "pending" } }),
      ]);
      setStats(o.data);
      setPending(p.data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load the overview."));
      setPending([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const approve = async (org) => {
    try {
      await api.post(`/api/platform/organizations/${org.id}/approve`);
      toast.success(`${org.name} approved.`);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to approve."));
    }
  };

  const v = (key) => (stats ? stats[key] : "–");
  const tiles = [
    { label: "Active organisations", value: v("active"), icon: Building2, tone: "" },
    { label: "Pending approval", value: v("pending"), icon: Hourglass, tone: "accent" },
    { label: "Suspended", value: v("suspended"), icon: Ban, tone: "danger" },
    { label: "User accounts", value: stats ? `${stats.users}` : "–", icon: Users, tone: "" },
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
        {tiles.map(({ label, value, icon: Icon, tone }) => (
          <div className="stat-tile" key={label}>
            <span className={`stat-icon ${tone}`}><Icon size={22} /></span>
            <div>
              <p className="stat-label">{label}</p>
              <p className="stat-value">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="owner-grid section">
        <section className="card card-flush">
          <div className="card-header">
            <h2 className="card-title">Waiting for approval</h2>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate("/owner/organisations?status=pending")}>
              View all
            </button>
          </div>
          {pending === null ? (
            <p className="owner-empty">Loading…</p>
          ) : pending.length === 0 ? (
            <p className="owner-empty">No organisations are waiting for approval.</p>
          ) : (
            <ul className="owner-pending-list">
              {pending.map((org) => (
                <li key={org.id}>
                  <div>
                    <button type="button" className="owner-link-btn owner-pending-name" onClick={() => navigate(`/owner/organisations/${org.id}`)}>
                      {org.name}
                    </button>
                    <span className="owner-pending-meta">{org.contact_email} · registered {formatDate(org.created_at)}</span>
                  </div>
                  <button type="button" className="btn btn-primary btn-sm approve-btn" onClick={() => approve(org)}>
                    Approve
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <h2 className="card-title">Manage the platform</h2>
          <p className="owner-section-note">Approve and suspend organisations, change plans and seat limits, help users who are locked out, and review every organisation&apos;s audit trail.</p>
          <div className="owner-actions" style={{ padding: "var(--space-4) 0 0" }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate("/owner/organisations")}>Organisations <ArrowRight size={14} /></button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate("/owner/users")}>All users <ArrowRight size={14} /></button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate("/owner/audit-log")}>Audit log <ArrowRight size={14} /></button>
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default OwnerOverview;
