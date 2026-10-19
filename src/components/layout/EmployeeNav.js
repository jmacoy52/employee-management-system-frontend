import React from "react";
import { useNavigate } from "react-router-dom";
import { logout as signOut, getStoredUser } from "../../auth/session";
import { UserCircle, LogOut, KeyRound } from "lucide-react";
import "./HRNav.css";

const EmployeeNav = () => {
  const navigate = useNavigate();
  const user = getStoredUser();

  const logout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="hr-nav">
      <div className="nav-center">
        <ul className="nav-menu">
          <li onClick={() => navigate("/employee")}><UserCircle size={18} /> My Dashboard</li>
          <li onClick={() => navigate("/account/password")}><KeyRound size={18} /> Change Password</li>
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
