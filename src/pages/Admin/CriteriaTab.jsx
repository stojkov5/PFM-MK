// src/pages/Admin/CriteriaTab.jsx
// Criteria PDFs in the admin panel: add a PDF with a name to a sport's
// Criteria page, rename it, replace its file when the criteria change, change
// the order, or delete it. Changes show on the site right away.
import React, { useState } from "react";
import {
  App as AntApp,
  Button,
  Empty,
  Form,
  Input,
  Modal,
  Popconfirm,
  Segmented,
  Select,
  Table,
  Tooltip,
  Upload,
} from "antd";
import dayjs from "dayjs";
import { FiArrowDown, FiArrowUp, FiExternalLink, FiPlus, FiUploadCloud } from "react-icons/fi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAdminApi } from "./useAdminApi.js";
import { useIsPhone } from "./useIsPhone.js";
import { apiUrl } from "../../lib/api.js";
import { CRITERIA_SPORTS } from "../../lib/criteria.js";

const SPORT_LABELS = { swimming: "Swimming", "distance-swimming": "Distance swimming" };
const SPORT_PAGES = { swimming: "/swimming/criteria", "distance-swimming": "/distance-swimming/criteria" };
const SPORT_OPTIONS = CRITERIA_SPORTS.map((s) => ({ value: s, label: SPORT_LABELS[s] }));
const MAX_BYTES = 15 * 1024 * 1024;

const fmtSize = (bytes) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
const fmtDateTime = (v) => (v ? dayjs(v).format("DD.MM.YYYY HH:mm") : "—");

const invalidateAll = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: ["admin-criteria"] });
  queryClient.invalidateQueries({ queryKey: ["criteria"] });
};

// --- Add / edit dialog -------------------------------------------------------

const EditModal = ({ doc, sport, onClose }) => {
  const api = useAdminApi();
  const { message } = AntApp.useApp();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  const isNew = !doc;

  const save = useMutation({
    mutationFn: async (values) => {
      // Upload the PDF first; the document then points at the stored file.
      // Without a new file, an edit keeps the current PDF.
      const mediaId = file ? (await api.upload("/api/admin/media", file)).id : undefined;
      const body = { ...values, mediaId };
      return isNew ? api.post("/api/admin/criteria", body) : api.put(`/api/admin/criteria/${doc.id}`, body);
    },
    onSuccess: () => {
      message.success(isNew ? "Document added to the Criteria page." : "Saved.");
      invalidateAll(queryClient);
      onClose();
    },
    onError: (err) => message.error(err.message),
  });

  const submit = (values) => {
    if (isNew && !file) {
      setFileError("Choose a PDF file");
      return;
    }
    save.mutate(values);
  };

  return (
    <Modal
      open
      title={isNew ? "Add a criteria document" : `Edit: ${doc.title}`}
      okText={isNew ? "Add to page" : "Save"}
      confirmLoading={save.isPending}
      onOk={() => form.submit()}
      onCancel={onClose}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={doc ? { sport: doc.sport, title: doc.title, description: doc.description } : { sport }}
        onFinish={submit}
      >
        <Form.Item name="sport" label="Show on" rules={[{ required: true, message: "Pick a sport" }]}>
          <Select options={SPORT_OPTIONS.map((o) => ({ ...o, label: `${o.label} → Criteria page` }))} />
        </Form.Item>
        <Form.Item
          name="title"
          label="Name"
          rules={[{ required: true, whitespace: true, message: "Write a name" }, { max: 200 }]}
        >
          <Input placeholder="e.g. Европско Првенство во Пливање" />
        </Form.Item>
        <Form.Item name="description" label="Short description (optional)" rules={[{ max: 300 }]}>
          <Input placeholder="e.g. Сениори · Париз · 50м базен" />
        </Form.Item>
        <Form.Item
          label={isNew ? "PDF file" : "Replace the PDF (optional)"}
          validateStatus={fileError ? "error" : undefined}
          help={
            fileError ??
            (isNew ? "Max 15 MB." : `Now: ${doc.file?.name ?? "PDF"}. Choose a new file only if the criteria changed.`)
          }
        >
          <Upload.Dragger
            accept="application/pdf,.pdf"
            maxCount={1}
            fileList={file ? [{ uid: "pdf", name: file.name, status: "done" }] : []}
            beforeUpload={(f) => {
              if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
                setFileError("Only PDF files");
              } else if (f.size > MAX_BYTES) {
                setFileError("The file is larger than 15 MB");
              } else {
                setFile(f);
                setFileError(null);
              }
              return false; // uploaded on Save, not right away
            }}
            onRemove={() => setFile(null)}
          >
            <p className="ant-upload-drag-icon">
              <FiUploadCloud size={28} />
            </p>
            <p className="ant-upload-text">Click or drop a PDF here</p>
          </Upload.Dragger>
        </Form.Item>
      </Form>
    </Modal>
  );
};

// --- The tab -----------------------------------------------------------------

const CriteriaTab = () => {
  const api = useAdminApi();
  const { message } = AntApp.useApp();
  const queryClient = useQueryClient();
  const isPhone = useIsPhone();
  const [sport, setSport] = useState(CRITERIA_SPORTS[0]);
  const [editing, setEditing] = useState(); // undefined = closed, null = new, object = edit

  const list = useQuery({
    queryKey: ["admin-criteria", sport],
    queryFn: () => api.get(`/api/admin/criteria?sport=${sport}`),
  });
  const docs = list.data ?? [];

  const move = useMutation({
    mutationFn: ({ id, direction }) => api.post(`/api/admin/criteria/${id}/move`, { direction }),
    onSuccess: () => invalidateAll(queryClient),
    onError: (err) => message.error(err.message),
  });
  const remove = useMutation({
    mutationFn: (id) => api.del(`/api/admin/criteria/${id}`),
    onSuccess: () => {
      message.success("Deleted.");
      invalidateAll(queryClient);
    },
    onError: (err) => message.error(err.message),
  });

  const orderButtons = (doc, index) => (
    <div className="pfm-admin-actions">
      <Tooltip title="Move up">
        <Button
          size="small"
          icon={<FiArrowUp />}
          disabled={index === 0 || move.isPending}
          onClick={() => move.mutate({ id: doc.id, direction: "up" })}
        />
      </Tooltip>
      <Tooltip title="Move down">
        <Button
          size="small"
          icon={<FiArrowDown />}
          disabled={index === docs.length - 1 || move.isPending}
          onClick={() => move.mutate({ id: doc.id, direction: "down" })}
        />
      </Tooltip>
    </div>
  );

  const fileLink = (doc) => (
    <a href={apiUrl(doc.url)} target="_blank" rel="noopener noreferrer" className="pfm-admin-link">
      {doc.file ? `${doc.file.name} · ${fmtSize(doc.file.size)}` : "Open PDF"} <FiExternalLink />
    </a>
  );

  const actions = (doc) => (
    <div className="pfm-admin-actions pfm-admin-actions-wrap">
      <Button size="small" onClick={() => setEditing(doc)}>
        Edit / replace PDF
      </Button>
      <Popconfirm
        title="Delete this document from the site?"
        okText="Delete"
        okButtonProps={{ danger: true }}
        onConfirm={() => remove.mutateAsync(doc.id).catch(() => {})}
      >
        <Button size="small" danger type="text">
          Delete
        </Button>
      </Popconfirm>
    </div>
  );

  const columns = [
    { title: "Order", key: "order", width: 90, render: (_, doc, index) => orderButtons(doc, index) },
    {
      title: "Document",
      key: "title",
      render: (_, doc) => (
        <div>
          <div className="pfm-admin-strong">{doc.title}</div>
          {doc.description && <div className="pfm-admin-dim">{doc.description}</div>}
        </div>
      ),
    },
    { title: "File", key: "file", render: (_, doc) => fileLink(doc) },
    {
      title: "Last changed",
      key: "updated",
      render: (_, doc) => (
        <span className="pfm-admin-dim">
          {fmtDateTime(doc.updatedAt)}
          {doc.updatedBy && ` · ${doc.updatedBy}`}
        </span>
      ),
    },
    { title: "Actions", key: "actions", render: (_, doc) => actions(doc) },
  ];

  const empty = <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No documents on this page yet" />;

  return (
    <div className="pfm-admin-section">
      <div className="pfm-admin-card">
        <h2 className="pfm-admin-subtitle">Criteria documents</h2>
        <p className="pfm-admin-dim">
          PDFs shown on each sport's Criteria page, where visitors can open or download them. Add a
          document, or use “Edit / replace PDF” when the criteria change. The site updates right away
          (<a href={SPORT_PAGES[sport]} target="_blank" rel="noopener noreferrer">open the page</a>).
        </p>
      </div>

      <div className="pfm-admin-toolbar">
        {isPhone ? (
          <Select className="pfm-admin-status-select" value={sport} onChange={setSport} options={SPORT_OPTIONS} />
        ) : (
          <Segmented value={sport} onChange={setSport} options={SPORT_OPTIONS} />
        )}
        <Button type="primary" icon={<FiPlus />} onClick={() => setEditing(null)} block={isPhone}>
          Add document
        </Button>
      </div>

      {isPhone ? (
        <div className="pfm-admin-mcards">
          {list.isLoading && <div className="pfm-admin-dim">Loading…</div>}
          {list.data?.length === 0 && empty}
          {docs.map((doc, index) => (
            <div key={doc.id} className="pfm-admin-mcard">
              <div className="pfm-admin-mcard-top">
                <span className="pfm-admin-dim">#{index + 1}</span>
                {orderButtons(doc, index)}
              </div>
              <div className="pfm-admin-mcard-name">{doc.title}</div>
              {doc.description && <div className="pfm-admin-dim">{doc.description}</div>}
              <div style={{ marginTop: 8 }}>{fileLink(doc)}</div>
              <div className="pfm-admin-dim" style={{ marginTop: 4 }}>
                Last changed {fmtDateTime(doc.updatedAt)}
                {doc.updatedBy && ` · ${doc.updatedBy}`}
              </div>
              <div className="pfm-admin-mcard-actions">{actions(doc)}</div>
            </div>
          ))}
        </div>
      ) : (
        <Table
          rowKey="id"
          columns={columns}
          dataSource={docs}
          loading={list.isLoading}
          pagination={false}
          scroll={{ x: "max-content" }}
          locale={{ emptyText: empty }}
          className="pfm-admin-table"
        />
      )}

      {editing !== undefined && (
        <EditModal key={editing?.id ?? "new"} doc={editing} sport={sport} onClose={() => setEditing(undefined)} />
      )}
    </div>
  );
};

export default CriteriaTab;
