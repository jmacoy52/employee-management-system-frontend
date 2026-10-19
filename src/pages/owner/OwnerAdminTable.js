import React, { useState } from "react";
import { toast } from "react-hot-toast";
import api, { getErrorMessage } from "../../api/client";
import Modal from "../../components/common/Modal";
import { StatusBadge } from "../../components/common/RoleBadge";
import { isDemoEmail } from "../../config/demo";
import { PATHS } from "../../routes/paths";
import { formatDate, formatDateTime } from "./ownerShared";

// Organisation admin accounts for the owner console: activate/deactivate and password resets
// (temporary password or one-time link). Tenant boundary: the owner only ever sees and supports an
// organisation's admins; HR and employee accounts are managed by those admins (the API answers 404
// for them). showOrg adds the organisation column. Demo accounts are refused by the API.
const OwnerAdminTable = ({ users, loading, onChanged, showOrg = false, onOpenOrg }) => {
  const [resetUser, setResetUser] = useState(null);
  const [resetResult, setResetResult] = useState(null);

  const toggle = async (user) => {
    const activate = !user.is_active;
    if (!activate && !window.confirm(`Deactivate ${user.email}? They will be signed out and cannot sign in.`)) return;
    try {
      await api.put(`/api/platform/admins/${user.id}/status`, { is_active: activate });
      toast.success(activate ? "Admin activated." : "Admin deactivated.");
      onChanged();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update status."));
    }
  };

  const tempPassword = async () => {
    try {
      const res = await api.post(`/api/platform/admins/${resetUser.id}/temporary-password`);
      setResetResult({ label: "Temporary password (shown once)", value: res.data.temporaryPassword });
      onChanged();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to reset password."));
    }
  };

  const resetLink = async () => {
    try {
      const res = await api.post(`/api/platform/admins/${resetUser.id}/reset-link`);
      const link = `${window.location.origin}${PATHS.resetPassword}?token=${encodeURIComponent(res.data.token)}`;
      setResetResult({ label: `One-time reset link (expires ${new Date(res.data.expiresAt).toLocaleString()})`, value: link });
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to create reset link."));
    }
  };

  const cols = showOrg ? 7 : 6;
  return (
    <>
      <div className="table-wrap">
        <table className="data-table stack owner-user-table owner-admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              {showOrg && <th>Organisation</th>}
              <th>Status</th>
              <th>Last sign-in</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users && users.length > 0 ? (
              users.map((u) => (
                <tr key={u.id}>
                  <td data-label="Name" className="cell-strong">{u.username}</td>
                  <td data-label="Email"><span>{u.email}{isDemoEmail(u.email) && <span className="badge demo-badge" title="Demo accounts are protected and can't be changed.">Demo account</span>}</span></td>
                  {showOrg && (
                    <td data-label="Organisation">
                      <button type="button" className="owner-link-btn" onClick={() => onOpenOrg && onOpenOrg(u.organization_id)}>{u.organization_name}</button>
                    </td>
                  )}
                  <td data-label="Status"><StatusBadge active={u.is_active} /></td>
                  <td data-label="Last sign-in" className="cell-muted cell-nowrap last-login">{u.last_login_at ? formatDateTime(u.last_login_at) : "Never"}</td>
                  <td data-label="Created" className="cell-muted cell-nowrap">{formatDate(u.created_at)}</td>
                  <td className="td-actions">
                    <div className="row-actions">
                      <button
                        type="button"
                        className={u.is_active ? "btn btn-sm btn-secondary toggle-btn deactivate" : "btn btn-sm btn-success-soft toggle-btn activate"}
                        onClick={() => toggle(u)}
                      >
                        {u.is_active ? "Deactivate" : "Activate"}
                      </button>
                      <button type="button" className="btn btn-sm btn-secondary reset-btn" onClick={() => { setResetUser(u); setResetResult(null); }}>
                        Reset Password
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr className="empty-row">
                <td colSpan={cols}>{loading ? "Loading admins…" : "No organisation admins found."}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={Boolean(resetUser)} onClose={() => setResetUser(null)} title={resetUser ? `Reset password: ${resetUser.email}` : ""}>
        {!resetResult ? (
          <>
            <p>Choose how to reset this admin's password. No email is sent; give the result to the account holder yourself.</p>
            <button type="button" className="btn btn-primary reset-btn reset-option" onClick={tempPassword}>
              Set temporary password (user must change it at sign-in)
            </button>
            <button type="button" className="btn btn-secondary reset-btn reset-option" onClick={resetLink}>
              Create one-time reset link
            </button>
          </>
        ) : (
          <>
            <p><strong>{resetResult.label}</strong></p>
            <div className="reset-result-row">
              <input className="reset-result input" readOnly value={resetResult.value} onFocus={(e) => e.target.select()} aria-label={resetResult.label} />
            </div>
          </>
        )}
      </Modal>
    </>
  );
};

export default OwnerAdminTable;
