import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api, { getErrorMessage } from "../../api/client";
import Modal from "../../components/common/Modal";
import { notifyOwnerCountsChanged } from "./ownerShared";

// Reject a pending registration, with an optional reason shown to its admin at sign-in.
const RejectModal = ({ org, onClose, onDone }) => {
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => setReason(""), [org]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(`/api/platform/organizations/${org.id}/reject`, { reason: reason.trim() || undefined });
      toast.success(`${org.name} rejected.`);
      notifyOwnerCountsChanged();
      onDone();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to reject."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={Boolean(org)} onClose={onClose} title={org ? `Reject ${org.name}?` : "Reject"}>
      {org && (
        <form onSubmit={submit} className="reject-form">
          <p className="owner-temp-note">
            Its administrator will not be able to sign in. You can still approve it later, or delete the registration.
          </p>
          <div className="field">
            <label htmlFor="reject-reason">Reason (optional, shown to the administrator)</label>
            <textarea id="reject-reason" rows={3} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. We could not verify the organisation." />
          </div>
          <div className="modal-actions form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-danger confirm-reject-btn" disabled={saving}>
              {saving && <span className="spinner" aria-hidden="true" />} Reject registration
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default RejectModal;
