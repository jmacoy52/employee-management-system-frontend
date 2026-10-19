import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Plus, Pencil, Trash2, Users, Building2, UserMinus, Crown, Search } from "lucide-react";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../../api/client";
import HRNav from "../../components/layout/HRNav";
import AdminNav from "../../components/layout/AdminNav";
import AppLayout from "../../components/layout/AppLayout";
import Modal from "../../components/common/Modal";
import "./HRDashboard.css";
import "./DepartmentsPage.css";

// Departments (HR is the primary owner; admins can manage them too).
// List with headcounts, create/edit, activate/deactivate, delete (only when empty),
// and a detail view to set the head and add or remove members.

const EMPTY_FORM = { name: "", description: "" };

const DepartmentStatus = ({ active }) => (
  <span className={`status-badge badge ${active ? "active" : "inactive"}`}>{active ? "Active" : "Deactivated"}</span>
);

// Create / edit form
const DepartmentForm = ({ initial, saving, onSubmit, onCancel }) => {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  return (
    <form className="department-form" onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}>
      <div className="field">
        <label htmlFor="dept-name">Name</label>
        <input id="dept-name" name="name" type="text" maxLength={100} placeholder="e.g. Finance" value={form.name} onChange={change} required />
      </div>
      <div className="field">
        <label htmlFor="dept-description">Description <span className="field-optional">(optional)</span></label>
        <textarea id="dept-description" name="description" rows={3} maxLength={255} placeholder="What this department is responsible for" value={form.description || ""} onChange={change} />
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving && <span className="spinner" aria-hidden="true" />} {initial ? "Save changes" : "Create department"}
        </button>
      </div>
    </form>
  );
};

// Members, head of department and adding employees
const DepartmentDetail = ({ departmentId, employees, onChanged }) => {
  const [detail, setDetail] = useState(null);
  const [selected, setSelected] = useState([]);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/api/departments/${departmentId}`);
      setDetail(res.data);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load the department."));
    }
  }, [departmentId]);

  useEffect(() => { load(); }, [load]);

  const run = async (request, success) => {
    setBusy(true);
    try {
      await request();
      toast.success(success);
      await load();
      onChanged();
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err, "That didn't work. Please try again."));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const candidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    return employees
      .filter((e) => e.department_id !== departmentId)
      .filter((e) => !q || `${e.FullName} ${e.position} ${e.department_name || ""}`.toLowerCase().includes(q));
  }, [employees, departmentId, query]);

  if (!detail) return <p className="muted">Loading…</p>;

  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const addSelected = async () => {
    const ok = await run(() => api.post(`/api/departments/${departmentId}/employees`, { employee_ids: selected }),
      selected.length === 1 ? "Employee added." : `${selected.length} employees added.`);
    if (ok) setSelected([]);
  };

  return (
    <div className="department-detail">
      {detail.description && <p className="department-description">{detail.description}</p>}
      <div className="department-meta">
        <DepartmentStatus active={detail.is_active} />
        <span><Users size={15} aria-hidden="true" /> {detail.employee_count} {detail.employee_count === 1 ? "employee" : "employees"}</span>
      </div>

      <div className="field">
        <label htmlFor="dept-head">Head of department</label>
        <select
          id="dept-head"
          value={detail.head_employee_id || ""}
          disabled={busy || !detail.members.length}
          onChange={(e) => run(() => api.put(`/api/departments/${departmentId}/head`, { employee_id: e.target.value ? Number(e.target.value) : null }),
            e.target.value ? "Head of department set." : "Head of department cleared.")}
        >
          <option value="">{detail.members.length ? "No head assigned" : "Add members first"}</option>
          {detail.members.map((m) => <option key={m.id} value={m.id}>{m.FullName}</option>)}
        </select>
      </div>

      <h4 className="detail-heading">Members</h4>
      {detail.members.length === 0 ? (
        <p className="muted">No one is in this department yet.</p>
      ) : (
        <ul className="member-list">
          {detail.members.map((m) => (
            <li key={m.id}>
              <div className="member-text">
                <span className="member-name">
                  {m.FullName}
                  {m.id === detail.head_employee_id && <span className="badge badge-accent head-badge"><Crown size={12} aria-hidden="true" /> Head</span>}
                </span>
                <span className="member-position">{m.position}</span>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-ghost remove-member"
                disabled={busy}
                aria-label={`Remove ${m.FullName} from ${detail.name}`}
                onClick={() => run(() => api.delete(`/api/departments/${departmentId}/employees/${m.id}`), `${m.FullName} removed.`)}
              >
                <UserMinus size={16} aria-hidden="true" /> Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <h4 className="detail-heading">Add employees</h4>
      {!detail.is_active ? (
        <p className="alert alert-warning">This department is deactivated. Activate it to add employees.</p>
      ) : (
        <>
          <div className="field search-field">
            <label htmlFor="dept-add-search" className="sr-only">Search employees</label>
            <Search size={16} aria-hidden="true" className="search-icon" />
            <input id="dept-add-search" type="search" placeholder="Search by name, position or department" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          {candidates.length === 0 ? (
            <p className="muted">{employees.length ? "No other employees match." : "No employee records yet."}</p>
          ) : (
            <ul className="candidate-list">
              {candidates.map((e) => (
                <li key={e.id}>
                  <label>
                    <input type="checkbox" checked={selected.includes(e.id)} onChange={() => toggle(e.id)} />
                    <span className="member-text">
                      <span className="member-name">{e.FullName}</span>
                      <span className="member-position">{e.position} · {e.department_name || "No department"}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
          <div className="form-actions">
            <button type="button" className="btn btn-primary add-members" disabled={busy || !selected.length} onClick={addSelected}>
              <Plus size={16} aria-hidden="true" /> Add {selected.length ? `${selected.length} selected` : "selected"}
            </button>
          </div>
          <p className="field-hint">Employees who are already in another department are moved here.</p>
        </>
      )}
    </div>
  );
};

const DepartmentsPage = () => {
  const location = useLocation();
  const isAdminArea = location.pathname.startsWith("/admin");
  const [departments, setDepartments] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [status, setStatus] = useState("active");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null); // null | "new" | department
  const [viewing, setViewing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [d, e] = await Promise.all([api.get("/api/departments"), api.get("/api/employees")]);
      setDepartments(d.data);
      setEmployees(e.data);
    } catch (err) {
      setDepartments((prev) => prev || []);
      toast.error(getErrorMessage(err, "Failed to load departments."));
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const list = departments || [];
  const visible = list.filter((d) =>
    (status === "all" || (status === "active" ? d.is_active : !d.is_active)) &&
    (!query.trim() || `${d.name} ${d.description || ""} ${d.head_name || ""}`.toLowerCase().includes(query.trim().toLowerCase())));
  const activeCount = list.filter((d) => d.is_active).length;
  const unassigned = employees.filter((e) => !e.department_id).length;

  const save = async (form) => {
    setSaving(true);
    try {
      if (editing === "new") {
        await api.post("/api/departments", form);
        toast.success("Department created.");
      } else {
        await api.put(`/api/departments/${editing.id}`, form);
        toast.success("Department updated.");
      }
      setEditing(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save the department."));
    } finally {
      setSaving(false);
    }
  };

  const setActive = async (d, isActive) => {
    if (!isActive && !window.confirm(`Deactivate ${d.name}? Its members stay, but no one new can join until it is activated again.`)) return;
    try {
      await api.put(`/api/departments/${d.id}/status`, { is_active: isActive });
      toast.success(isActive ? `${d.name} activated.` : `${d.name} deactivated.`);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update the department."));
    }
  };

  const remove = async (d) => {
    if (!window.confirm(`Delete the ${d.name} department? This can't be undone.`)) return;
    try {
      await api.delete(`/api/departments/${d.id}`);
      toast.success(`${d.name} deleted.`);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete the department."));
    }
  };

  return (
    <AppLayout
      nav={isAdminArea ? <AdminNav /> : <HRNav />}
      className="departments-page"
      title="Departments"
      subtitle="Organise staff into departments, appoint a head for each and keep headcounts accurate."
      actions={
        <button type="button" className="btn btn-primary new-department" onClick={() => setEditing("new")}>
          <Plus size={18} /> New department
        </button>
      }
    >
      <div className="stat-grid dept-stats">
        <div className="stat-tile">
          <span className="stat-icon"><Building2 size={22} /></span>
          <div><p className="stat-label">Active departments</p><p className="stat-value">{departments ? activeCount : "–"}</p></div>
        </div>
        <div className="stat-tile">
          <span className="stat-icon accent"><Users size={22} /></span>
          <div><p className="stat-label">Employees assigned</p><p className="stat-value">{departments ? employees.length - unassigned : "–"}</p></div>
        </div>
        <div className="stat-tile">
          <span className="stat-icon"><UserMinus size={22} /></span>
          <div><p className="stat-label">Without a department</p><p className="stat-value">{departments ? unassigned : "–"}</p></div>
        </div>
      </div>

      <div className="card card-flush">
        <div className="toolbar filter-bar">
          <div className="field">
            <label htmlFor="dept-search">Search</label>
            <input id="dept-search" type="search" placeholder="Department or head" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="dept-status">Status</label>
            <select id="dept-status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="active">Active</option>
              <option value="inactive">Deactivated</option>
              <option value="all">All</option>
            </select>
          </div>
          <span className="toolbar-count">{visible.length} of {list.length}</span>
        </div>
        <div className="table-wrap">
          <table className="data-table stack departments-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Head</th>
                <th>Employees</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((d) => (
                <tr key={d.id}>
                  <td data-label="Department">
                    <div className="dept-cell">
                      <button type="button" className="link-btn dept-name" onClick={() => setViewing(d)}>{d.name}</button>
                      {d.description && <span className="dept-desc">{d.description}</span>}
                    </div>
                  </td>
                  <td data-label="Head">{d.head_name || <span className="cell-muted">Not set</span>}</td>
                  <td data-label="Employees"><span className="dept-count-pill">{d.employee_count}</span></td>
                  <td data-label="Status"><DepartmentStatus active={d.is_active} /></td>
                  <td className="td-actions">
                    <div className="row-actions">
                      <button type="button" className="btn btn-sm btn-secondary view-dept" onClick={() => setViewing(d)}>
                        <Users size={15} aria-hidden="true" /> Members
                      </button>
                      <button type="button" className="icon-btn icon edit" title="Edit" aria-label={`Edit ${d.name}`} onClick={() => setEditing(d)}>
                        <Pencil size={17} />
                      </button>
                      <button
                        type="button"
                        className={d.is_active ? "btn btn-sm btn-secondary toggle-dept" : "btn btn-sm btn-success-soft toggle-dept"}
                        onClick={() => setActive(d, !d.is_active)}
                      >
                        {d.is_active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        type="button"
                        className="icon-btn icon delete"
                        title={d.employee_count ? "Move its employees out before deleting" : "Delete"}
                        aria-label={`Delete ${d.name}`}
                        disabled={d.employee_count > 0}
                        onClick={() => remove(d)}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr className="empty-row">
                  <td colSpan="5">
                    {departments === null ? "Loading departments…" : list.length ? "No departments match your filters." : "No departments yet. Create your first department to organise your staff."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={Boolean(editing)} onClose={() => setEditing(null)} title={editing === "new" ? "New department" : "Edit department"}>
        {editing && (
          <DepartmentForm
            key={editing === "new" ? "new" : editing.id}
            initial={editing === "new" ? null : { name: editing.name, description: editing.description || "" }}
            saving={saving}
            onSubmit={save}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>

      <Modal isOpen={Boolean(viewing)} onClose={() => setViewing(null)} title={viewing ? viewing.name : ""} className="modal-wide">
        {viewing && <DepartmentDetail departmentId={viewing.id} employees={employees} onChanged={load} />}
      </Modal>
    </AppLayout>
  );
};

export default DepartmentsPage;
