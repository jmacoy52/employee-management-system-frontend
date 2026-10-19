import React from "react";
import EmployeeNav from "../../components/layout/EmployeeNav";
import ProfilePanel from "../../components/common/ProfilePanel";

const EmployeeDashboard = () => (
  <>
    <EmployeeNav />
    <ProfilePanel title="My Employee Profile" />
  </>
);

export default EmployeeDashboard;
