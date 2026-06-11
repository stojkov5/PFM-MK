import React, { useEffect, useState } from "react";
import {
  Tabs, Table, Button, Popconfirm, Tag, Modal, Form, Input, Alert, message,
} from "antd";
import { FiExternalLink, FiLogOut, FiUserPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "../../lib/api.js";
import "./admin.css";

const STATUS_TABS = ["pending", "approved", "denied"];

const AdminApplications = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("pending");
  const [addOpen, setAddOpen] = useState(false);
  const [addForm] = Form.useForm();

  const me = useQuery({
    queryKey: ["admin-me"],
    queryFn: () => apiGet("/api/auth/me"),
    retry: false,
  });

  useEffect(() => {
    if (me.isError) navigate("/admin");
  }, [me.isError, navigate]);

  const apps = useQuery({
    queryKey: ["admin-applications", status],
    queryFn: () => apiGet(`/api/admin/applications?status=${status}`),
    enabled: me.isSuccess,
  });

  const act = useMutation({
    mutationFn: ({ id, action }) => apiPost(`/api/admin/applications/${id}/${action}`),
    onSuccess: (_, { action }) => {
      message.success(action === "approve" ? "Record updated." : "Application denied.");
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      queryClient.invalidateQueries({ queryKey: ["records"] });
    },
    onError: (err) => message.error(err.message),
  });

  const addAdmin = useMutation({
    mutationFn: (values) => apiPost("/api/admin/admins", values),
    onSuccess: () => {
      message.success("Admin created.");
      setAddOpen(false);
      addForm.resetFields();
    },
  });

  const logout = useMutation({
    mutationFn: () => apiPost("/api/auth/logout"),
    onSuccess: () => navigate("/admin"),
  });

  const columns = [
    {
      title: "Applicant",
      key: "applicant",
      render: (_, a) => (
        <span className="pfm-admin-strong">{a.lastName} {a.firstName}</span>
      ),
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
      title: "Current record",
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
        <a href={a.proofUrl} target="_blank" rel="noopener noreferrer">
          Results <FiExternalLink />
        </a>
      ),
    },
    {
      title: "Submitted",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (v) => new Date(v).toLocaleDateString(),
    },
    ...(status === "pending"
      ? [
          {
            title: "Actions",
            key: "actions",
            render: (_, a) => (
              <div className="pfm-admin-actions">
                <Popconfirm
                  title="Approve and replace the current record?"
                  onConfirm={() => act.mutate({ id: a.id, action: "approve" })}
                >
                  <Button type="primary" size="small">Approve</Button>
                </Popconfirm>
                <Popconfirm
                  title="Deny this application?"
                  onConfirm={() => act.mutate({ id: a.id, action: "deny" })}
                >
                  <Button danger size="small">Deny</Button>
                </Popconfirm>
              </div>
            ),
          },
        ]
      : []),
  ];

  if (me.isLoading) return null;

  return (
    <div className="pfm-admin pt-24">
      <div className="pfm-admin-inner max-w-6xl mx-auto px-4 md:px-6">
        <div className="pfm-admin-head">
          <h1 className="pfm-admin-title">Record applications</h1>
          <div className="pfm-admin-head-actions">
            <Button icon={<FiUserPlus />} onClick={() => setAddOpen(true)}>Add admin</Button>
            <Button icon={<FiLogOut />} onClick={() => logout.mutate()}>Log out</Button>
          </div>
        </div>

        <Tabs
          activeKey={status}
          onChange={setStatus}
          items={STATUS_TABS.map((s) => ({ key: s, label: s[0].toUpperCase() + s.slice(1) }))}
        />

        <Table
          rowKey="id"
          columns={columns}
          dataSource={apps.data ?? []}
          loading={apps.isLoading}
          pagination={{ pageSize: 10 }}
          className="pfm-admin-table"
        />

        <Modal
          title="Add admin"
          open={addOpen}
          onCancel={() => setAddOpen(false)}
          onOk={() => addForm.submit()}
          confirmLoading={addAdmin.isPending}
        >
          <Form form={addForm} layout="vertical" onFinish={(v) => addAdmin.mutate(v)}>
            <Form.Item name="username" label="Username" rules={[{ required: true, min: 3 }]}>
              <Input />
            </Form.Item>
            <Form.Item
              name="password"
              label="Password (min 10 chars)"
              rules={[{ required: true, min: 10 }]}
            >
              <Input.Password />
            </Form.Item>
            {addAdmin.isError && (
              <Alert type="error" showIcon message={addAdmin.error?.message} />
            )}
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default AdminApplications;
