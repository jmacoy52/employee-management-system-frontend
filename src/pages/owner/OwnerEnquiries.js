import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api, { getErrorMessage } from "../../api/client";
import OwnerNav from "../../components/layout/OwnerNav";
import AppLayout from "../../components/layout/AppLayout";
import { EnquiryStatusBadge, formatDateTime, notifyOwnerCountsChanged } from "./ownerShared";
import "./Owner.css";

// "Request a demo" messages from the public contact form: follow up, then mark contacted / closed.
const OwnerEnquiries = () => {
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async (search) => {
    try {
      const res = await api.get("/api/platform/enquiries", { params: { status: status || undefined, q: search || undefined } });
      setRows(res.data);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load enquiries."));
      setRows([]);
    }
  }, [status]);

  useEffect(() => {
    const t = setTimeout(() => load(q.trim()), 250);
    return () => clearTimeout(t);
  }, [q, load]);

  const setEnquiryStatus = async (enquiry, next) => {
    try {
      await api.put(`/api/platform/enquiries/${enquiry.id}/status`, { status: next });
      toast.success(`Marked ${next}.`);
      notifyOwnerCountsChanged();
      load(q.trim());
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update the enquiry."));
    }
  };

  const remove = async (enquiry) => {
    if (!window.confirm(`Delete the enquiry from ${enquiry.email}? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/platform/enquiries/${enquiry.id}`);
      toast.success("Enquiry deleted.");
      notifyOwnerCountsChanged();
      load(q.trim());
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete the enquiry."));
    }
  };

  return (
    <AppLayout
      nav={<OwnerNav />}
      title="Enquiries"
      subtitle="Demo requests sent from the contact page. Reply by e-mail or phone, then mark them contacted or closed."
      className="owner-enquiries"
    >
      {error && <p className="error page-error" role="alert">{error}</p>}
      <div className="card card-flush">
        <div className="toolbar">
          <div className="field">
            <label htmlFor="enquiry-search">Search</label>
            <input id="enquiry-search" type="search" placeholder="Name, organisation, e-mail or phone" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="enquiry-status">Status</label>
            <select id="enquiry-status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <span className="toolbar-count">{rows ? rows.length : 0} enquiries</span>
        </div>
        <div className="table-wrap">
          <table className="data-table stack enquiry-table">
            <thead>
              <tr>
                <th>Received</th>
                <th>From</th>
                <th>Organisation</th>
                <th>Message</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows && rows.length > 0 ? (
                rows.map((e) => (
                  <tr key={e.id}>
                    <td data-label="Received" className="cell-muted cell-nowrap">{formatDateTime(e.created_at)}</td>
                    <td data-label="From">
                      <span className="cell-strong">{e.name}</span>
                      <br />
                      <a href={`mailto:${e.email}?subject=${encodeURIComponent("Your EmploCore demo request")}`}>{e.email}</a>
                      {e.phone && (<><br /><a href={`tel:${e.phone.replace(/[^+0-9]/g, "")}`}>{e.phone}</a></>)}
                    </td>
                    <td data-label="Organisation">{e.organization_name || "–"}</td>
                    <td data-label="Message"><div className="enquiry-message">{e.message}</div></td>
                    <td data-label="Status"><EnquiryStatusBadge status={e.status} /></td>
                    <td data-label="Actions">
                      <div className="enquiry-actions">
                        {e.status !== "contacted" && (
                          <button type="button" className="btn btn-success-soft btn-sm mark-contacted-btn" onClick={() => setEnquiryStatus(e, "contacted")}>Mark contacted</button>
                        )}
                        {e.status !== "closed" && (
                          <button type="button" className="btn btn-secondary btn-sm mark-closed-btn" onClick={() => setEnquiryStatus(e, "closed")}>Close</button>
                        )}
                        {e.status !== "new" && (
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEnquiryStatus(e, "new")}>Reopen</button>
                        )}
                        <button type="button" className="btn btn-ghost btn-sm delete-enquiry-btn" onClick={() => remove(e)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="empty-row">
                  <td colSpan="6">{rows === null ? "Loading enquiries…" : "No enquiries found."}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
};

export default OwnerEnquiries;
