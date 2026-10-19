import React, { useEffect, useState } from "react";
import api, { getErrorMessage } from "../../api/client";
import "./UserManagement.css";
import { toast } from "react-hot-toast";
import AdminNav from "../../components/layout/AdminNav";
import Modal from "../../components/common/Modal";
import { getStoredUser } from "../../auth/session";
import { PATHS } from "../../routes/paths";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [resetUser, setResetUser] = useState(null); // user whose password is being reset
  const [resetResult, setResetResult] = useState(null); // { label, value } shown once
  const me = getStoredUser();

  const fetchUsers = async () => {
    try {
      const response = await api.get("/api/users/all");
      setUsers(response.data);
    } catch (err) {
      toast.error("Failed to fetch users.");
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
    <div className="user-management-container">
      <AdminNav />
      <h2>User Management</h2>
      <table className="user-management-table">
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
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <select
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
                <td>
                  <span className={`status-badge ${user.is_active ? "active" : "inactive"}`}>
                    {user.is_active ? "Active" : "Deactivated"}
                  </span>
                </td>
                <td className="user-actions">
                  {me?.id !== user.id && (
                    <>
                      <button
                        className={user.is_active ? "toggle-btn deactivate" : "toggle-btn activate"}
                        onClick={() => handleToggleActive(user)}
                      >
                        {user.is_active ? "Deactivate" : "Activate"}
                      </button>
                      <button className="reset-btn" onClick={() => openReset(user)}>
                        Reset Password
                      </button>
                    </>
                  )}
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(user.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">No users available.</td>
            </tr>
          )}
        </tbody>
      </table>

      <Modal
        isOpen={Boolean(resetUser)}
        onClose={() => setResetUser(null)}
        title={resetUser ? `Reset password: ${resetUser.email}` : ""}
      >
        {!resetResult ? (
          <>
            <p>Choose how to reset this password. No email is sent; give the result to the user yourself.</p>
            <button className="reset-btn" onClick={issueTemporaryPassword}>
              Set temporary password (user must change it at sign-in)
            </button>
            <button className="reset-btn" onClick={issueResetLink}>
              Create one-time reset link
            </button>
          </>
        ) : (
          <>
            <p><strong>{resetResult.label}</strong></p>
            <input className="reset-result" readOnly value={resetResult.value} onFocus={(e) => e.target.select()} />
            <button className="reset-btn" onClick={copyResult}>Copy</button>
            <p className="reset-note">The user's existing sessions have{resetResult.label.startsWith("Temporary") ? "" : " not"} been signed out.</p>
          </>
        )}
      </Modal>
    </div>
  );
};

export default UserManagement;
