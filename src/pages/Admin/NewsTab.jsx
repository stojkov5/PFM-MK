// src/pages/Admin/NewsTab.jsx
import React, { useState } from "react";
import { App as AntApp, Button, Popconfirm, Select, Tag } from "antd";
import { FiExternalLink, FiPlus } from "react-icons/fi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { apiUrl } from "../../lib/api.js";
import { NEWS_CATEGORIES, categoryLabelKey } from "../../lib/news.js";
import { useAdminApi } from "./useAdminApi.js";
import AdminTable from "./AdminTable.jsx";
import StatusSwitch from "./StatusSwitch.jsx";
import { articleStatus } from "./news/articleStatus.js";
import "./news/editor.css";

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
];

const formatDate = (v) =>
  v
    ? new Date(v).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
    : "—";

/** @param onEdit  called with an article id, or null to start a new article */
const NewsTab = ({ onEdit }) => {
  const api = useAdminApi();
  const { message } = AntApp.useApp();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");

  const articles = useQuery({
    queryKey: ["admin-news"],
    queryFn: () => api.get("/api/admin/news"),
  });

  const remove = useMutation({
    mutationFn: (id) => api.del(`/api/admin/news/${id}`),
    onSuccess: () => {
      message.success("Article deleted.");
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
      queryClient.invalidateQueries({ queryKey: ["news"] });
    },
    onError: (err) => message.error(err.message),
  });

  const all = articles.data ?? [];
  const shown = all.filter(
    (a) =>
      (status === "all" || a.status === status) && (category === "all" || a.category === category)
  );
  const count = (value) =>
    value === "all" ? all.length : all.filter((a) => a.status === value).length;

  const columns = [
    {
      title: "Title",
      key: "title",
      primary: true,
      render: (a) => (
        <div className="pfm-news-list-title">
          {a.coverImage ? (
            <img className="pfm-news-list-thumb" src={apiUrl(a.coverImage)} alt="" />
          ) : (
            <span className="pfm-news-list-thumb" />
          )}
          <button type="button" className="pfm-admin-strong" onClick={() => onEdit(a.id)}>
            {a.title}
          </button>
        </div>
      ),
    },
    {
      title: "Category / status",
      key: "category",
      width: 170,
      render: (a) => {
        const s = articleStatus(a);
        return (
          <div className="pfm-admin-tags">
            <Tag color="blue">{t(categoryLabelKey(a.category))}</Tag>
            <Tag color={s.color}>{s.label}</Tag>
          </div>
        );
      },
    },
    {
      title: "Publish date",
      key: "publishedAt",
      width: 160,
      render: (a) => formatDate(a.publishedAt),
    },
    {
      title: "Last edited",
      key: "updatedAt",
      width: 170,
      render: (a) => (
        <div>
          <div>{formatDate(a.updatedAt)}</div>
          <div className="pfm-admin-dim">{a.authorName ?? "—"}</div>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      actions: true,
      width: 120,
      render: (a) => (
        <div className="pfm-admin-actions">
          <Button size="small" type="primary" onClick={() => onEdit(a.id)}>
            Edit
          </Button>
          {articleStatus(a).key === "live" && (
            <Button
              size="small"
              href={`/news/${a.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              icon={<FiExternalLink />}
            >
              View
            </Button>
          )}
          <Popconfirm
            title="Delete this article?"
            description="This can't be undone."
            okText="Delete"
            okButtonProps={{ danger: true }}
            placement="topRight"
            onConfirm={() => remove.mutateAsync(a.id).catch(() => {})}
          >
            <Button danger size="small">
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="pfm-admin-section">
      <div className="pfm-admin-toolbar pfm-news-list-bar">
        <StatusSwitch
          value={status}
          onChange={setStatus}
          label="Status"
          options={STATUS_FILTERS.map((s) => ({
            value: s.value,
            label: `${s.label} (${count(s.value)})`,
          }))}
        />
        <Select
          value={category}
          onChange={setCategory}
          className="pfm-news-list-category"
          aria-label="Category"
          options={[
            { value: "all", label: "All categories" },
            ...NEWS_CATEGORIES.map((c) => ({ value: c, label: t(categoryLabelKey(c)) })),
          ]}
        />
        <Button type="primary" icon={<FiPlus />} onClick={() => onEdit(null)}>
          New article
        </Button>
      </div>

      <AdminTable
        columns={columns}
        dataSource={shown}
        loading={articles.isLoading}
        pageSize={10}
        emptyText={all.length ? "No articles match these filters" : "No articles yet"}
      />
    </div>
  );
};

export default NewsTab;
