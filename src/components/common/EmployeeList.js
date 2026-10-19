import React from "react";
import { useState } from 'react'; 
import { Pencil, Trash2 } from "lucide-react";
import "./EmployeeForm.css";

const EmployeeList = ({ employees, onEdit, onDelete }) => {
    const [selectedDept, setSelectedDept] = useState("All");

  const departments = [
    "All",
    ...Array.from(new Set(employees.map((emp) => emp.Department))),
  ];

  const filteredEmployees =
    selectedDept === "All"
      ? employees
      : employees.filter((emp) => emp.Department === selectedDept);
  return (
      <div className="employee-table-container">
      <div className="filter-bar">
        <label htmlFor="Department">Filter by Department:</label>
        <select
          id="Department"
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
        >
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

    <div className="employee-table-wrapper">
      <table className="employee-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Full Name</th>
            <th>Position</th>
            <th>Department</th>
            <th>Salary</th>
            <th>Email</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
            {filteredEmployees.map((emp) => (
            <tr key={emp.id}>
              <td>{emp.id}</td>
              <td>{emp.FullName}</td>
              <td>{emp.position}</td>
              <td>{emp.Department}</td>
              <td>₵{emp.salary}</td>
              <td>{emp.email}</td>
               <td>{new Date(emp.created_at).toLocaleDateString()}</td>
              <td className="actions">
                <Pencil
                  className="icon edit"
                  title="Edit"
                  onClick={() => onEdit(emp)}
                />
                <Trash2
                  className="icon delete"
                  title="Delete"
                  onClick={() => onDelete(emp.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
};




export default EmployeeList;
