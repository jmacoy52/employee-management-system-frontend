import React, { useEffect, useMemo, useState } from "react";
import api, { getErrorMessage } from "../../api/client";
import OwnerNav from "../../components/layout/OwnerNav";
import AppLayout from "../../components/layout/AppLayout";
import ActionBadge from "../../components/common/ActionBadge";
import { formatDateTime } from "./ownerShared";
import "./Owner.css";

// Audit trail of every organisation, plus platform-level events (no organisation)
const OwnerAuditLog = () => {
  const [logs, setLogs] = useState(null);
  const [orgs, setOrgs] = useState([]);
  const [org, setOrg] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/api/platform/organizations").then((r) => setOrgs(r.data)).catch(() => setOrgs([]));
  }, []);

  useEffect(() => {
    setLogs(null);
    api.get("/api/platform/audit-logs", { params: org ? { organization_id: org } : {} })
      .then((r) => { setLogs(r.data); setError(""); })
      .catch((err) => { setError(getErrorMessage(err, "Failed to load the audit log.")); setLogs([]); });
  }, [org]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (logs || []).filter((l) => !q || `${l.actions} ${l.descriptions} ${l.user_email || ""}`.toLowerCase().includes(q));
  }, [logs, query]);

  return (
    <AppLayout nav={<OwnerNav />} title="Platform audit log" subtitle="Owner actions and organisation-level events (registrations, approvals, suspensions, admin support, enquiries), newest first. Routine activity inside an organisation is visible only to its admins." className="owner-audit">
      {error && <p className="error page-error" role="alert">{error}</p>}
      <div className="card card-flush">
        <div className="toolbar">
          <div className="field">
            <label htmlFor="oa-org">Organisation</label>
            <select id="oa-org" value={org} onChange={(e) => setOrg(e.target.value)}>
              <option value="">All organisations</option>
              <option value="platform">Not tied to an organisation</option>
              {orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="oa-search">Search</label>
            <input id="oa-search" type="search" placeholder="Action, description or e-mail" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <span className="toolbar-count">{visible.length} entries</span>
        </div>
        <div className="table-wrap">
          <table className="data-table stack audit-log-table owner-audit-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Description</th>
                <th>Organisation</th>
                <th>By</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {visible.length > 0 ? (
                visible.map((l) => (
                  <tr key={l.LogId}>
                    <td data-label="Action"><ActionBadge action={l.actions} /></td>
                    <td data-label="Description" className="audit-desc">{l.descriptions}</td>
                    <td data-label="Organisation">{l.organization_name || <span className="cell-muted">Platform</span>}</td>
                    <td data-label="By" className="cell-muted">{l.user_email || "–"}</td>
                    <td data-label="Time" className="cell-muted cell-nowrap">{formatDateTime(l.created_at)}</td>
                  </tr>
                ))
              ) : (
                <tr className="empty-row">
                  <td colSpan="5">{logs === null ? "Loading audit log…" : "No entries found."}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
};

export default OwnerAuditLog;
