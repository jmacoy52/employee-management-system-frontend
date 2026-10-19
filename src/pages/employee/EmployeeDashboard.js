import React from "react";
import EmployeeNav from "../../components/layout/EmployeeNav";
import ProfilePanel from "../../components/common/ProfilePanel";
import EmploymentRecord from "../../components/common/EmploymentRecord";

const EmployeeDashboard = () => (
  <>
    <EmployeeNav />
    <ProfilePanel title="My Employee Profile" />
    <EmploymentRecord />
  </>
);

export default EmployeeDashboard;
