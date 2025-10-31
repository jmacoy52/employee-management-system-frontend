import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast"; 
import "./Register.css"; // Reuse same styles

const CreateUserForm = ({ onSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const token = localStorage.getItem("token"); 
      const response = await axios.post(
        "http://localhost:5000/api/users/register",formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.status === 201) {
        toast.success("User account created!");
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }
    } catch (err) {
      setError(err.response?.data?.error || "User creation failed.");
    }
  };

  return (
    <div className="auth-container">
      <h2>Create User</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
        <input type="text" name="role" placeholder="hr or admin?" value={formData.role} onChange={handleChange} required />

        {error && <p className="error">{error}</p>}

        <button type="submit" className="btn-register">Create</button>
        <button type="button" className="btn-register" onClick={onClose} style={{ background: "gray" }}>Cancel</button>
      </form>
    </div>
  );
};

export default CreateUserForm;
