import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import api, { getErrorMessage } from "../../api/client";
import OwnerNav from "../../components/layout/OwnerNav";
import AppLayout from "../../components/layout/AppLayout";
import Modal from "../../components/common/Modal";
import PasswordInput from "../../components/auth/PasswordInput";
import { OrgStatusBadge, formatDate, seatsLabel, placeLabel } from "./ownerShared";
import PendingApprovals from "./PendingApprovals";
import "./Owner.css";

const EMPTY_FORM = { name: "", contact_email: "", plan: "standard", seat_limit: "", adminName: "", adminEmail: "", adminPassword: "" };

const OwnerOrganisations = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const status = params.get("status") || "";
  const [q, setQ] = useState("");
  const [orgs, setOrgs] = useState(null);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState(null); // { id, temporaryPassword, email }

  const load = useCallback(async (search) => {
    try {
      const res = await api.get("/api/platform/organizations", { params: { status: status || undefined, q: search || undefined } });
      setOrgs(res.data);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load organisations."));
      setOrgs([]);
    }
  }, [status]);

  // Search as you type (debounced)
  useEffect(() => {
    const t = setTimeout(() => load(q.trim()), 250);
    return () => clearTimeout(t);
  }, [q, load]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const create = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post("/api/platform/organizations", {
        name: form.name,
        contact_email: form.contact_email || null,
        plan: form.plan,
        seat_limit: form.seat_limit === "" ? null : Number(form.seat_limit),
        admin: { name: form.adminName, email: form.adminEmail, password: form.adminPassword || undefined },
      });
      toast.success("Organisation created.");
      setShowCreate(false);
      setForm(EMPTY_FORM);
      if (res.data.temporaryPassword) setCreated({ id: res.data.id, email: form.adminEmail, temporaryPassword: res.data.temporaryPassword });
      load(q.trim());
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to create the organisation."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout
      nav={<OwnerNav />}
      title="Organisations"
      subtitle="Every client organisation on the platform. Approve or reject new registrations, change plans and seat limits, or suspend access."
      className="owner-organisations"
      actions={
        <button type="button" className="btn btn-primary new-org-btn" onClick={() => setShowCreate(true)}>
          <Plus size={18} /> New organisation
        </button>
      }
    >
      {error && <p className="error page-error" role="alert">{error}</p>}
      {/* New registrations first, with their sign-up details */}
      {!status && (
        <div className="section-tight">
          <PendingApprovals onChanged={() => load(q.trim())} />
        </div>
      )}
      <div className="card card-flush">
        <div className="toolbar">
          <div className="field">
            <label htmlFor="org-search">Search</label>
            <input id="org-search" type="search" placeholder="Name, contact, city or country" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="org-status">Status</label>
            <select id="org-status" value={status} onChange={(e) => setParams(e.target.value ? { status: e.target.value } : {})}>
              <option value="">All statuses</option>
              <option value="pending">Pending approval</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <span className="toolbar-count">{orgs ? orgs.length : 0} organisations</span>
        </div>
        <div className="table-wrap">
          <table className="data-table stack org-table">
            <thead>
              <tr>
                <th>Organisation</th>
                <th>Status</th>
                <th>Type / staff</th>
                <th>Location</th>
                <th>Plan</th>
                <th>Active users / seats</th>
                <th>Employees</th>
                <th>Contact</th>
                <th>Registered</th>
              </tr>
            </thead>
            <tbody>
              {orgs && orgs.length > 0 ? (
                orgs.map((org) => (
                  <tr key={org.id}>
                    <td data-label="Organisation" className="cell-strong">
                      <button type="button" className="owner-link-btn org-open" onClick={() => navigate(`/owner/organisations/${org.id}`)}>{org.name}</button>
                    </td>
                    <td data-label="Status"><OrgStatusBadge status={org.status} /></td>
                    <td data-label="Type / staff" className="cell-muted">{org.org_type || "–"}{org.size_range ? ` · ${org.size_range}` : ""}</td>
                    <td data-label="Location" className="cell-muted">{placeLabel(org)}</td>
                    <td data-label="Plan">{org.plan}</td>
                    <td data-label="Active users / seats">{seatsLabel(org)}</td>
                    <td data-label="Employees">{org.employee_count}</td>
                    <td data-label="Contact" className="cell-muted">{org.contact_email || "–"}</td>
                    <td data-label="Registered" className="cell-muted cell-nowrap">{formatDate(org.created_at)}</td>
                  </tr>
                ))
              ) : (
                <tr className="empty-row">
                  <td colSpan="9">{orgs === null ? "Loading organisations…" : "No organisations found."}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New organisation">
        <form onSubmit={create} className="create-org-form">
          <div className="field">
            <label htmlFor="new-org-name">Organisation name</label>
            <input id="new-org-name" name="name" value={form.name} onChange={change} minLength={2} maxLength={150} required />
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="new-org-plan">Plan</label>
              <input id="new-org-plan" name="plan" value={form.plan} onChange={change} maxLength={40} required />
            </div>
            <div className="field">
              <label htmlFor="new-org-seats">Seat limit</label>
              <input id="new-org-seats" name="seat_limit" type="number" min="1" placeholder="No limit" value={form.seat_limit} onChange={change} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="new-org-contact">Contact e-mail (optional)</label>
            <input id="new-org-contact" name="contact_email" type="email" placeholder="Defaults to the admin's e-mail" value={form.contact_email} onChange={change} />
          </div>
          <h3 className="card-title" style={{ margin: "var(--space-4) 0 var(--space-2)" }}>First administrator</h3>
          <div className="field">
            <label htmlFor="new-org-admin-name">Name</label>
            <input id="new-org-admin-name" name="adminName" value={form.adminName} onChange={change} minLength={2} maxLength={100} required />
          </div>
          <div className="field">
            <label htmlFor="new-org-admin-email">E-mail</label>
            <input id="new-org-admin-email" name="adminEmail" type="email" value={form.adminEmail} onChange={change} required />
          </div>
          <div className="field">
            <label htmlFor="new-org-admin-password">Password (optional)</label>
            <PasswordInput id="new-org-admin-password" name="adminPassword" placeholder="Leave empty to generate a temporary one" autoComplete="new-password" value={form.adminPassword} onChange={change} />
            <p className="field-hint">Without a password, a temporary one is generated; the admin must change it at first sign-in.</p>
          </div>
          <div className="modal-actions form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving && <span className="spinner" aria-hidden="true" />} Create organisation
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={Boolean(created)} onClose={() => setCreated(null)} title="Temporary password (shown once)">
        {created && (
          <>
            <p className="owner-temp-note">Give these sign-in details to <strong>{created.email}</strong>. They must choose a new password at first sign-in.</p>
            <div className="reset-result-row">
              <input className="reset-result input" readOnly value={created.temporaryPassword} onFocus={(e) => e.target.select()} aria-label="Temporary password" />
            </div>
            <div className="modal-actions form-actions">
              <button type="button" className="btn btn-primary" onClick={() => navigate(`/owner/organisations/${created.id}`)}>Open organisation</button>
            </div>
          </>
        )}
      </Modal>
    </AppLayout>
  );
};

export default OwnerOrganisations;
