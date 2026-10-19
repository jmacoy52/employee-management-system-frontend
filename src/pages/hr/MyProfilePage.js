import React from "react";
import HRNav from "../../components/layout/HRNav";
import AppLayout from "../../components/layout/AppLayout";
import ProfilePanel from "../../components/common/ProfilePanel";

const MyProfilePage = () => (
  <AppLayout nav={<HRNav />} title="My Profile" subtitle="Your own account details." width="narrow">
    <ProfilePanel title="Profile details" />
  </AppLayout>
);

export default MyProfilePage;
