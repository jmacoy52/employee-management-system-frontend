import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import api, { getErrorMessage } from "../../api/client";
import OwnerNav from "../../components/layout/OwnerNav";
import AppLayout from "../../components/layout/AppLayout";
import OwnerAdminTable from "./OwnerAdminTable";
import RejectModal from "./RejectModal";
import { OrgStatusBadge, formatDate, seatsLabel, placeLabel, notifyOwnerCountsChanged } from "./ownerShared";
import { ORG_TYPES, SIZE_RANGES, sizeLabel } from "../../config/signupOptions";
import "./Owner.css";

const ROLE_ROWS = [["admin", "Admins"], ["hr", "HR"], ["employee", "Employees"]];

const OwnerOrganisationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [org, setOrg] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [rejecting, setRejecting] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/api/platform/organizations/${id}`);
      setOrg(res.data);
      const o = res.data;
      setForm({
        name: o.name, plan: o.plan, seat_limit: o.seat_limit ?? "", contact_email: o.contact_email || "",
        contact_name: o.contact_name || "", phone: o.phone || "", org_type: o.org_type || "", size_range: o.size_range || "",
        country: o.country || "", city: o.city || "",
      });
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load the organisation."));
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (action, confirmText) => {
    if (confirmText && !window.confirm(confirmText)) return;
    try {
      const res = await api.post(`/api/platform/organizations/${id}/${action}`);
      toast.success(res.data.message);
      notifyOwnerCountsChanged();
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Action failed."));
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/api/platform/organizations/${id}`, {
        name: form.name,
        plan: form.plan,
        seat_limit: form.seat_limit === "" ? null : Number(form.seat_limit),
        contact_email: form.contact_email || null,
        contact_name: form.contact_name || null,
        phone: form.phone || null,
        org_type: form.org_type || null,
        size_range: form.size_range || null,
        country: form.country || null,
        city: form.city || null,
      });
      toast.success("Organisation updated.");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update."));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    const accounts = registration && org.user_count ? ` and its ${org.user_count} sign-up account${org.user_count === 1 ? "" : "s"}` : "";
    if (!window.confirm(`Delete ${org.name}${accounts}? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/platform/organizations/${id}`);
      toast.success("Organisation deleted.");
      notifyOwnerCountsChanged();
      navigate("/owner/organisations");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete."));
    }
  };

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  // A registration that was never approved can be deleted with its sign-up account(s)
  const registration = org && ["pending", "rejected"].includes(org.status) && org.employee_count === 0;
  const inUse = org && !registration && (org.user_count > 0 || org.employee_count > 0);

  return (
    <AppLayout
      nav={<OwnerNav />}
      title={org ? org.name : "Organisation"}
      subtitle={org ? `Slug: ${org.slug}` : ""}
      className="owner-org-detail"
      actions={<Link to="/owner/organisations" className="btn btn-ghost"><ArrowLeft size={16} /> All organisations</Link>}
    >
      {error && <p className="error page-error" role="alert">{error}</p>}
      {org && form && (
        <>
          <div className="owner-detail-grid">
            <section className="card card-flush">
              <div className="card-header">
                <h2 className="card-title">Status and usage</h2>
                <OrgStatusBadge status={org.status} />
              </div>
              {org.status === "rejected" && (
                <p className="error owner-rejected-note" role="status">
                  Rejected {formatDate(org.reviewed_at)}{org.rejection_reason ? `: ${org.rejection_reason}` : " (no reason given)"}
                </p>
              )}
              <dl className="owner-facts">
                <dt>Type</dt><dd className="org-type">{org.org_type || "–"}</dd>
                <dt>Staff</dt><dd>{sizeLabel(org.size_range)}</dd>
                <dt>Location</dt><dd>{placeLabel(org)}</dd>
                <dt>Phone</dt><dd>{org.phone ? <a href={`tel:${org.phone.replace(/[^+0-9]/g, "")}`}>{org.phone}</a> : "–"}</dd>
                <dt>Contact person</dt><dd>{org.contact_name || "–"}</dd>
                <dt>Contact e-mail</dt><dd>{org.contact_email ? <a href={`mailto:${org.contact_email}`}>{org.contact_email}</a> : "–"}</dd>
                <dt>Active users / seats</dt><dd>{seatsLabel(org)}</dd>
                <dt>All user accounts</dt><dd>{org.user_count}</dd>
                <dt>Employee records</dt><dd>{org.employee_count}</dd>
                <dt>Departments</dt><dd>{org.department_count}</dd>
                <dt>Registered</dt><dd>{formatDate(org.created_at)}</dd>
                <dt>Approved</dt><dd>{formatDate(org.approved_at)}</dd>
              </dl>
              <div className="owner-actions">
                {["pending", "rejected"].includes(org.status) && (
                  <button type="button" className="btn btn-primary btn-sm approve-btn" onClick={() => act("approve")}>Approve</button>
                )}
                {org.status === "pending" && (
                  <button type="button" className="btn btn-danger-soft btn-sm reject-btn" onClick={() => setRejecting(org)}>Reject</button>
                )}
                {org.status === "suspended" && (
                  <button type="button" className="btn btn-success-soft btn-sm reactivate-btn" onClick={() => act("reactivate")}>Reactivate</button>
                )}
                {org.status === "active" && (
                  <button type="button" className="btn btn-danger-soft btn-sm suspend-btn" onClick={() => act("suspend", `Suspend ${org.name}? Its users are signed out and cannot sign in until you reactivate it.`)}>
                    Suspend
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-ghost btn-sm delete-org-btn"
                  onClick={remove}
                  disabled={inUse}
                  title={inUse ? "Only an organisation without users and employee records can be deleted. Suspend it instead." : registration ? "Delete this registration and its sign-up account" : "Delete this organisation"}
                >
                  Delete
                </button>
              </div>
            </section>

            <section className="card card-flush">
              <div className="card-header"><h2 className="card-title">Details</h2></div>
              <form className="owner-form org-edit-form" onSubmit={save}>
                <div className="field">
                  <label htmlFor="edit-org-name">Name</label>
                  <input id="edit-org-name" name="name" value={form.name} onChange={change} minLength={2} maxLength={150} required />
                </div>
                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="edit-org-plan">Plan</label>
                    <input id="edit-org-plan" name="plan" value={form.plan} onChange={change} maxLength={40} required />
                  </div>
                  <div className="field">
                    <label htmlFor="edit-org-seats">Seat limit</label>
                    <input id="edit-org-seats" name="seat_limit" type="number" min="1" placeholder="No limit" value={form.seat_limit} onChange={change} />
                  </div>
                </div>
                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="edit-org-type">Type</label>
                    <select id="edit-org-type" name="org_type" value={form.org_type} onChange={change}>
                      <option value="">Not given</option>
                      {ORG_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="edit-org-size">Staff</label>
                    <select id="edit-org-size" name="size_range" value={form.size_range} onChange={change}>
                      <option value="">Not given</option>
                      {SIZE_RANGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="edit-org-country">Country</label>
                    <input id="edit-org-country" name="country" value={form.country} onChange={change} maxLength={80} />
                  </div>
                  <div className="field">
                    <label htmlFor="edit-org-city">City</label>
                    <input id="edit-org-city" name="city" value={form.city} onChange={change} maxLength={80} />
                  </div>
                  <div className="field">
                    <label htmlFor="edit-org-contact-name">Contact person</label>
                    <input id="edit-org-contact-name" name="contact_name" value={form.contact_name} onChange={change} maxLength={100} />
                  </div>
                  <div className="field">
                    <label htmlFor="edit-org-phone">Phone</label>
                    <input id="edit-org-phone" name="phone" type="tel" value={form.phone} onChange={change} maxLength={25} />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="edit-org-contact">Contact e-mail</label>
                  <input id="edit-org-contact" name="contact_email" type="email" value={form.contact_email} onChange={change} />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving && <span className="spinner" aria-hidden="true" />} Save changes
                  </button>
                </div>
              </form>
            </section>
          </div>

          {/* Tenant boundary: the owner sees the account holder(s) and head counts, never the
              organisation's HR and employee accounts (the API does not return them either) */}
          <section className="card card-flush section org-admins-card">
            <div className="card-header">
              <h2 className="card-title">Organisation admin{(org.admins || []).length === 1 ? "" : "s"} ({(org.admins || []).length})</h2>
            </div>
            <p className="owner-section-note owner-card-note">The account holder(s) you support. Each organisation&apos;s admins manage their own HR and employee accounts.</p>
            <OwnerAdminTable users={org.admins || []} loading={false} onChanged={load} />
          </section>

          <section className="card card-flush section org-user-counts">
            <div className="card-header"><h2 className="card-title">User accounts by role</h2></div>
            <div className="table-wrap">
              <table className="data-table role-count-table">
                <thead>
                  <tr><th>Role</th><th className="num">Active</th><th className="num">Deactivated</th><th className="num">Total</th></tr>
                </thead>
                <tbody>
                  {ROLE_ROWS.map(([role, label]) => {
                    const c = (org.user_counts || {})[role] || { active: 0, inactive: 0 };
                    return (
                      <tr key={role} data-role={role}>
                        <td className="cell-strong">{label}</td>
                        <td className="num role-active">{c.active}</td>
                        <td className="num role-inactive">{c.inactive}</td>
                        <td className="num role-total">{c.active + c.inactive}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
          <RejectModal org={rejecting} onClose={() => setRejecting(null)} onDone={() => { setRejecting(null); load(); }} />
        </>
      )}
    </AppLayout>
  );
};

export default OwnerOrganisationDetail;
