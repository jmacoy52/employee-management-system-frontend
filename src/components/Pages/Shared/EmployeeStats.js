// components/Pages/Employees/EmployeeStats.js
import React from "react";
import { Users, Building2, BadgeDollarSign } from "lucide-react";
import "./EmployeeForm.css";

const EmployeeStats = ({ employees }) => {
  const totalEmployees = employees.length;
  const Departments = new Set(employees.map((e) => e.Department));
  const avgSalary =
    employees.reduce((acc, curr) => acc + parseFloat(curr.salary), 0) /
    totalEmployees;

  return (
    <div className="stats-container">
      <div className="stat-card">
        <Users size={28} />
        <div>
          <h4>Total Employees</h4>
          <p>{totalEmployees}</p>
        </div>
      </div>
      <div className="stat-card">
        <Building2 size={28} />
        <div>
          <h4>Departments</h4>
          <p>{Departments.size}</p>
        </div>
      </div>
      <div className="stat-card">
        <BadgeDollarSign size={28} />
        <div>
          <h4>Avg. Salary</h4>
          <p>₵{avgSalary.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeStats;
