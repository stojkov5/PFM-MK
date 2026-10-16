// src/pages/Admin/ClubsTab.jsx
// Clubs in the admin panel: clubs that signed up wait here for review
// (approve → shown on the Clubs page and can register competitions; reject →
// the club and its sign-up account are deleted), and any club's details can
// be edited.
import React, { useState } from "react";
import { App as AntApp, Button, Empty, Form, Input, Modal, Segmented, Select, Table, Tag } from "antd";
import dayjs from "dayjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAdminApi } from "./useAdminApi.js";
import { CLUB_TYPES } from "../../lib/clubs.js";

const STATUSES = [
  { value: "pending", label: "Waiting for approval" },
  { value: "approved", label: "Approved" },
];

const fmtDateTime = (v) => (v ? dayjs(v).format("DD.MM.YYYY HH:mm") : "—");

const invalidateAll = (queryClient) => {
  for (const key of ["admin-clubs", "admin-club-counts", "clubs", "admin-competitions"]) {
    queryClient.invalidateQueries({ queryKey: [key] });
  }
};

// --- Approve / reject dialog -------------------------------------------------

const REVIEW = {
  approve: {
    title: "Approve club",
    ok: "Approve",
    help: "The club appears on the public Clubs page, its account can register competitions, and the club gets an email. You can add a note to the email (optional, in Macedonian).",
  },
  reject: {
    title: "Reject club",
    ok: "Reject and delete",
    help: "The club gets an email that it wasn't approved, then the club and the account that signed it up are DELETED. This can't be undone. Add the reason (optional, in Macedonian).",
  },
};

const ReviewModal = ({ review, onClose }) => {
  const api = useAdminApi();
  const { message } = AntApp.useApp();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const cfg = REVIEW[review.action];
  const { club } = review;

  const act = useMutation({
    mutationFn: () => api.post(`/api/admin/clubs/${club.id}/${review.action}`, { message: text }),
    onSuccess: (res) => {
      if (res.emailed) message.success("Done — the club was emailed.");
      else message.warning("Done, but the email to the club couldn't be sent. Contact them directly.");
      invalidateAll(queryClient);
      onClose();
    },
    onError: (err) => message.error(err.message),
  });

  const emails = [...new Set([club.email, ...club.accounts.map((a) => a.email)].filter(Boolean))];
  return (
    <Modal
      open
      title={`${cfg.title}: ${club.name}`}
      okText={cfg.ok}
      okButtonProps={{ danger: review.action === "reject" }}
      confirmLoading={act.isPending}
      onOk={() => act.mutate()}
      onCancel={onClose}
    >
      <p className="pfm-admin-dim" style={{ marginBottom: 10 }}>
        {cfg.help}
      </p>
      <p className="pfm-admin-dim" style={{ marginBottom: 10 }}>
        Email goes to: {emails.join(", ") || "— (no email on file)"}
      </p>
      <Input.TextArea
        rows={4}
        value={text}
        maxLength={3000}
        onChange={(e) => setText(e.target.value)}
        placeholder={review.action === "reject" ? "Optional reason" : "Optional note"}
      />
    </Modal>
  );
};

// --- Edit dialog -------------------------------------------------------------

const EditModal = ({ club, onClose }) => {
  const api = useAdminApi();
  const { message } = AntApp.useApp();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const required = { required: true, message: "Required" };

  const save = useMutation({
    mutationFn: (values) => api.put(`/api/admin/clubs/${club.id}`, values),
    onSuccess: () => {
      message.success("Club saved.");
      invalidateAll(queryClient);
      onClose();
    },
    onError: (err) => {
      if (err.body?.errors) {
        form.setFields(
          err.body.errors.map((name) => ({
            name,
            errors: [err.status === 409 ? err.message : "Check this field"],
          }))
        );
      } else {
        message.error(err.message);
      }
    },
  });

  return (
    <Modal
      open
      title={`Edit club: ${club.name}`}
      okText="Save"
      confirmLoading={save.isPending}
      onOk={() => form.submit()}
      onCancel={onClose}
      width={640}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={club}
        onFinish={(v) => save.mutate(v)}
      >
        <Form.Item name="name" label="Name" rules={[required]}>
          <Input />
        </Form.Item>
        <div className="pfm-admin-form-grid">
          <Form.Item name="type" label="Type">
            <Select options={CLUB_TYPES.map((v) => ({ value: v, label: v }))} />
          </Form.Item>
          <Form.Item name="city" label="City">
            <Input />
          </Form.Item>
          <Form.Item name="president" label="President">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Phone">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ type: "email", message: "Invalid email" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Address">
            <Input />
          </Form.Item>
        </div>
        <p className="pfm-admin-dim">
          Renaming a club also renames it on its competitions. The club's login email is
          separate (the account's email in Clerk).
        </p>
      </Form>
    </Modal>
  );
};

// --- The tab -----------------------------------------------------------------

const Details = ({ c }) => (
  <div className="pfm-admin-comp-details">
    <div>
      <div className="pfm-admin-dim">Address</div>
      <div>{c.address || "—"}</div>
    </div>
    {c.note && (
      <div>
        <div className="pfm-admin-dim">Message from the club</div>
        <div className="pfm-admin-pre">{c.note}</div>
      </div>
    )}
    <div>
      <div className="pfm-admin-dim">Logins</div>
      {c.accounts.length === 0 ? (
        <div className="pfm-admin-dim">No login yet (create one with npm run clubs:create -- --only {c.id})</div>
      ) : (
        c.accounts.map((a) => (
          <div key={a.id}>
            {a.email} {a.name && <span className="pfm-admin-dim">· {a.name}</span>}
            <span className="pfm-admin-dim"> · last sign-in {fmtDateTime(a.lastSignInAt)}</span>
          </div>
        ))
      )}
    </div>
    <div className="pfm-admin-dim">
      Club #{c.id} · added {fmtDateTime(c.createdAt)} · {c.competitionCount} competition(s)
    </div>
  </div>
);

const ClubsTab = ({ counts }) => {
  const api = useAdminApi();
  const [status, setStatus] = useState("pending");
  const [review, setReview] = useState(null); // { action, club }
  const [editing, setEditing] = useState(null);

  const list = useQuery({
    queryKey: ["admin-clubs", status],
    queryFn: () => api.get(`/api/admin/clubs?status=${status}`),
  });

  const columns = [
    {
      title: "Club",
      key: "name",
      render: (_, c) => (
        <div>
          <div className="pfm-admin-strong">
            {c.name} {c.test && <Tag color="purple">test — hidden</Tag>}
          </div>
          <div className="pfm-admin-dim">{[c.type, c.city].filter(Boolean).join(" · ")}</div>
        </div>
      ),
    },
    {
      title: "Contact",
      key: "contact",
      render: (_, c) => (
        <div>
          <div>{c.president || "—"}</div>
          {c.email && (
            <a href={`mailto:${c.email}`} className="pfm-admin-dim">
              {c.email}
            </a>
          )}
          {c.phone && <div className="pfm-admin-dim">{c.phone}</div>}
        </div>
      ),
    },
    {
      title: "Logins",
      key: "accounts",
      render: (_, c) =>
        c.accounts.length === 0 ? (
          <span className="pfm-admin-dim">none</span>
        ) : (
          <div>
            {c.accounts.map((a) => (
              <div key={a.id} className="pfm-admin-dim">
                {a.email} {a.status !== "approved" && <Tag color="gold">pending</Tag>}
              </div>
            ))}
          </div>
        ),
    },
    {
      title: status === "pending" ? "Signed up" : "Competitions",
      key: "when",
      render: (_, c) =>
        status === "pending" ? (
          <span className="pfm-admin-dim">{fmtDateTime(c.createdAt)}</span>
        ) : (
          <span className="pfm-admin-dim">{c.competitionCount}</span>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, c) => (
        <div className="pfm-admin-actions pfm-admin-actions-wrap">
          {c.status === "pending" && (
            <>
              <Button type="primary" size="small" onClick={() => setReview({ action: "approve", club: c })}>
                Approve
              </Button>
              <Button danger size="small" onClick={() => setReview({ action: "reject", club: c })}>
                Reject
              </Button>
            </>
          )}
          <Button size="small" onClick={() => setEditing(c)}>
            Edit
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="pfm-admin-section">
      <div className="pfm-admin-card">
        <h2 className="pfm-admin-subtitle">Clubs</h2>
        <p className="pfm-admin-dim">
          Clubs that register on the site wait here. Approving one puts it on the public Clubs
          page and lets its account register competitions; rejecting deletes the club and the
          account that signed it up. Clubs from the federation's own list are already approved.
        </p>
      </div>

      <div className="pfm-admin-toolbar">
        <Segmented
          value={status}
          onChange={setStatus}
          options={STATUSES.map((s) => ({
            value: s.value,
            label: counts ? `${s.label} (${counts[s.value]})` : s.label,
          }))}
        />
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={list.data ?? []}
        loading={list.isLoading}
        expandable={{ expandedRowRender: (c) => <Details c={c} /> }}
        pagination={{ pageSize: 20, hideOnSinglePage: true }}
        scroll={{ x: "max-content" }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={status === "pending" ? "No clubs waiting for approval" : "No clubs"}
            />
          ),
        }}
        className="pfm-admin-table"
      />

      {review && (
        <ReviewModal key={`${review.action}-${review.club.id}`} review={review} onClose={() => setReview(null)} />
      )}
      {editing && <EditModal key={editing.id} club={editing} onClose={() => setEditing(null)} />}
    </div>
  );
};

export default ClubsTab;
