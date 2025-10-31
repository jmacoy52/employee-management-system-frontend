import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";
import { Users, Settings, ScrollText, UserCheck, Plus, LogOut } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "",
  });

  const handleChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      await axios.post("http://localhost:5000/api/users/register", newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("User account created!");
      setShowCreateModal(false);
      setNewUser({ username: "", email: "", password: "", role: "" });
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create user");
    }
  };

  return (
    <div className="admin-dashboard">

      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <h2 className="sidebar-title">Admin Panel</h2>
        <ul className="sidebar-menu">
          <li onClick={() => navigate("/admin/users")}> <Users size={20} /> View Users </li>
          <li onClick={() => navigate("/admin/usermanagement")}> <Settings size={20} /> User Management </li>
          <li onClick={() => navigate("/admin/auditlog")}> <ScrollText size={20} /> Audit Log </li>
          <li onClick={() => navigate("/admin/hr")}> <UserCheck size={20} /> HR Dashboard </li>
        </ul>
        <button className="logout-btn" onClick={() => { localStorage.clear(); navigate("/"); }}>
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main">
        <h1 className="admin-title">Admin Dashboard</h1>

        <div className="admin-cards-container">
          <div className="admin-card" onClick={() => navigate("/admin/users")}>
            <Users size={30} className="card-icon" />
            <h2>View All Users</h2>
            <p>Browse and manage all registered users.</p>
          </div>

          <div className="admin-card" onClick={() => navigate("/admin/usermanagement")}>
            <Settings size={30} className="card-icon" />
            <h2>User Management</h2>
            <p>Create, edit, and remove user accounts.</p>
          </div>

          <div className="admin-card" onClick={() => navigate("/admin/auditlog")}>
            <ScrollText size={30} className="card-icon" />
            <h2>Audit Log</h2>
            <p>Review admin activity and changes made in the system.</p>
          </div>

          <div className="admin-card" onClick={() => navigate("/admin/hr")}>
            <UserCheck size={30} className="card-icon" />
            <h2>HR Dashboard</h2>
            <p>Access HR functionalities and manage employee data.</p>
          </div>
        </div>
      </main>

      {/* FLOATING BUTTON */}
      <button className="floating-add-btn" onClick={() => setShowCreateModal(true)}>
        <Plus size={22} />
      </button>

      {/* CREATE USER MODAL */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Create New User</h2>
            <form onSubmit={handleCreateUser} className="create-user-form">
              <input type="text" name="username" placeholder="Username" value={newUser.username} onChange={handleChange} required />
              <input type="email" name="email" placeholder="Email" value={newUser.email} onChange={handleChange} required />
              <input type="password" name="password" placeholder="Password" value={newUser.password} onChange={handleChange} required />
              <input type="text" name="role" placeholder="admin or hr?" value={newUser.role} onChange={handleChange} required />

              <div className="modal-actions">
                <button type="submit" className="btn-primary">Create</button>
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
