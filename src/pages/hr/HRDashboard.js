import React, { useEffect, useMemo, useState } from "react";
import api, { getErrorMessage } from "../../api/client";
import EmployeeStats from "../../components/common/EmployeeStats";
import HRNav from "../../components/layout/HRNav";
import AppLayout from "../../components/layout/AppLayout";
import ActionBadge from "../../components/common/ActionBadge";
import { getStoredUser } from "../../auth/session";
import { useNavigate } from "react-router-dom";
import { Plus, Users } from "lucide-react";
import "./HRDashboard.css";
import toast from "react-hot-toast";

const HRDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [activity, setActivity] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const user = getStoredUser();


  const fetchEmployees = async () => {
    try {
      const res = await api.get("/api/employees");
      setEmployees(res.data);
    } catch (err) {
      console.error("Error fetching employees:", err);
      setError(getErrorMessage(err, "Failed to load employees."));
      toast.error("Failed to load employees.");
    }
  };

  // Last 10 audit entries (HR can read these via /api/audit-logs/recent)
  const fetchActivity = async () => {
    try {
      const res = await api.get("/api/audit-logs/recent");
      setActivity(res.data);
    } catch {
      setActivity([]);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchActivity();
  }, []);

  // Headcount per department, largest first (replaces the old duplicate "Quick Stats").
  const byDepartment = useMemo(() => {
    const counts = {};
    employees.forEach((e) => {
      counts[e.Department] = (counts[e.Department] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [employees]);

  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const firstName = (user?.username || "").split(" ")[0];

  return (
    <AppLayout
      nav={<HRNav />}
      className="hr-dashboard"
      title={firstName ? `Welcome, ${firstName}` : "Welcome, HR"}
      subtitle={today}
      actions={
        <div className="quick-actions">
          <button className="btn btn-primary" onClick={() => navigate("/hr/create-employee")}>
            <Plus size={18} /> Add Employee
          </button>
          <button className="btn btn-secondary" onClick={() => navigate("/hr/employees")}>
            <Users size={18} /> View Employees
          </button>
        </div>
      }
    >
      {error && <p className="error page-error" role="alert">{error}</p>}

      <EmployeeStats employees={employees} />

      <div className="two-col section">
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Employees by department</h2>
          </div>
          {byDepartment.length === 0 ? (
            <p className="muted">No employees yet. Add your first employee to see a breakdown.</p>
          ) : (
            <ul className="dept-list">
              {byDepartment.map(([dept, n]) => (
                <li key={dept}>
                  <div className="dept-row">
                    <span>{dept}</span>
                    <span className="dept-count">{n}</span>
                  </div>
                  <div className="dept-bar" aria-hidden="true">
                    <span style={{ width: `${(n / employees.length) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card card-flush">
          <div className="card-header activity-header">
            <h2 className="card-title">Recent activity</h2>
          </div>
          {activity === null ? (
            <p className="activity-empty">Loading…</p>
          ) : activity.length === 0 ? (
            <p className="activity-empty">No recent activity.</p>
          ) : (
            <ul className="activity-list">
              {activity.map((a) => (
                <li key={a.LogId}>
                  <ActionBadge action={a.actions} />
                  <span className="activity-desc">{a.descriptions}</span>
                  <span className="activity-meta">
                    {a.username ? `${a.username} · ` : ""}
                    {new Date(a.created_at).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppLayout>
  );
};

export default HRDashboard;
