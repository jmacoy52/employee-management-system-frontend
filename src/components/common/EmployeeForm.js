import React, { useState } from "react";
import api, { getErrorMessage } from "../../api/client";
import "./EmployeeForm.css";

const EmployeeForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    FullName: "",
    email: "",
    position: "",
    Department: "",
    salary: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);



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

    setSaving(true);
    try {
     
        await api.post("/api/employees", payload)
      onSuccess();
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.msg;
      setError(msg || getErrorMessage(err, "Failed to Create employee."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="create-form" onSubmit={handleSubmit}>
      {error && <p className="error" role="alert">{error}</p>}

      <div className="form-grid">
        <div className="field span-2">
          <label htmlFor="emp-name">Full name</label>
          <input
            id="emp-name"
            type="text"
            name="FullName"
            placeholder="e.g. Ama Owusu"
            value={formData.FullName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="field span-2">
          <label htmlFor="emp-email">Email</label>
          <input
            id="emp-email"
            type="email"
            name="email"
            placeholder="name@company.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="emp-position">Position</label>
          <input
            id="emp-position"
            type="text"
            name="position"
            placeholder="e.g. Accountant"
            value={formData.position}
            onChange={handleChange}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="emp-department">Department</label>
          <input
            id="emp-department"
            type="text"
            name="Department"
            placeholder="e.g. Finance"
            value={formData.Department}
            onChange={handleChange}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="emp-salary">Monthly salary (₵)</label>
          <input
            id="emp-salary"
            type="number"
            name="salary"
            min="0"
            step="0.01"
            placeholder="e.g. 6500"
            value={formData.salary}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        )}
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving && <span className="spinner" aria-hidden="true" />}
          {"Create"} Employee
        </button>
      </div>
    </form>
  );
};

export default EmployeeForm;
