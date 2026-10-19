import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../../api/client";
import OwnerNav from "../../components/layout/OwnerNav";
import AppLayout from "../../components/layout/AppLayout";
import OwnerAdminTable from "./OwnerAdminTable";
import "./Owner.css";

// Every organisation's admin account(s): the account holders the owner supports. HR and employee
// accounts are never listed here (tenant boundary); each organisation's admins manage them.
const OwnerAdmins = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState(null);
  const [orgs, setOrgs] = useState([]);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ q: "", organization_id: "", status: "" });

  const load = useCallback(async () => {
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== "").map(([k, v]) => [k, k === "q" ? v.trim() : v]));
      const res = await api.get("/api/platform/admins", { params });
      setUsers(res.data);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load organisation admins."));
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
    <AppLayout nav={<OwnerNav />} title="Organisation admins" subtitle="The admin account holders of every organisation. Each organisation's admins manage their own HR and employee accounts." className="owner-users owner-admins">
      {error && <p className="error page-error" role="alert">{error}</p>}
      <div className="card card-flush">
        <div className="toolbar">
          <div className="field">
            <label htmlFor="ou-search">Search</label>
            <input id="ou-search" name="q" type="search" placeholder="Name, e-mail or organisation" value={filters.q} onChange={set} />
          </div>
          <div className="field">
            <label htmlFor="ou-org">Organisation</label>
            <select id="ou-org" name="organization_id" value={filters.organization_id} onChange={set}>
              <option value="">All organisations</option>
              {orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
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
          <span className="toolbar-count">{users ? users.length : 0} admin{users && users.length === 1 ? "" : "s"}</span>
        </div>
        <OwnerAdminTable users={users} loading={users === null} onChanged={load} showOrg onOpenOrg={(id) => navigate(`/owner/organisations/${id}`)} />
      </div>
    </AppLayout>
  );
};

export default OwnerAdmins;
