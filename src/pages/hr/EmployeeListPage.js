import React, { useEffect, useState } from "react";
import api, { getErrorMessage } from "../../api/client";
import EmployeeList from "../../components/common/EmployeeList";
import HRNav from "../../components/layout/HRNav";
import Modal from "../../components/common/Modal";
import AppLayout from "../../components/layout/AppLayout";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import "./HRDashboard.css";

const EmployeeListPage = () => {
  const [employees, setEmployees] = useState([]);
  const [linkableUsers, setLinkableUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
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
    } finally {
      setLoading(false);
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
    setSaving(true);
    try {
      await api.put(`/api/employees/${editingEmployee.id}`, formData);
      toast.success("Employee updated successfully!");
      setIsModalOpen(false);
      setEditingEmployee(null);
      fetchEmployees();
    } catch (err) {
      console.error("Failed to update employee:", err);
      toast.error(getErrorMessage(err, "Update failed."));
    } finally {
      setSaving(false);
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
      toast.error(getErrorMessage(err, "Delete failed."));
    }
  };

  return (
    <AppLayout
      nav={<HRNav />}
      className="employee-list-page"
      title="Employee List"
      subtitle="Search, filter, edit and delete employee records, and link them to user accounts."
      actions={
        <button className="btn btn-primary" onClick={() => navigate("/hr/create-employee")}>
          <Plus size={18} /> Add Employee
        </button>
      }
    >
      {error && <p className="error page-error" role="alert">{error}</p>}
      <EmployeeList
        employees={employees}
        onEdit={handleEdit}
        onDelete={handleDelete}
        linkableUsers={linkableUsers}
        onLink={handleLink}
        loading={loading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Edit Employee"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }}>
          <div className="form-group field">
            <label htmlFor="edit-name">Full Name</label>
            <input
              id="edit-name"
              type="text"
              value={formData.FullName}
              onChange={(e) => setFormData({ ...formData, FullName: e.target.value })}
              required
            />
          </div>
          <div className="form-group field">
            <label htmlFor="edit-position">Position</label>
            <input
              id="edit-position"
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              required
            />
          </div>
          <div className="form-group field">
            <label htmlFor="edit-department">Department</label>
            <input
              id="edit-department"
              type="text"
              value={formData.Department}
              onChange={(e) => setFormData({ ...formData, Department: e.target.value })}
              required
            />
          </div>
          <div className="form-group field">
            <label htmlFor="edit-salary">Monthly salary (₵)</label>
            <input
              id="edit-salary"
              type="number"
              min="0"
              step="0.01"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              required
            />
          </div>
          <div className="modal-actions form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving && <span className="spinner" aria-hidden="true" />} Update
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
};

export default EmployeeListPage;
