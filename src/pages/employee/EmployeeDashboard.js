import React from "react";
import EmployeeNav from "../../components/layout/EmployeeNav";
import AppLayout from "../../components/layout/AppLayout";
import ProfilePanel from "../../components/common/ProfilePanel";
import EmploymentRecord from "../../components/common/EmploymentRecord";
import { getStoredUser } from "../../auth/session";

const EmployeeDashboard = () => {
  const user = getStoredUser();
  const firstName = (user?.username || "").split(" ")[0];
  return (
    <AppLayout
      nav={<EmployeeNav />}
      title={firstName ? `Welcome, ${firstName}` : "My Dashboard"}
      subtitle="Your profile and the employment record HR keeps for you."
    >
      <div className="two-col">
        <ProfilePanel title="My Employee Profile" />
        <EmploymentRecord />
      </div>
    </AppLayout>
  );
};

export default EmployeeDashboard;
