import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import api, { getErrorMessage } from "../../api/client";
import OwnerNav from "../../components/layout/OwnerNav";
import AppLayout from "../../components/layout/AppLayout";
import OwnerUserTable from "./OwnerUserTable";
import { OrgStatusBadge, formatDate, seatsLabel } from "./ownerShared";
import "./Owner.css";

const OwnerOrganisationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [org, setOrg] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/api/platform/organizations/${id}`);
      setOrg(res.data);
      setForm({ name: res.data.name, plan: res.data.plan, seat_limit: res.data.seat_limit ?? "", contact_email: res.data.contact_email || "" });
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
    if (!window.confirm(`Delete ${org.name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/platform/organizations/${id}`);
      toast.success("Organisation deleted.");
      navigate("/owner/organisations");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete."));
    }
  };

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const inUse = org && (org.user_count > 0 || org.employee_count > 0);

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
              <dl className="owner-facts">
                <dt>Active users / seats</dt><dd>{seatsLabel(org)}</dd>
                <dt>All user accounts</dt><dd>{org.user_count}</dd>
                <dt>Employee records</dt><dd>{org.employee_count}</dd>
                <dt>Departments</dt><dd>{org.department_count}</dd>
                <dt>Registered</dt><dd>{formatDate(org.created_at)}</dd>
                <dt>Approved</dt><dd>{formatDate(org.approved_at)}</dd>
              </dl>
              <div className="owner-actions">
                {org.status === "pending" && (
                  <button type="button" className="btn btn-primary btn-sm approve-btn" onClick={() => act("approve")}>Approve</button>
                )}
                {org.status === "suspended" && (
                  <button type="button" className="btn btn-success-soft btn-sm reactivate-btn" onClick={() => act("reactivate")}>Reactivate</button>
                )}
                {org.status !== "suspended" && (
                  <button type="button" className="btn btn-danger-soft btn-sm suspend-btn" onClick={() => act("suspend", `Suspend ${org.name}? Its users are signed out and cannot sign in until you reactivate it.`)}>
                    Suspend
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-ghost btn-sm delete-org-btn"
                  onClick={remove}
                  disabled={inUse}
                  title={inUse ? "Only an organisation without users and employee records can be deleted. Suspend it instead." : "Delete this organisation"}
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

          <section className="card card-flush section">
            <div className="card-header"><h2 className="card-title">Users ({org.users.length})</h2></div>
            <OwnerUserTable users={org.users} loading={false} onChanged={load} />
          </section>
        </>
      )}
    </AppLayout>
  );
};

export default OwnerOrganisationDetail;
