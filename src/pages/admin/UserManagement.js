import React, { useEffect, useState } from "react";
import api, { getErrorMessage } from "../../api/client";
import "./UserManagement.css";
import { toast } from "react-hot-toast";
import AdminNav from "../../components/layout/AdminNav";
import AppLayout from "../../components/layout/AppLayout";
import Modal from "../../components/common/Modal";
import { RoleBadge, StatusBadge } from "../../components/common/RoleBadge";
import { getStoredUser } from "../../auth/session";
import { PATHS } from "../../routes/paths";
import { isDemoEmail } from "../../config/demo";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetUser, setResetUser] = useState(null); // user whose password is being reset
  const [resetResult, setResetResult] = useState(null); // { label, value } shown once
  const me = getStoredUser();

  const fetchUsers = async () => {
    try {
      const response = await api.get("/api/users/all");
      setUsers(response.data);
    } catch (err) {
      toast.error("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/api/users/${userId}/role`,
        { role: newRole });
      toast.success("Role updated successfully.");
      fetchUsers();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update role."));
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await api.delete(`/api/users/${userId}`);
        toast.success("User deleted.");
        fetchUsers();
      } catch (err) {
        toast.error(getErrorMessage(err, "Failed to delete user."));
      }
    }
  };

  // Activate / deactivate. Deactivated users cannot sign in and are signed out at once.
  const handleToggleActive = async (user) => {
    const activate = !user.is_active;
    if (!activate && !window.confirm(`Deactivate ${user.email}? They will be signed out and cannot sign in.`)) return;
    try {
      await api.put(`/api/users/${user.id}/status`, { is_active: activate });
      toast.success(activate ? "User activated." : "User deactivated.");
      fetchUsers();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update status."));
    }
  };

  const openReset = (user) => {
    setResetUser(user);
    setResetResult(null);
  };

  // There is no email service: the admin passes the temporary password or link to the user.
  const issueTemporaryPassword = async () => {
    try {
      const res = await api.post(`/api/users/${resetUser.id}/temporary-password`);
      setResetResult({ label: "Temporary password (shown once)", value: res.data.temporaryPassword });
      toast.success("Temporary password set.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to reset password."));
    }
  };

  const issueResetLink = async () => {
    try {
      const res = await api.post(`/api/users/${resetUser.id}/reset-link`);
      const link = `${window.location.origin}${PATHS.resetPassword}?token=${encodeURIComponent(res.data.token)}`;
      const expires = new Date(res.data.expiresAt).toLocaleString();
      setResetResult({ label: `One-time reset link (expires ${expires})`, value: link });
      toast.success("Reset link created.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to create reset link."));
    }
  };

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(resetResult.value);
      toast.success("Copied.");
    } catch {
      toast.error("Copy failed. Select the text and copy it manually.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <AppLayout
      nav={<AdminNav />}
      title="User Management"
      subtitle="Change roles, deactivate or reactivate accounts, reset passwords and delete users."
      className="user-management-container"
    >
      <div className="card card-flush">
        <div className="table-wrap">
          <table className="data-table stack user-management-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Current Role</th>
                <th>Change Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id}>
                    <td data-label="ID" className="cell-muted">{user.id}</td>
                    <td data-label="Name" className="cell-strong"><span>{user.username}{me?.id === user.id && <span className="you-tag"> (you)</span>}</span></td>
                    <td data-label="Email"><span>{user.email}{isDemoEmail(user.email) && <span className="badge demo-badge" title="Demo accounts are protected and can't be changed.">Demo account</span>}</span></td>
                    <td data-label="Current Role"><RoleBadge role={user.role} /></td>
                    <td data-label="Change Role">
                      <select
                        className="select-sm"
                        aria-label={`Role for ${user.email}`}
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user.id, e.target.value)
                        }
                      >
                        <option value="admin">Admin</option>
                        <option value="hr">HR</option>
                        <option value="employee">Employee</option>
                      </select>
                    </td>
                    <td data-label="Status">
                      <StatusBadge active={user.is_active} />
                    </td>
                    <td className="user-actions td-actions">
                      <div className="row-actions">
                        {me?.id !== user.id && (
                          <>
                            <button
                              type="button"
                              className={user.is_active ? "btn btn-sm btn-secondary toggle-btn deactivate" : "btn btn-sm btn-success-soft toggle-btn activate"}
                              onClick={() => handleToggleActive(user)}
                            >
                              {user.is_active ? "Deactivate" : "Activate"}
                            </button>
                            <button type="button" className="btn btn-sm btn-secondary reset-btn" onClick={() => openReset(user)}>
                              Reset Password
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          className="btn btn-sm btn-danger-soft delete-btn"
                          onClick={() => handleDelete(user.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="empty-row">
                  <td colSpan="7">{loading ? "Loading users…" : "No users available."}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={Boolean(resetUser)}
        onClose={() => setResetUser(null)}
        title={resetUser ? `Reset password: ${resetUser.email}` : ""}
      >
        {!resetResult ? (
          <>
            <p>Choose how to reset this password. No email is sent; give the result to the user yourself.</p>
            <button type="button" className="btn btn-primary reset-btn reset-option" onClick={issueTemporaryPassword}>
              Set temporary password (user must change it at sign-in)
            </button>
            <button type="button" className="btn btn-secondary reset-btn reset-option" onClick={issueResetLink}>
              Create one-time reset link
            </button>
          </>
        ) : (
          <>
            <p><strong>{resetResult.label}</strong></p>
            <div className="reset-result-row">
              <input className="reset-result input" readOnly value={resetResult.value} onFocus={(e) => e.target.select()} aria-label={resetResult.label} />
              <button type="button" className="btn btn-primary reset-btn" onClick={copyResult}>Copy</button>
            </div>
            <p className="reset-note">The user's existing sessions have{resetResult.label.startsWith("Temporary") ? "" : " not"} been signed out.</p>
          </>
        )}
      </Modal>
    </AppLayout>
  );
};

export default UserManagement;
