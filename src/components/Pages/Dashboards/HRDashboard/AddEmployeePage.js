import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import EmployeeForm from "../../Shared/EmployeeForm";
import HRNav from "../../Shared/HRNav";
import toast from "react-hot-toast";

const AddEmployeePage = () => {
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(true);

  const handleEmployeeCreated = () => {
    toast.success("Employee added successfully!");
    navigate("/hr/employees");
  };

  return (
    <div className="add-employee-page">
      <HRNav />
      <h2>Add Employee</h2>
      {showCreateForm && (
        <div className="form-wrapper">
          <EmployeeForm onSuccess={handleEmployeeCreated} />
        </div>
      )}
    </div>
  );
};

export default AddEmployeePage;
