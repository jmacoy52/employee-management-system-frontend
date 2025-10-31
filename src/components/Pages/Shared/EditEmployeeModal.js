import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "./Modal";
import "../Shared/EmployeeForm.css"; // reuse same styling
import toast from "react-hot-toast";

const EditEmployeeModal = ({ open, onClose, employee, onUpdated }) => {
  const [form, setForm] = useState({
    FullName: "",
    email: "",
    position: "",
    Department: "",
    salary: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (employee) {
      setForm({
        FullName: employee.FullName ?? "",
        email: employee.email ?? "",
        position: employee.position ?? "",
        Department: employee.Department ?? "",
        salary: employee.salary ?? "",
      });
    }
  }, [employee]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/employees/${employee.id}`,
        { ...form, salary: Number(form.salary) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

        toast.success("Employee updated successfully!");

      onUpdated();  // refresh list
      onClose();    // close modal
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.msg || "Update failed.";
      toast.error(msg);
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose} title="Edit Employee Info">
      <form className="create-form" onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}

        <input
          type="text"
          name="FullName"
          placeholder="Full Name"
          value={form.FullName}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="position"
          placeholder="Position"
          value={form.position}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="Department"
          placeholder="Department"
          value={form.Department}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="salary"
          placeholder="Salary"
          value={form.salary}
          onChange={handleChange}
          required
        />

        <button type="submit">Update Employee</button>
      </form>
    </Modal>
  );
};

export default EditEmployeeModal;
