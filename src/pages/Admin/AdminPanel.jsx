// src/pages/Admin/AdminPanel.jsx
import React, { Suspense, lazy, useState } from "react";
import { UserButton } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { Badge, Spin, Tabs } from "antd";
import { FiEdit3, FiFileText, FiUsers } from "react-icons/fi";
import { useAdminApi } from "./useAdminApi.js";
import ApplicationsTab from "./ApplicationsTab.jsx";
import NewsTab from "./NewsTab.jsx";
import TeamTab from "./TeamTab.jsx";

// The article editor is big, so it's only downloaded when an article is opened.
const ArticleEditor = lazy(() => import("./news/ArticleEditor.jsx"));

const AdminPanel = ({ me }) => {
  const api = useAdminApi();
  const [tab, setTab] = useState("applications");
  // undefined = the tabs; { id } = the article editor (id null = new article).
  const [editing, setEditing] = useState();

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

  if (editing) {
    return (
      <Suspense
        fallback={
          <div className="pfm-admin-center">
            <Spin size="large" />
          </div>
        }
      >
        <ArticleEditor
          key={editing.id ?? "new"}
          articleId={editing.id}
          onClose={() => setEditing(undefined)}
        />
      </Suspense>
    );
  }

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
            key: "news",
            label: tabLabel(<FiEdit3 />, "News"),
            children: <NewsTab onEdit={(id) => setEditing({ id })} />,
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
