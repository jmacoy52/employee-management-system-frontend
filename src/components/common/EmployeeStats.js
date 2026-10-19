// components/Pages/Employees/EmployeeStats.js
import React from "react";
import { Users, Building2, BadgeDollarSign, Link2 } from "lucide-react";

export const formatCedis = (n) =>
  `₵${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

const EmployeeStats = ({ employees }) => {
  const totalEmployees = employees.length;
  const Departments = new Set(employees.map((e) => e.Department));
  const avgSalary = totalEmployees
    ? employees.reduce((acc, curr) => acc + parseFloat(curr.salary || 0), 0) / totalEmployees
    : 0; // no employees yet: show 0 instead of NaN
  const linked = employees.filter((e) => e.user_id).length;

  return (
    <div className="stat-grid stats-container">
      <div className="stat-tile">
        <span className="stat-icon"><Users size={22} /></span>
        <div>
          <p className="stat-label">Total Employees</p>
          <p className="stat-value">{totalEmployees}</p>
        </div>
      </div>
      <div className="stat-tile">
        <span className="stat-icon accent"><Building2 size={22} /></span>
        <div>
          <p className="stat-label">Departments</p>
          <p className="stat-value">{Departments.size}</p>
        </div>
      </div>
      <div className="stat-tile">
        <span className="stat-icon"><BadgeDollarSign size={22} /></span>
        <div>
          <p className="stat-label">Avg. Salary</p>
          <p className="stat-value">{formatCedis(avgSalary)}</p>
        </div>
      </div>
      <div className="stat-tile">
        <span className="stat-icon accent"><Link2 size={22} /></span>
        <div>
          <p className="stat-label">Linked to an account</p>
          <p className="stat-value">{linked} / {totalEmployees}</p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeStats;
