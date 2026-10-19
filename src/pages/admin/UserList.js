import React, { useEffect, useMemo, useState } from "react";
import api, { getErrorMessage } from "../../api/client";
import "./UserList.css";
import AdminNav from "../../components/layout/AdminNav";
import AppLayout from "../../components/layout/AppLayout";
import { RoleBadge, StatusBadge } from "../../components/common/RoleBadge";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");

  useEffect(() => {
    const fetchUsers = async () => {

      try {
        const response = await api.get("/api/users/all");
        setUsers(response.data);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to fetch users."));
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter(
      (u) =>
        (role === "all" || u.role === role) &&
        (!q || `${u.username} ${u.email} ${u.employee_name || ""}`.toLowerCase().includes(q))
    );
  }, [users, query, role]);

  return (
    <AppLayout nav={<AdminNav />} title="All Users" subtitle="Every account that can sign in to EmploCore." className="user-list-container">
      {error && <p className="error page-error" role="alert">{error}</p>}
      <div className="card card-flush">
        <div className="toolbar">
          <div className="field">
            <label htmlFor="user-search">Search</label>
            <input id="user-search" type="search" placeholder="Name, email or employee" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="user-role-filter">Role</label>
            <select id="user-role-filter" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="all">All roles</option>
              <option value="admin">Admin</option>
              <option value="hr">HR</option>
              <option value="employee">Employee</option>
            </select>
          </div>
          <span className="toolbar-count">{visible.length} of {users.length}</span>
        </div>
        <div className="table-wrap">
          <table className="data-table stack user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Employee Record</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {visible.length > 0 ? (
                visible.map((user) => (
                  <tr key={user.id}>
                    <td data-label="ID" className="cell-muted">{user.id}</td>
                    <td data-label="Username" className="cell-strong">{user.username}</td>
                    <td data-label="Email">{user.email}</td>
                    <td data-label="Role"><RoleBadge role={user.role} /></td>
                    <td data-label="Status"><StatusBadge active={user.is_active} /></td>
                    <td data-label="Employee Record" className={user.employee_name ? "" : "cell-muted"}>{user.employee_name || "Not linked"}</td>
                    <td data-label="Created At" className="cell-muted cell-nowrap">{new Date(user.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr className="empty-row">
                  <td colSpan="7">{loading ? "Loading users…" : "No users found."}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
};

export default UserList;
