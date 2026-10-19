import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Hourglass, Mail, Phone, MapPin, Building2, Users } from "lucide-react";
import { toast } from "react-hot-toast";
import api, { getErrorMessage } from "../../api/client";
import RejectModal from "./RejectModal";
import { formatDate, placeLabel, notifyOwnerCountsChanged } from "./ownerShared";
import { sizeLabel } from "../../config/signupOptions";

// Organisations waiting for approval, with the details captured at sign-up and
// Review / Approve / Reject. Shown at the top of the overview and the organisations list.
const PendingApprovals = ({ onChanged, limit }) => {
  const navigate = useNavigate();
  const [pending, setPending] = useState(null);
  const [rejecting, setRejecting] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get("/api/platform/organizations", { params: { status: "pending" } });
      setPending(res.data);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load pending registrations."));
      setPending([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const changed = () => {
    load();
    notifyOwnerCountsChanged();
    if (onChanged) onChanged();
  };

  const approve = async (org) => {
    try {
      await api.post(`/api/platform/organizations/${org.id}/approve`);
      toast.success(`${org.name} approved. Its administrator can now sign in.`);
      changed();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to approve."));
    }
  };

  const shown = pending && limit ? pending.slice(0, limit) : pending;

  return (
    <section className={`card card-flush pending-approvals ${pending && pending.length ? "has-pending" : ""}`} aria-labelledby="pending-title">
      <div className="card-header">
        <h2 className="card-title" id="pending-title">
          <Hourglass size={18} aria-hidden="true" /> Pending approval
          {pending && pending.length > 0 && <span className="count-pill pending-count">{pending.length}</span>}
        </h2>
        {limit && pending && pending.length > limit && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate("/owner/organisations?status=pending")}>View all</button>
        )}
      </div>
      {pending === null ? (
        <p className="owner-empty">Loading…</p>
      ) : pending.length === 0 ? (
        <p className="owner-empty">No organisations are waiting for approval. New registrations appear here.</p>
      ) : (
        <ul className="pending-cards">
          {shown.map((org) => (
            <li key={org.id} className="pending-card">
              <div className="pending-card-main">
                <button type="button" className="owner-link-btn pending-name" onClick={() => navigate(`/owner/organisations/${org.id}`)}>
                  {org.name}
                </button>
                <span className="pending-when">Registered {formatDate(org.created_at)}</span>
                <ul className="pending-facts">
                  <li><Building2 size={15} aria-hidden="true" /> {org.org_type || "Type not given"}</li>
                  <li><Users size={15} aria-hidden="true" /> {sizeLabel(org.size_range)}</li>
                  <li><MapPin size={15} aria-hidden="true" /> {placeLabel(org)}</li>
                  <li><Mail size={15} aria-hidden="true" /> {org.contact_name ? `${org.contact_name} · ` : ""}{org.contact_email || "–"}</li>
                  {org.phone && <li><Phone size={15} aria-hidden="true" /> {org.phone}</li>}
                </ul>
              </div>
              <div className="pending-card-actions">
                <button type="button" className="btn btn-primary btn-sm approve-btn" onClick={() => approve(org)}>Approve</button>
                <button type="button" className="btn btn-danger-soft btn-sm reject-btn" onClick={() => setRejecting(org)}>Reject</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate(`/owner/organisations/${org.id}`)}>Review</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <RejectModal org={rejecting} onClose={() => setRejecting(null)} onDone={() => { setRejecting(null); changed(); }} />
    </section>
  );
};

export default PendingApprovals;
