// src/pages/Admin/AdminPanel.jsx
import React, { Suspense, lazy, useState } from "react";
import { UserButton } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { Badge, Select, Spin, Tabs } from "antd";
import { FiAward, FiCalendar, FiEdit3, FiFileText, FiFlag, FiUsers } from "react-icons/fi";
import { useAdminApi } from "./useAdminApi.js";
import ApplicationsTab from "./ApplicationsTab.jsx";
import ClubsTab from "./ClubsTab.jsx";
import CompetitionsTab from "./CompetitionsTab.jsx";
import CriteriaTab from "./CriteriaTab.jsx";
import NewsTab from "./NewsTab.jsx";
import TeamTab from "./TeamTab.jsx";
import { useIsPhone } from "./useIsPhone.js";

// The article editor is big, so it's only downloaded when an article is opened.
const ArticleEditor = lazy(() => import("./news/ArticleEditor.jsx"));

const AdminPanel = ({ me }) => {
  const api = useAdminApi();
  const isPhone = useIsPhone();
  const [tab, setTab] = useState("applications");
  // undefined = the tabs; { id } = the article editor (id null = new article).
  const [editing, setEditing] = useState();

  const counts = useQuery({
    queryKey: ["admin-application-counts"],
    queryFn: () => api.get("/api/admin/applications/counts"),
  });
  const competitionCounts = useQuery({
    queryKey: ["admin-competition-counts", "swimming"],
    queryFn: () => api.get("/api/admin/competitions/counts?sport=swimming"),
  });
  const waterpoloCounts = useQuery({
    queryKey: ["admin-competition-counts", "waterpolo"],
    queryFn: () => api.get("/api/admin/competitions/counts?sport=waterpolo"),
  });
  const clubCounts = useQuery({
    queryKey: ["admin-club-counts"],
    queryFn: () => api.get("/api/admin/clubs/counts"),
  });

  const tabLabel = (icon, text, count) => (
    <span className="pfm-admin-tab-label">
      {icon} {text}
      {count > 0 && <Badge count={count} size="small" />}
    </span>
  );

  const sections = [
    {
      key: "applications",
      label: tabLabel(<FiFileText />, "Record applications", counts.data?.pending),
      children: <ApplicationsTab counts={counts.data} />,
    },
    {
      key: "calendar",
      label: tabLabel(<FiCalendar />, "Swimming calendar", competitionCounts.data?.pending),
      children: <CompetitionsTab sport="swimming" counts={competitionCounts.data} />,
    },
    {
      key: "waterpolo-calendar",
      label: tabLabel(<FiCalendar />, "Water polo calendar", waterpoloCounts.data?.pending),
      children: <CompetitionsTab sport="waterpolo" counts={waterpoloCounts.data} />,
    },
    {
      key: "clubs",
      label: tabLabel(<FiFlag />, "Clubs", clubCounts.data?.pending),
      children: <ClubsTab counts={clubCounts.data} />,
    },
    {
      key: "criteria",
      label: tabLabel(<FiAward />, "Criteria"),
      children: <CriteriaTab />,
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
  ];

  // Phones: the sections don't fit in a tab bar, so pick them from a dropdown.
  const sectionPicker = (props) => (
    <Select
      className="pfm-admin-section-select"
      value={props.activeKey}
      onChange={setTab}
      aria-label="Admin section"
      options={sections.map((s) => ({ value: s.key, label: s.label }))}
    />
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
        items={sections}
        renderTabBar={isPhone ? sectionPicker : undefined}
      />
    </div>
  );
};

export default AdminPanel;
