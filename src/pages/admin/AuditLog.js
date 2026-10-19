import React, { useEffect, useMemo, useState } from "react";
import api, { getErrorMessage } from "../../api/client";
import "./AuditLog.css";
import AdminNav from "../../components/layout/AdminNav";
import AppLayout from "../../components/layout/AppLayout";
import ActionBadge from "../../components/common/ActionBadge";

const AuditLog = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [action, setAction] = useState("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchAuditLogs = async () => {

      try {
        const response = await api.get("/api/audit-logs");
        setAuditLogs(response.data);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to fetch audit logs."));
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, []);

  const actions = useMemo(() => Array.from(new Set(auditLogs.map((l) => l.actions))).sort(), [auditLogs]);
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return auditLogs.filter(
      (l) => (action === "all" || l.actions === action) && (!q || String(l.descriptions || "").toLowerCase().includes(q))
    );
  }, [auditLogs, action, query]);

  return (
    <AppLayout
      nav={<AdminNav />}
      title="Audit Log"
      subtitle="Sign-ins and changes to users, passwords and employee records, newest first."
      className="audit-log-container"
    >
      {error && <p className="error page-error" role="alert">{error}</p>}
      <div className="card card-flush">
        <div className="toolbar">
          <div className="field">
            <label htmlFor="audit-action">Action</label>
            <select id="audit-action" value={action} onChange={(e) => setAction(e.target.value)}>
              <option value="all">All actions</option>
              {actions.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="audit-search">Search descriptions</label>
            <input id="audit-search" type="search" placeholder="e.g. an email address" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <span className="toolbar-count">{visible.length} entries</span>
        </div>
        <div className="table-wrap">
          <table className="data-table stack audit-log-table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Actions</th>
                <th>Descriptions</th>
                <th>Timestamp</th>
                <th>User ID</th>
              </tr>
            </thead>
            <tbody>
              {visible.length > 0 ? (
                visible.map((log) => (
                  <tr key={log.LogId}>
                    <td data-label="Log ID" className="cell-muted">{log.LogId}</td>
                    <td data-label="Action"><ActionBadge action={log.actions} /></td>
                    <td data-label="Description" className="audit-desc">{log.descriptions}</td>
                    <td data-label="Timestamp" className="cell-muted cell-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                    <td data-label="User ID" className="cell-muted">{log.UserId}</td>
                  </tr>
                ))
              ) : (
                <tr className="empty-row">
                  <td colSpan="5">{loading ? "Loading audit log…" : "No audit logs found."}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
};

export default AuditLog;
