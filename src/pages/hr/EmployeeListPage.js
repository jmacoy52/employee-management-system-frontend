import React, { useEffect, useState } from "react";
import api, { getErrorMessage } from "../../api/client";
import EmployeeList from "../../components/common/EmployeeList";
import HRNav from "../../components/layout/HRNav";
import Modal from "../../components/common/Modal";
import toast from "react-hot-toast";

const EmployeeListPage = () => {
  const [employees, setEmployees] = useState([]);
  const [linkableUsers, setLinkableUsers] = useState([]);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    FullName: "",
    position: "",
    Department: "",
    salary: "",
  });

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

  const fetchLinkableUsers = async () => {
    try {
      const res = await api.get("/api/users/linkable");
      setLinkableUsers(res.data);
    } catch (err) {
      console.error("Error fetching user accounts:", err);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchLinkableUsers();
  }, []);

  // Link (or unlink with null) the user account that belongs to this employee record
  const handleLink = async (employeeId, userId) => {
    try {
      await api.put(`/api/employees/${employeeId}/link`, { user_id: userId });
      toast.success(userId ? "Account linked." : "Account unlinked.");
      fetchEmployees();
      fetchLinkableUsers();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to link account."));
    }
  };

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
      await api.put(`/api/employees/${editingEmployee.id}`, formData);
      toast.success("Employee updated successfully!");
      setIsModalOpen(false);
      setEditingEmployee(null);
      fetchEmployees();
    } catch (err) {
      console.error("Failed to update employee:", err);
      toast.error(getErrorMessage(err, "Update failed."));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      await api.delete(`/api/employees/${id}`);
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
        linkableUsers={linkableUsers}
        onLink={handleLink}
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
