// src/pages/Admin/AdminPanel.jsx
import React, { useState } from "react";
import { UserButton } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { Badge, Tabs } from "antd";
import { FiFileText, FiUsers } from "react-icons/fi";
import { useAdminApi } from "./useAdminApi.js";
import ApplicationsTab from "./ApplicationsTab.jsx";
import TeamTab from "./TeamTab.jsx";

const AdminPanel = ({ me }) => {
  const api = useAdminApi();
  const [tab, setTab] = useState("applications");

  const counts = useQuery({
    queryKey: ["admin-application-counts"],
    queryFn: () => api.get("/api/admin/applications/counts"),
  });

  const tabLabel = (icon, text, count) => (
    <span className="pfm-admin-tab-label">
      {icon} {text}
      {count > 0 && <Badge count={count} size="small" />}
    </span>
  );

  return (
    <div className="pfm-admin-inner max-w-6xl mx-auto px-4 md:px-6">
      <header className="pfm-admin-head">
        <div>
          <h1 className="pfm-admin-title">Admin panel</h1>
          <p className="pfm-admin-dim">Signed in as {me.name ?? me.email}</p>
        </div>
        <UserButton />
      </header>

      <Tabs
        activeKey={tab}
        onChange={setTab}
        items={[
          {
            key: "applications",
            label: tabLabel(<FiFileText />, "Record applications", counts.data?.pending),
            children: <ApplicationsTab counts={counts.data} />,
          },
          {
            key: "team",
            label: tabLabel(<FiUsers />, "Admins"),
            children: <TeamTab me={me} />,
          },
        ]}
      />
    </div>
  );
};

export default AdminPanel;
