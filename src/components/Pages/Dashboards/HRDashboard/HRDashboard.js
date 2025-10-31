import React, { useEffect, useState } from "react";
import axios from "axios";
import EmployeeStats from "../../Shared/EmployeeStats";
import HRNav from "../../Shared/HRNav";
import { useNavigate } from "react-router-dom";
import { Plus, Users, Building } from "lucide-react";
import "./HRDashboard.css";
import toast from "react-hot-toast";

const HRDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/employees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(res.data);
    } catch (err) {
      console.error("Error fetching employees:", err);
      toast.error("Failed to load employees.");
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const today = new Date().toLocaleDateString();

  return (
    <div className="hr-dashboard">
      <HRNav />
      <div className="dashboard-content">
        <div className="welcome-header">
          <h2>Welcome, HR</h2>
          <span className="date">{today}</span>
        </div>

        <div className="quick-actions">
          <button className="btn-primary" onClick={() => navigate("/hr/create-employee")}>
            <Plus size={18} /> Add Employee
          </button>
          <button className="btn-outline" onClick={() => navigate("/hr/employees")}>
            <Users size={18} /> View Employees
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        <EmployeeStats employees={employees} />

        <div className="recent-activity">
          <h3>Quick Stats</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <h4>Total Employees</h4>
              <p>{employees.length}</p>
            </div>
            <div className="stat-card">
              <h4>Active Employees</h4>
              <p>{employees.length}</p>
            </div>
            <div className="stat-card">
              <h4>Departments</h4>
              <p>{new Set(employees.map(emp => emp.Department)).size}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
