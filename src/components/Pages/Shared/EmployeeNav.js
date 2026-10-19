import React from "react";
import { useNavigate } from "react-router-dom";
import { UserCircle, LogOut } from "lucide-react";
import "./HRNav.css";

const EmployeeNav = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <nav className="hr-nav">
      <div className="nav-center">
        <ul className="nav-menu">
          <li onClick={() => navigate("/EmployeeDashboard")}><UserCircle size={18} /> My Dashboard</li>
        </ul>
      </div>
      <div className="nav-right">
        {user?.email && <span className="nav-user">{user.email}</span>}
        <button className="logout-btn" onClick={logout}><LogOut size={18} /> Logout</button>
      </div>
    </nav>
  );
};

export default EmployeeNav;
