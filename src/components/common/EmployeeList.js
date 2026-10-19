import React from "react";
import { useState } from 'react'; 
import { Pencil, Trash2 } from "lucide-react";
import { formatCedis } from "./EmployeeStats";
import "./EmployeeForm.css";

// linkableUsers/onLink are optional: when given, an Account column lets HR link a user account.
// departments (from /api/departments) feeds the department filter; without it the filter
// falls back to the department names found in the list.
const EmployeeList = ({ employees, onEdit, onDelete, linkableUsers, onLink, departments, loading = false }) => {
    const [selectedDept, setSelectedDept] = useState("All");
    const [query, setQuery] = useState("");

  const deptName = (emp) => emp.department_name || emp.Department || "";
  const filterOptions = departments
    ? departments.map((d) => ({ value: String(d.id), label: d.is_active ? d.name : `${d.name} (deactivated)` }))
    : Array.from(new Set(employees.map(deptName).filter(Boolean))).map((n) => ({ value: n, label: n }));
  const matchesDept = (emp) => {
    if (selectedDept === "All") return true;
    if (selectedDept === "none") return !emp.department_id && !emp.Department;
    return departments ? String(emp.department_id) === selectedDept : deptName(emp) === selectedDept;
  };

  const q = query.trim().toLowerCase();
  const filteredEmployees = employees.filter(
    (emp) =>
      matchesDept(emp) &&
      (!q || `${emp.FullName} ${emp.email} ${emp.position}`.toLowerCase().includes(q))
  );
  return (
      <div className="card card-flush employee-table-container">
      <div className="toolbar filter-bar">
        <div className="field">
          <label htmlFor="employee-search">Search</label>
          <input
            id="employee-search"
            type="search"
            placeholder="Name, email or position"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="Department">Filter by Department</label>
          <select
            id="Department"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            <option value="All">All departments</option>
            {filterOptions.map((dept) => (
              <option key={dept.value} value={dept.value}>
                {dept.label}
              </option>
            ))}
            {employees.some((emp) => !emp.department_id && !emp.Department) && <option value="none">No department</option>}
          </select>
        </div>
        <span className="toolbar-count">{filteredEmployees.length} of {employees.length}</span>
      </div>

    <div className="table-wrap employee-table-wrapper">
      <table className="data-table stack employee-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Full Name</th>
            <th>Position</th>
            <th>Department</th>
            <th>Salary</th>
            <th>Email</th>
            <th>Joined</th>
            {onLink && <th>Account</th>}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
            {filteredEmployees.map((emp) => (
            <tr key={emp.id}>
              <td data-label="ID" className="cell-muted">{emp.id}</td>
              <td data-label="Full Name" className="cell-strong">{emp.FullName}</td>
              <td data-label="Position">{emp.position}</td>
              <td data-label="Department">{deptName(emp) ? <span className="badge">{deptName(emp)}</span> : <span className="cell-muted">None</span>}</td>
              <td data-label="Salary" className="cell-nowrap">{formatCedis(emp.salary)}</td>
              <td data-label="Email">{emp.email}</td>
               <td data-label="Joined" className="cell-muted cell-nowrap">{new Date(emp.created_at).toLocaleDateString()}</td>
              {onLink && (
                <td data-label="Account">
                  <select
                    className="select-sm link-select"
                    aria-label={`Account for ${emp.FullName}`}
                    value={emp.user_id || ""}
                    onChange={(e) => onLink(emp.id, e.target.value ? Number(e.target.value) : null)}
                  >
                    <option value="">Not linked</option>
                    {(linkableUsers || [])
                      .filter((u) => !u.employee_id || u.employee_id === emp.id)
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.email}
                        </option>
                      ))}
                  </select>
                </td>
              )}
              <td className="actions td-actions">
                <div className="row-actions">
                  <button
                    type="button"
                    className="icon-btn icon edit"
                    title="Edit"
                    aria-label={`Edit ${emp.FullName}`}
                    onClick={() => onEdit(emp)}
                  >
                    <Pencil size={17} />
                  </button>
                  <button
                    type="button"
                    className="icon-btn icon delete"
                    title="Delete"
                    aria-label={`Delete ${emp.FullName}`}
                    onClick={() => onDelete(emp.id)}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {filteredEmployees.length === 0 && (
            <tr className="empty-row">
              <td colSpan={onLink ? 9 : 8}>
                {loading ? "Loading employees…" : employees.length ? "No employees match your filters." : "No employees yet."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    </div>
  );
};




export default EmployeeList;
