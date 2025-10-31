import React, { useState, useEffect } from "react";
import axios from "axios";
import "../Shared/EmployeeForm.css";
import toast from "react-hot-toast";

const EmployeeForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    FullName: "",
    email: "",
    position: "",
    Department: "",
    salary: "",
  });
  const [error, setError] = useState("");



  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const payload = {
      ...formData,
      salary: Number(formData.salary),
    };

    try {
      const token = localStorage.getItem("token");
     
        await axios.post("http://localhost:5000/api/employees", payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
      onSuccess();
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.msg;
      setError(msg || "Failed to Create employee.");
    }
  };

  return (
    <form className="create-form" onSubmit={handleSubmit}>
      {error && <p className="error">{error}</p>}

      <input
        type="text"
        name="FullName"
        placeholder="Full Name"
        value={formData.FullName}
        onChange={handleChange}
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="position"
        placeholder="Position"
        value={formData.position}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="Department"
        placeholder="Department"
        value={formData.Department}
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="salary"
        placeholder="Salary"
        value={formData.salary}
        onChange={handleChange}
        required
      />
      <button type="submit">{"Create"} Employee</button>
    </form>
  );
};

export default EmployeeForm;
