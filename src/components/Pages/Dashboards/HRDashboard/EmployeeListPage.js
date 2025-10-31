import React, { useEffect, useState } from "react";
import axios from "axios";
import EmployeeList from "../../Shared/EmployeeList";
import HRNav from "../../Shared/HRNav";
import Modal from "../../Shared/Modal";
import toast from "react-hot-toast";

const EmployeeListPage = () => {
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [formData, setFormData] = useState({
    FullName: "",
    position: "",
    Department: "",
    salary: "",
  });
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

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      FullName: employee.FullName,
      position: employee.position,
      Department: employee.Department,
      salary: employee.salary,
    });
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:5000/api/employees/${editingEmployee.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Employee updated successfully!");
      setIsModalOpen(false);
      setEditingEmployee(null);
      fetchEmployees();
    } catch (err) {
      console.error("Failed to update employee:", err);
      toast.error("Update failed.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Employee deleted successfully!");
      fetchEmployees();
    } catch (err) {
      console.error("Failed to delete employee:", err);
      toast.error("Delete failed.");
    }
  };

  return (
    <div className="employee-list-page">
      <HRNav />
      <h2>Employee List</h2>
      {error && <p className="error">{error}</p>}
      <EmployeeList
        employees={employees}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Edit Employee"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }}>
          <div className="form-group">
            <label>Full Name:</label>
            <input
              type="text"
              value={formData.FullName}
              onChange={(e) => setFormData({ ...formData, FullName: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Position:</label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Department:</label>
            <input
              type="text"
              value={formData.Department}
              onChange={(e) => setFormData({ ...formData, Department: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Salary:</label>
            <input
              type="number"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit">Update</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmployeeListPage;
