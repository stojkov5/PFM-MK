// src/pages/Admin/ApplicationsTab.jsx
import React, { useState } from "react";
import { App as AntApp, Button, Popconfirm, Tag } from "antd";
import { FiExternalLink } from "react-icons/fi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAdminApi } from "./useAdminApi.js";
import AdminTable from "./AdminTable.jsx";
import StatusSwitch from "./StatusSwitch.jsx";

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
      primary: true,
      render: (a) => (
        <div>
          <div className="pfm-admin-strong">
            {a.lastName} {a.firstName}
          </div>
          <div className="pfm-admin-dim">Submitted {formatDate(a.createdAt)}</div>
        </div>
      ),
    },
    {
      title: "Target record",
      key: "target",
      render: (a) => (
        <div>
          <div className="pfm-admin-strong">{a.discipline}</div>
          <div className="pfm-admin-dim">
            {a.pool}m · {a.gender === "female" ? "Women" : "Men"} · {a.category}
          </div>
        </div>
      ),
    },
    {
      title: status === "pending" ? "Claimed / current" : "Claimed / record now",
      key: "time",
      width: 190,
      render: (a) => (
        <div className="pfm-admin-times">
          <Tag color="green">{a.time}</Tag>
          {a.currentRecord ? (
            <div className="pfm-admin-dim">
              now <span className="pfm-admin-time-now">{a.currentRecord.time}</span> · {a.currentRecord.athlete}
            </div>
          ) : (
            <div className="pfm-admin-dim">no record yet</div>
          )}
        </div>
      ),
    },
    {
      title: "Competition",
      key: "competition",
      render: (a) => (
        <div>
          {a.competition && <div className="pfm-admin-strong">{a.competition}</div>}
          {a.location && <div className="pfm-admin-dim">{a.location}</div>}
          <a href={a.proofUrl} target="_blank" rel="noopener noreferrer" className="pfm-admin-link">
            Results <FiExternalLink />
          </a>
        </div>
      ),
    },
    status === "pending"
      ? {
          title: "Actions",
          key: "actions",
          actions: true,
          width: 130,
          render: (a) => (
            <div className="pfm-admin-actions">
              <Popconfirm
                title="Approve and replace the current record?"
                okText="Approve"
                placement="topRight"
                onConfirm={() => act.mutateAsync({ id: a.id, action: "approve" }).catch(() => {})}
              >
                <Button type="primary" size="small">Approve</Button>
              </Popconfirm>
              <Popconfirm
                title="Deny this application?"
                okText="Deny"
                okButtonProps={{ danger: true }}
                placement="topRight"
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
          width: 150,
          render: (a) => (
            <div>
              <div>{formatDate(a.reviewedAt)}</div>
              <div className="pfm-admin-dim">{a.reviewerName ?? "—"}</div>
            </div>
          ),
        },
  ];

  return (
    <div className="pfm-admin-section">
      <div className="pfm-admin-toolbar">
        <StatusSwitch
          value={status}
          onChange={setStatus}
          label="Status"
          options={STATUSES.map((s) => ({
            value: s.value,
            label: counts ? `${s.label} (${counts[s.value]})` : s.label,
          }))}
        />
      </div>
      <AdminTable
        columns={columns}
        dataSource={apps.data ?? []}
        loading={apps.isLoading}
        pageSize={10}
        emptyText={status === "pending" ? "No applications waiting for review" : `No ${status} applications`}
      />
    </div>
  );
};

export default ApplicationsTab;
