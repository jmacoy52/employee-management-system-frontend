import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../../api/client";
import OwnerNav from "../../components/layout/OwnerNav";
import AppLayout from "../../components/layout/AppLayout";
import OwnerUserTable from "./OwnerUserTable";
import "./Owner.css";

// Every organisation's user accounts (owners are never listed)
const OwnerUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState(null);
  const [orgs, setOrgs] = useState([]);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ q: "", organization_id: "", role: "", status: "" });

  const load = useCallback(async () => {
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== "").map(([k, v]) => [k, k === "q" ? v.trim() : v]));
      const res = await api.get("/api/platform/users", { params });
      setUsers(res.data);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load users."));
      setUsers([]);
    }
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => {
    api.get("/api/platform/organizations").then((r) => setOrgs(r.data)).catch(() => setOrgs([]));
  }, []);

  const set = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  return (
    <AppLayout nav={<OwnerNav />} title="All users" subtitle="User accounts in every organisation. Demo accounts are protected." className="owner-users">
      {error && <p className="error page-error" role="alert">{error}</p>}
      <div className="card card-flush">
        <div className="toolbar">
          <div className="field">
            <label htmlFor="ou-search">Search</label>
            <input id="ou-search" name="q" type="search" placeholder="Name or e-mail" value={filters.q} onChange={set} />
          </div>
          <div className="field">
            <label htmlFor="ou-org">Organisation</label>
            <select id="ou-org" name="organization_id" value={filters.organization_id} onChange={set}>
              <option value="">All organisations</option>
              {orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="ou-role">Role</label>
            <select id="ou-role" name="role" value={filters.role} onChange={set}>
              <option value="">All roles</option>
              <option value="admin">Admin</option>
              <option value="hr">HR</option>
              <option value="employee">Employee</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="ou-status">Status</label>
            <select id="ou-status" name="status" value={filters.status} onChange={set}>
              <option value="">Any status</option>
              <option value="active">Active</option>
              <option value="inactive">Deactivated</option>
            </select>
          </div>
          <span className="toolbar-count">{users ? users.length : 0} users</span>
        </div>
        <OwnerUserTable users={users} loading={users === null} onChanged={load} showOrg onOpenOrg={(id) => navigate(`/owner/organisations/${id}`)} />
      </div>
    </AppLayout>
  );
};

export default OwnerUsers;
