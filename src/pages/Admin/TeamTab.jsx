// src/pages/Admin/TeamTab.jsx
import React from "react";
import { App as AntApp, Avatar, Button, Form, Input, List, Popconfirm, Tag } from "antd";
import { FiMail, FiUserPlus } from "react-icons/fi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAdminApi } from "./useAdminApi.js";

const formatDate = (v) => (v ? new Date(v).toLocaleDateString() : "never");

const TeamTab = ({ me }) => {
  const api = useAdminApi();
  const { message } = AntApp.useApp();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  const team = useQuery({
    queryKey: ["admin-team"],
    queryFn: () => api.get("/api/admin/team"),
  });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-team"] });

  const add = useMutation({
    mutationFn: ({ email }) => api.post("/api/admin/team", { email }),
    onSuccess: (res, { email }) => {
      message.success(
        res.status === "invited"
          ? `Invitation sent to ${email}.`
          : `${email} already had an account and is now an admin.`
      );
      form.resetFields();
      refresh();
    },
    onError: (err) => message.error(err.message),
  });

  const removeAdmin = useMutation({
    mutationFn: (id) => api.del(`/api/admin/team/admins/${id}`),
    onSuccess: () => {
      message.success("Admin access removed.");
      refresh();
    },
    onError: (err) => message.error(err.message),
  });

  const revokeInvite = useMutation({
    mutationFn: (id) => api.del(`/api/admin/team/invitations/${id}`),
    onSuccess: () => {
      message.success("Invitation revoked.");
      refresh();
    },
    onError: (err) => message.error(err.message),
  });

  return (
    <div className="pfm-admin-section">
      <div className="pfm-admin-card">
        <h2 className="pfm-admin-subtitle">Add an admin</h2>
        <p className="pfm-admin-dim">
          They'll get an email invitation to create their account. If they already have one,
          they get admin access right away.
        </p>
        <Form
          form={form}
          layout="inline"
          className="pfm-admin-invite"
          onFinish={(v) => add.mutate(v)}
          requiredMark={false}
        >
          <Form.Item
            name="email"
            rules={[{ required: true, type: "email", message: "Enter a valid email" }]}
          >
            <Input prefix={<FiMail />} placeholder="name@example.com" autoComplete="off" />
          </Form.Item>
          <Button type="primary" htmlType="submit" icon={<FiUserPlus />} loading={add.isPending}>
            Add admin
          </Button>
        </Form>
      </div>

      <div className="pfm-admin-card">
        <h2 className="pfm-admin-subtitle">Admins</h2>
        <List
          loading={team.isLoading}
          dataSource={team.data?.admins ?? []}
          renderItem={(a) => (
            <List.Item
              actions={
                a.id === me.id
                  ? [<Tag key="you" color="blue">You</Tag>]
                  : [
                      <Popconfirm
                        key="remove"
                        title={`Remove admin access for ${a.email}?`}
                        okText="Remove"
                        okButtonProps={{ danger: true }}
                        onConfirm={() => removeAdmin.mutateAsync(a.id).catch(() => {})}
                      >
                        <Button danger size="small">Remove</Button>
                      </Popconfirm>,
                    ]
              }
            >
              <List.Item.Meta
                avatar={<Avatar src={a.imageUrl}>{(a.name ?? a.email ?? "?")[0]}</Avatar>}
                title={<span className="pfm-admin-strong">{a.name ?? a.email}</span>}
                description={
                  <span className="pfm-admin-dim">
                    {a.name && `${a.email} · `}last sign-in {formatDate(a.lastSignInAt)}
                  </span>
                }
              />
            </List.Item>
          )}
        />
      </div>

      {team.data?.invitations?.length > 0 && (
        <div className="pfm-admin-card">
          <h2 className="pfm-admin-subtitle">Pending invitations</h2>
          <List
            dataSource={team.data.invitations}
            renderItem={(i) => (
              <List.Item
                actions={[
                  <Popconfirm
                    key="revoke"
                    title={`Revoke the invitation for ${i.email}?`}
                    okText="Revoke"
                    okButtonProps={{ danger: true }}
                    onConfirm={() => revokeInvite.mutateAsync(i.id).catch(() => {})}
                  >
                    <Button size="small">Revoke</Button>
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar icon={<FiMail />} />}
                  title={<span className="pfm-admin-strong">{i.email}</span>}
                  description={<span className="pfm-admin-dim">Sent {formatDate(i.createdAt)}</span>}
                />
              </List.Item>
            )}
          />
        </div>
      )}
    </div>
  );
};

export default TeamTab;
