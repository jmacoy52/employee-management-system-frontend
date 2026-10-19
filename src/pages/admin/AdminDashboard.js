import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PlanBanner from "../../components/billing/PlanBanner";
import "./AdminDashboard.css";
import { Users, Settings, ScrollText, UserCheck, Plus, UserX, ShieldCheck, ArrowRight, Building2 } from "lucide-react";
import api, { getErrorMessage } from "../../api/client";
import { getStoredUser } from "../../auth/session";
import { toast } from "react-hot-toast";
import AdminNav from "../../components/layout/AdminNav";
import AppLayout from "../../components/layout/AppLayout";
import ActionBadge from "../../components/common/ActionBadge";
import Modal from "../../components/common/Modal";
import PasswordInput from "../../components/auth/PasswordInput";

const SHORTCUTS = [
  { to: "/admin/users", icon: Users, title: "View All Users", text: "Browse and manage all registered users." },
  { to: "/admin/user-management", icon: Settings, title: "User Management", text: "Create, edit, and remove user accounts." },
  { to: "/admin/audit-log", icon: ScrollText, title: "Audit Log", text: "Review admin activity and changes made in the system." },
  { to: "/admin/hr", icon: UserCheck, title: "HR Dashboard", text: "Access HR functionalities and manage employee data." },
  { to: "/admin/departments", icon: Building2, title: "Departments", text: "Set up departments, their heads and their members." },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const me = getStoredUser();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [users, setUsers] = useState(null);
  const [recentLogs, setRecentLogs] = useState(null);
  const [creating, setCreating] = useState(false);

  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "employee",
  });

  // Overview numbers and the latest audit entries (both from existing admin endpoints).
  const loadOverview = useCallback(async () => {
    try {
      const res = await api.get("/api/users/all");
      setUsers(res.data);
    } catch {
      setUsers([]);
    }
    try {
      const res = await api.get("/api/audit-logs", { params: { limit: 6 } });
      setRecentLogs(res.data);
    } catch (err) {
      // The organisation audit log is a Growth+ feature; on lower plans the panel explains that
      const locked = err && err.response && err.response.data && err.response.data.code === "PLAN_FEATURE_UNAVAILABLE";
      setRecentLogs(locked ? "locked" : []);
    }
  }, []);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const handleChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {

      await api.post("/api/users/register", newUser);

      toast.success("User account created!");
      setShowCreateModal(false);
      setNewUser({ username: "", email: "", password: "", role: "employee" });
      loadOverview();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to create user"));
    } finally {
      setCreating(false);
    }
  };

  const count = (fn) => (users ? users.filter(fn).length : "–");
  const stats = [
    { label: "Total users", value: users ? users.length : "–", icon: Users, tone: "" },
    { label: "Admins / HR", value: users ? `${count((u) => u.role === "admin")} / ${count((u) => u.role === "hr")}` : "–", icon: ShieldCheck, tone: "accent" },
    { label: "Employees", value: count((u) => u.role === "employee"), icon: UserCheck, tone: "" },
    { label: "Deactivated", value: count((u) => !u.is_active), icon: UserX, tone: "danger" },
  ];

  return (
    <AppLayout
      nav={<AdminNav />}
      className="admin-dashboard"
      title="Admin Dashboard"
      subtitle={`Signed in as ${me?.username || me?.email || "admin"}. Manage accounts, roles and access.`}
      actions={
        <button type="button" className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={18} /> New user
        </button>
      }
    >
      <PlanBanner role="admin" />
      <div className="stat-grid">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <div className="stat-tile" key={label}>
            <span className={`stat-icon ${tone}`}><Icon size={22} /></span>
            <div>
              <p className="stat-label">{label}</p>
              <p className="stat-value">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-grid section">
        <section>
          <h2 className="section-title">Shortcuts</h2>
          <div className="admin-cards-container">
            {SHORTCUTS.map(({ to, icon: Icon, title, text }) => (
              <button type="button" className="admin-card" key={to} onClick={() => navigate(to)}>
                <span className="stat-icon"><Icon size={22} className="card-icon" /></span>
                <span className="admin-card-text">
                  <span className="admin-card-title">{title}</span>
                  <span className="admin-card-desc">{text}</span>
                </span>
                <ArrowRight size={18} className="admin-card-arrow" />
              </button>
            ))}
          </div>
        </section>

        <section className="card card-flush recent-card">
          <div className="card-header recent-header">
            <h2 className="card-title">Recent activity</h2>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate("/admin/audit-log")}>
              View all
            </button>
          </div>
          {recentLogs === null ? (
            <p className="recent-empty">Loading…</p>
          ) : recentLogs === "locked" ? (
            <p className="recent-empty audit-locked">The organisation audit log is included in Growth and Business. <Link to="/admin/billing">See plans</Link></p>
          ) : recentLogs.length === 0 ? (
            <p className="recent-empty">No activity yet.</p>
          ) : (
            <ul className="recent-list">
              {recentLogs.map((log) => (
                <li key={log.LogId}>
                  <ActionBadge action={log.actions} />
                  <span className="recent-desc">{log.descriptions}</span>
                  <time className="recent-time" dateTime={log.created_at}>
                    {new Date(log.created_at).toLocaleString()}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* FLOATING BUTTON */}
      <button type="button" className="floating-add-btn" onClick={() => setShowCreateModal(true)} aria-label="Create new user">
        <Plus size={22} />
      </button>

      {/* CREATE USER MODAL */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New User" className="modal-content">
        <form onSubmit={handleCreateUser} className="create-user-form">
          <div className="field">
            <label htmlFor="new-username">Username</label>
            <input id="new-username" type="text" name="username" placeholder="e.g. Ama Mensah" value={newUser.username} onChange={handleChange} required />
          </div>
          <div className="field">
            <label htmlFor="new-email">Email</label>
            <input id="new-email" type="email" name="email" placeholder="name@company.com" value={newUser.email} onChange={handleChange} required />
          </div>
          <div className="field">
            <label htmlFor="new-password">Password</label>
            <PasswordInput id="new-password" name="password" placeholder="Min. 8 characters, letters and numbers" minLength={8} value={newUser.password} onChange={handleChange} required autoComplete="new-password" />
          </div>
          <div className="field">
            <label htmlFor="new-role">Role</label>
            <select id="new-role" name="role" value={newUser.role} onChange={handleChange} required>
              <option value="employee">Employee</option>
              <option value="hr">HR</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="modal-actions form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating && <span className="spinner" aria-hidden="true" />} Create
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
};

export default AdminDashboard;
