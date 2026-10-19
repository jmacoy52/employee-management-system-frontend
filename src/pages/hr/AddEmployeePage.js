import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import EmployeeForm from "../../components/common/EmployeeForm";
import HRNav from "../../components/layout/HRNav";
import toast from "react-hot-toast";

const AddEmployeePage = () => {
  const navigate = useNavigate();
  const [showCreateForm] = useState(true);

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
