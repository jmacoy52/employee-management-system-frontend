import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { LayoutDashboard, Building2, Users, ScrollText, Inbox, UserCog } from "lucide-react";
import AppNav from "./AppNav";
import api from "../../api/client";
import { OWNER_COUNTS_EVENT } from "../../pages/owner/ownerShared";

// Platform owner console navigation (separate from every organisation's admin area).
// Organisations and Enquiries show how many are waiting (pending approval / new).
const OwnerNav = () => {
  const location = useLocation();
  const [counts, setCounts] = useState({ pending: 0, enquiries_new: 0 });

  useEffect(() => {
    let alive = true;
    const load = () =>
      api
        .get("/api/platform/overview")
        .then((res) => alive && setCounts({ pending: res.data.pending || 0, enquiries_new: res.data.enquiries_new || 0 }))
        .catch(() => {});
    load();
    window.addEventListener(OWNER_COUNTS_EVENT, load);
    return () => {
      alive = false;
      window.removeEventListener(OWNER_COUNTS_EVENT, load);
    };
  }, [location.pathname]);

  const items = [
    { to: "/owner", label: "Overview", icon: LayoutDashboard },
    { to: "/owner/organisations", label: "Organisations", icon: Building2, end: false, badge: counts.pending, badgeLabel: "waiting for approval" },
    { to: "/owner/enquiries", label: "Enquiries", icon: Inbox, badge: counts.enquiries_new, badgeLabel: "new" },
    { to: "/owner/admins", label: "Organisation admins", icon: Users },
    { to: "/owner/audit-log", label: "Audit log", icon: ScrollText },
    { to: "/owner/account", label: "My account", icon: UserCog },
  ];

  return <AppNav items={items} home="/owner" label="Owner console" className="owner-nav wide" />;
};

export default OwnerNav;
