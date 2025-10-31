import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AuditLog.css";
import AdminNav from "../../Shared/AdminNav";


const AuditLog = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAuditLogs = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await axios.get("http://localhost:5000/api/audit-logs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAuditLogs(response.data);
      } catch (err) {
        setError("Failed to fetch audit logs.");
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, []);

  if (loading) return <div className="audit-log-container">Loading...</div>;

  return (
    <div className="audit-log-container">
      <AdminNav />
      <h2>Audit Log</h2>
      {error && <p className="error">{error}</p>}
      <table className="audit-log-table">
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
          {auditLogs.length > 0 ? (
            auditLogs.map((log) => (
              <tr key={log.Id}>
                <td>{log.LogId}</td>
                <td>{log.actions}</td>
                <td>{log.descriptions}</td>
                <td>{new Date(log.created_at).toLocaleString()}</td>
                <td>{log.UserId}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No audit logs found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AuditLog;
