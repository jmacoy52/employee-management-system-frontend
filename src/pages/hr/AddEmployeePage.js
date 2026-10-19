import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import EmployeeForm from "../../components/common/EmployeeForm";
import HRNav from "../../components/layout/HRNav";
import AppLayout from "../../components/layout/AppLayout";
import toast from "react-hot-toast";
import "./HRDashboard.css";

const AddEmployeePage = () => {
  const navigate = useNavigate();
  const [showCreateForm] = useState(true);

  const handleEmployeeCreated = () => {
    toast.success("Employee added successfully!");
    navigate("/hr/employees");
  };

  return (
    <AppLayout
      nav={<HRNav />}
      className="add-employee-page"
      title="Add Employee"
      subtitle="Create an employee record. You can link it to a user account from the Employee List."
      width="narrow"
    >
      {showCreateForm && (
        <div className="card form-wrapper">
          <EmployeeForm onSuccess={handleEmployeeCreated} onCancel={() => navigate("/hr/employees")} />
        </div>
      )}
    </AppLayout>
  );
};

export default AddEmployeePage;
