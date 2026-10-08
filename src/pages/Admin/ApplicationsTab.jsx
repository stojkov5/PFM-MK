// src/pages/Admin/ApplicationsTab.jsx
import React, { useState } from "react";
import { App as AntApp, Button, Empty, Popconfirm, Segmented, Table, Tag } from "antd";
import { FiExternalLink } from "react-icons/fi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAdminApi } from "./useAdminApi.js";

const STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "denied", label: "Denied" },
];

const formatDate = (v) => (v ? new Date(v).toLocaleDateString() : "—");

const ApplicationsTab = ({ counts }) => {
  const api = useAdminApi();
  const { message } = AntApp.useApp();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("pending");

  const apps = useQuery({
    queryKey: ["admin-applications", status],
    queryFn: () => api.get(`/api/admin/applications?status=${status}`),
  });

  const act = useMutation({
    mutationFn: ({ id, action }) => api.post(`/api/admin/applications/${id}/${action}`),
    onSuccess: (_, { action }) => {
      message.success(action === "approve" ? "Approved — record updated." : "Application denied.");
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      queryClient.invalidateQueries({ queryKey: ["admin-application-counts"] });
      queryClient.invalidateQueries({ queryKey: ["records"] });
    },
    onError: (err) => message.error(err.message),
  });

  const columns = [
    {
      title: "Applicant",
      key: "applicant",
      render: (_, a) => <span className="pfm-admin-strong">{a.lastName} {a.firstName}</span>,
    },
    {
      title: "Target record",
      key: "target",
      render: (_, a) => (
        <div>
          <div className="pfm-admin-strong">{a.discipline}</div>
          <div className="pfm-admin-dim">
            {a.pool}m · {a.gender === "female" ? "Women" : "Men"} · {a.category}
          </div>
        </div>
      ),
    },
    {
      title: "Claimed time",
      dataIndex: "time",
      key: "time",
      render: (v) => <Tag color="green">{v}</Tag>,
    },
    {
      title: status === "pending" ? "Current record" : "Record now",
      key: "current",
      render: (_, a) =>
        a.currentRecord ? (
          <div>
            <Tag>{a.currentRecord.time}</Tag>
            <div className="pfm-admin-dim">{a.currentRecord.athlete}</div>
          </div>
        ) : (
          <Tag color="gold">none</Tag>
        ),
    },
    {
      title: "Proof",
      key: "proof",
      render: (_, a) => (
        <a href={a.proofUrl} target="_blank" rel="noopener noreferrer" className="pfm-admin-link">
          Results <FiExternalLink />
        </a>
      ),
    },
    {
      title: "Submitted",
      dataIndex: "createdAt",
      key: "createdAt",
      render: formatDate,
    },
    status === "pending"
      ? {
          title: "Actions",
          key: "actions",
          render: (_, a) => (
            <div className="pfm-admin-actions">
              <Popconfirm
                title="Approve and replace the current record?"
                okText="Approve"
                onConfirm={() => act.mutateAsync({ id: a.id, action: "approve" }).catch(() => {})}
              >
                <Button type="primary" size="small">Approve</Button>
              </Popconfirm>
              <Popconfirm
                title="Deny this application?"
                okText="Deny"
                okButtonProps={{ danger: true }}
                onConfirm={() => act.mutateAsync({ id: a.id, action: "deny" }).catch(() => {})}
              >
                <Button danger size="small">Deny</Button>
              </Popconfirm>
            </div>
          ),
        }
      : {
          title: "Reviewed",
          key: "reviewed",
          render: (_, a) => (
            <div>
              <div>{formatDate(a.reviewedAt)}</div>
              <div className="pfm-admin-dim">{a.reviewerName ?? "—"}</div>
            </div>
          ),
        },
  ];

  return (
    <div className="pfm-admin-section">
      <Segmented
        value={status}
        onChange={setStatus}
        options={STATUSES.map((s) => ({
          value: s.value,
          label: counts ? `${s.label} (${counts[s.value]})` : s.label,
        }))}
      />
      <Table
        rowKey="id"
        columns={columns}
        dataSource={apps.data ?? []}
        loading={apps.isLoading}
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
        scroll={{ x: "max-content" }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={status === "pending" ? "No applications waiting for review" : `No ${status} applications`}
            />
          ),
        }}
        className="pfm-admin-table"
      />
    </div>
  );
};

export default ApplicationsTab;
