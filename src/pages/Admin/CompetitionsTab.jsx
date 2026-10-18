// src/pages/Admin/CompetitionsTab.jsx
// Swimming calendar in the admin panel: the clubs' registration window, the
// submissions to review (approve / ask for changes / deny — each emails the
// club), and adding or editing competitions directly.
import React, { useState } from "react";
import {
  App as AntApp,
  AutoComplete,
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Radio,
  Tag,
  TimePicker,
  Tooltip,
} from "antd";
import dayjs from "dayjs";
import { FiAlertTriangle, FiExternalLink, FiPlus } from "react-icons/fi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAdminApi } from "./useAdminApi.js";
import { useIsPhone } from "./useIsPhone.js";
import AdminTable from "./AdminTable.jsx";
import StatusSwitch from "./StatusSwitch.jsx";
import { COURSES } from "../../lib/competitions.js";
import { useClubs } from "../../lib/clubs.js";

const STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "changes", label: "Changes requested" },
  { value: "approved", label: "In calendar" },
  { value: "denied", label: "Denied" },
];
const COURSE_LABELS = { SC: "25m", LC: "50m", OW: "Open water" };
const DAY = "YYYY-MM-DD";

const fmtDay = (d) => dayjs(d).format("DD.MM.YYYY");
const fmtRange = (c) =>
  c.startDate === c.endDate ? fmtDay(c.startDate) : `${fmtDay(c.startDate)} – ${fmtDay(c.endDate)}`;
const fmtDateTime = (v) => (v ? dayjs(v).format("DD.MM.YYYY HH:mm") : "—");

const invalidateAll = (queryClient) => {
  for (const key of ["admin-competitions", "admin-competition-counts", "competitions", "competition-window"]) {
    queryClient.invalidateQueries({ queryKey: [key] });
  }
};

// --- Registration window ---------------------------------------------------

const WINDOW_TAGS = {
  open: <Tag color="green">Open now</Tag>,
  upcoming: <Tag color="blue">Scheduled</Tag>,
  closed: <Tag>Closed</Tag>,
  none: <Tag>Not set</Tag>,
};

const WindowCard = () => {
  const api = useAdminApi();
  const isPhone = useIsPhone();
  const { message } = AntApp.useApp();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  const win = useQuery({
    queryKey: ["admin-competition-window"],
    queryFn: () => api.get("/api/admin/competitions/window"),
  });

  const afterChange = (w) => {
    queryClient.setQueryData(["admin-competition-window"], w);
    queryClient.invalidateQueries({ queryKey: ["competition-window"] });
  };

  const save = useMutation({
    mutationFn: ({ season, range }) =>
      api.put("/api/admin/competitions/window", {
        season,
        opensAt: range[0].startOf("day").toISOString(),
        closesAt: range[1].endOf("day").toISOString(),
      }),
    onSuccess: (w) => {
      message.success("Registration period saved.");
      afterChange(w);
    },
    onError: (err) => message.error(err.message),
  });

  const close = useMutation({
    mutationFn: () => api.post("/api/admin/competitions/window/close", {}),
    onSuccess: (w) => {
      message.success("Registration closed.");
      afterChange(w);
    },
    onError: (err) => message.error(err.message),
  });

  const w = win.data;
  const initial =
    w && w.status !== "none"
      ? { season: w.season, range: [dayjs(w.opensAt), dayjs(w.closesAt)] }
      : { season: dayjs().year() + 1 };

  return (
    <div className="pfm-admin-card">
      <h2 className="pfm-admin-subtitle">
        Registration period for clubs {w && WINDOW_TAGS[w.status]}
      </h2>
      <p className="pfm-admin-dim">
        {w?.status === "open"
          ? `Clubs can add competitions until ${fmtDateTime(w.closesAt)}.`
          : w?.status === "upcoming"
            ? `Clubs can add competitions from ${fmtDateTime(w.opensAt)} to ${fmtDateTime(w.closesAt)}.`
            : "While the period is open, the swimming calendar shows an “Add competition” button to everyone. Set the first and last day (e.g. 10–20 January)."}
      </p>
      {!win.isLoading && (
        <Form
          key={w ? `${w.status}-${w.opensAt}-${w.closesAt}` : "none"}
          form={form}
          layout={isPhone ? "vertical" : "inline"}
          className="pfm-admin-invite"
          initialValues={initial}
          onFinish={(v) => save.mutate(v)}
        >
          <Form.Item name="season" label="Calendar year" rules={[{ required: true, message: "Required" }]}>
            <InputNumber min={2000} max={2100} />
          </Form.Item>
          <Form.Item name="range" label="Open from – to" rules={[{ required: true, message: "Pick the dates" }]}>
            <DatePicker.RangePicker format="DD.MM.YYYY" />
          </Form.Item>
          <div className="pfm-admin-actions">
            <Button type="primary" htmlType="submit" loading={save.isPending}>
              Save
            </Button>
            {w?.status === "open" && (
              <Popconfirm
                title="Close registration now?"
                okText="Close it"
                onConfirm={() => close.mutateAsync().catch(() => {})}
              >
                <Button danger loading={close.isPending}>
                  Close now
                </Button>
              </Popconfirm>
            )}
          </div>
        </Form>
      )}
    </div>
  );
};

// --- Review dialog (approve / ask for changes / deny) ----------------------

const REVIEW = {
  approve: {
    title: "Approve and publish",
    ok: "Approve",
    help: "The competition appears in the calendar and the club gets an email. You can add a note to the email (optional).",
    required: false,
  },
  changes: {
    title: "Ask the club for changes",
    ok: "Send to club",
    help: "The club gets this message by email with a link to edit their submission. When they save, it comes back to Pending. Write it in Macedonian — the rest of the email is in Macedonian.",
    required: true,
  },
  deny: {
    title: "Deny",
    ok: "Deny",
    help: "The club gets an email that the competition wasn't approved. Add the reason (optional).",
    required: false,
  },
};

// A ready-made message when the dates clash with other competitions.
const overlapMessage = (c) =>
  c.overlaps.length
    ? `Вашиот натпревар се преклопува со: ${c.overlaps
        .map((o) => `„${o.name}“ (${o.clubName}, ${o.range})`)
        .join("; ")}. Ве молиме изберете други датуми.`
    : "";

const ReviewModal = ({ review, onClose }) => {
  const api = useAdminApi();
  const { message } = AntApp.useApp();
  const queryClient = useQueryClient();
  const [text, setText] = useState(() =>
    review?.action === "changes" ? overlapMessage(review.competition) : ""
  );
  const cfg = REVIEW[review.action];

  const act = useMutation({
    mutationFn: () =>
      api.post(`/api/admin/competitions/${review.competition.id}/${review.action}`, { message: text }),
    onSuccess: (res) => {
      if (res.emailed) message.success("Done — the club was emailed.");
      else message.warning("Done, but the email to the club couldn't be sent. Contact them directly.");
      invalidateAll(queryClient);
      onClose();
    },
    onError: (err) => message.error(err.message),
  });

  const c = review.competition;
  return (
    <Modal
      open
      title={`${cfg.title}: ${c.name}`}
      okText={cfg.ok}
      okButtonProps={{ danger: review.action === "deny", disabled: cfg.required && !text.trim() }}
      confirmLoading={act.isPending}
      onOk={() => act.mutate()}
      onCancel={onClose}
    >
      <p className="pfm-admin-dim" style={{ marginBottom: 10 }}>
        {cfg.help}
      </p>
      <p className="pfm-admin-dim" style={{ marginBottom: 10 }}>
        Email goes to: {[c.contactEmail, c.clubEmail]
          .filter((v, i, a) => v && a.indexOf(v) === i)
          .join(", ") || "— (no email on file)"}
      </p>
      {review.action === "approve" && c.overlaps.length > 0 && (
        <p style={{ color: "#fbbf24", marginBottom: 10 }}>
          <FiAlertTriangle /> Overlaps with {c.overlaps.map((o) => o.name).join(", ")}.
        </p>
      )}
      <Input.TextArea
        rows={5}
        value={text}
        maxLength={3000}
        onChange={(e) => setText(e.target.value)}
        placeholder={cfg.required ? "Message to the club" : "Optional message to the club"}
      />
    </Modal>
  );
};

// --- Add / edit dialog -----------------------------------------------------

const toFormValues = (c) =>
  c
    ? {
        organizer: c.clubName,
        name: c.name,
        dates: [dayjs(c.startDate), dayjs(c.endDate)],
        startTime: c.startTime ? dayjs(`2000-01-01T${c.startTime}`) : null,
        city: c.city,
        venue: c.venue,
        course: c.course,
        entryDeadline: c.entryDeadline ? dayjs(c.entryDeadline) : null,
        criteria: c.criteria,
        description: c.description,
        infoUrl: c.infoUrl,
        contactName: c.contactName,
        contactEmail: c.contactEmail,
        contactPhone: c.contactPhone,
      }
    : { course: "SC", organizer: "Национална пливачка федерација" };

// The server links the competition to a club when the organizer is a club's
// exact name.
const toBody = (v) => ({
  sport: "swimming",
  clubName: v.organizer,
  name: v.name,
  startDate: v.dates[0].format(DAY),
  endDate: v.dates[1].format(DAY),
  startTime: v.startTime ? v.startTime.format("HH:mm") : null,
  city: v.city,
  venue: v.venue ?? "",
  course: v.course,
  entryDeadline: v.entryDeadline ? v.entryDeadline.format(DAY) : null,
  criteria: v.criteria ?? "",
  description: v.description ?? "",
  infoUrl: v.infoUrl || null,
  contactName: v.contactName ?? "",
  contactEmail: v.contactEmail ?? "",
  contactPhone: v.contactPhone ?? "",
});

const EditModal = ({ competition, onClose }) => {
  const api = useAdminApi();
  const { message } = AntApp.useApp();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const isNew = !competition;
  const required = { required: true, message: "Required" };
  const { data: clubs } = useClubs();

  const save = useMutation({
    mutationFn: (values) =>
      isNew
        ? api.post("/api/admin/competitions", toBody(values))
        : api.put(`/api/admin/competitions/${competition.id}`, toBody(values)),
    onSuccess: () => {
      message.success(isNew ? "Competition added to the calendar." : "Saved.");
      invalidateAll(queryClient);
      onClose();
    },
    onError: (err) =>
      message.error(err.body?.errors ? `Check these fields: ${err.body.errors.join(", ")}` : err.message),
  });

  return (
    <Modal
      open
      width={760}
      title={isNew ? "Add a competition to the calendar" : `Edit: ${competition.name}`}
      okText={isNew ? "Add to calendar" : "Save"}
      confirmLoading={save.isPending}
      onOk={() => form.submit()}
      onCancel={onClose}
      destroyOnHidden
    >
      {isNew && (
        <p className="pfm-admin-dim" style={{ marginBottom: 12 }}>
          Competitions you add here are published right away (no review, no email).
        </p>
      )}
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={toFormValues(competition)}
        onFinish={(v) => save.mutate(v)}
      >
        <div className="pfm-admin-form-grid">
          <Form.Item name="name" label="Name" rules={[required]}>
            <Input />
          </Form.Item>
          <Form.Item name="organizer" label="Organizer (club or any name)" rules={[required]}>
            <AutoComplete
              options={(clubs ?? []).map((c) => ({ value: c.name }))}
              filterOption={(input, o) => o.value.toLowerCase().includes(input.toLowerCase())}
            />
          </Form.Item>
          <Form.Item name="dates" label="Dates" rules={[required]}>
            <DatePicker.RangePicker format="DD.MM.YYYY" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="startTime" label="Start time">
            <TimePicker format="HH:mm" minuteStep={5} needConfirm={false} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="city" label="City" rules={[required]}>
            <Input />
          </Form.Item>
          <Form.Item name="venue" label="Venue / pool">
            <Input />
          </Form.Item>
          <Form.Item name="course" label="Pool" rules={[required]}>
            <Radio.Group
              optionType="button"
              options={COURSES.map((c) => ({ value: c, label: COURSE_LABELS[c] }))}
            />
          </Form.Item>
          <Form.Item name="entryDeadline" label="Entry deadline">
            <DatePicker format="DD.MM.YYYY" style={{ width: "100%" }} />
          </Form.Item>
        </div>
        <Form.Item name="criteria" label="Criteria for participation">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item name="description" label="Additional information">
          <Input.TextArea rows={2} />
        </Form.Item>
        <Form.Item name="infoUrl" label="Bulletin link" rules={[{ type: "url", message: "Enter a valid link" }]}>
          <Input placeholder="https://..." />
        </Form.Item>
        <div className="pfm-admin-form-grid pfm-admin-form-grid-3">
          <Form.Item name="contactName" label="Contact name">
            <Input />
          </Form.Item>
          <Form.Item name="contactEmail" label="Contact email" rules={[{ type: "email", message: "Invalid email" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="contactPhone" label="Contact phone">
            <Input />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

// --- The tab ----------------------------------------------------------------

const Details = ({ c }) => (
  <div className="pfm-admin-comp-details">
    {c.criteria && (
      <div>
        <div className="pfm-admin-dim">Criteria</div>
        <div className="pfm-admin-pre">{c.criteria}</div>
      </div>
    )}
    {c.description && (
      <div>
        <div className="pfm-admin-dim">Additional information</div>
        <div className="pfm-admin-pre">{c.description}</div>
      </div>
    )}
    {c.entryDeadline && (
      <div>
        <div className="pfm-admin-dim">Entry deadline</div>
        <div>{fmtDay(c.entryDeadline)}</div>
      </div>
    )}
    {c.infoUrl && (
      <a href={c.infoUrl} target="_blank" rel="noopener noreferrer" className="pfm-admin-link">
        Bulletin <FiExternalLink />
      </a>
    )}
    {c.messages.length > 0 && (
      <div>
        <div className="pfm-admin-dim">Messages sent to the club</div>
        {c.messages.map((m) => (
          <div key={m.id} className="pfm-admin-comp-msg">
            <div className="pfm-admin-dim">
              {fmtDateTime(m.createdAt)} · {m.authorName ?? "—"} · {STATUSES.find((s) => s.value === m.kind)?.label ?? m.kind}
              {!m.emailed && <Tag color="red" style={{ marginLeft: 8 }}>email failed</Tag>}
            </div>
            <div className="pfm-admin-pre">{m.body}</div>
          </div>
        ))}
      </div>
    )}
    <div className="pfm-admin-dim">
      Submitted {fmtDateTime(c.createdAt)}
      {c.source === "admin" ? " by an admin" : " through the public form"}
      {c.reviewerName && ` · reviewed by ${c.reviewerName} (${fmtDateTime(c.reviewedAt)})`}
    </div>
  </div>
);

const CompetitionsTab = ({ counts }) => {
  const api = useAdminApi();
  const { message } = AntApp.useApp();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("pending");
  const [review, setReview] = useState(null); // { action, competition }
  const [editing, setEditing] = useState(); // undefined = closed, null = new, object = edit

  const list = useQuery({
    queryKey: ["admin-competitions", status],
    queryFn: () => api.get(`/api/admin/competitions?status=${status}`),
  });

  const remove = useMutation({
    mutationFn: (id) => api.del(`/api/admin/competitions/${id}`),
    onSuccess: () => {
      message.success("Deleted.");
      invalidateAll(queryClient);
    },
    onError: (err) => message.error(err.message),
  });

  const reviewable = status === "pending" || status === "changes";

  const actionsFor = (c) => (
    <div className="pfm-admin-actions pfm-admin-actions-wrap">
      {reviewable && (
        <>
          <Button type="primary" size="small" onClick={() => setReview({ action: "approve", competition: c })}>
            Approve
          </Button>
          <Button size="small" onClick={() => setReview({ action: "changes", competition: c })}>
            Ask for changes
          </Button>
          <Button danger size="small" onClick={() => setReview({ action: "deny", competition: c })}>
            Deny
          </Button>
        </>
      )}
      <Button size="small" onClick={() => setEditing(c)}>
        Edit
      </Button>
      {!reviewable && (
        <Popconfirm
          title="Delete this competition permanently?"
          placement="topRight"
          okText="Delete"
          okButtonProps={{ danger: true }}
          onConfirm={() => remove.mutateAsync(c.id).catch(() => {})}
        >
          <Button size="small" danger type="text">
            Delete
          </Button>
        </Popconfirm>
      )}
    </div>
  );

  const statusOptions = STATUSES.map((s) => ({
    value: s.value,
    label: counts ? `${s.label} (${counts[s.value]})` : s.label,
  }));

  const columns = [
    {
      title: "Competition",
      key: "name",
      primary: true,
      render: (c) => (
        <div>
          <div className="pfm-admin-strong">
            {c.name} <Tag className="pfm-admin-inline-tag">{COURSE_LABELS[c.course]}</Tag>
          </div>
          <div className="pfm-admin-dim">{c.clubName}</div>
          <div className="pfm-admin-dim">{[c.venue, c.city].filter(Boolean).join(", ")}</div>
        </div>
      ),
    },
    {
      title: "Dates",
      key: "dates",
      width: 150,
      render: (c) => (
        <div>
          <div className="pfm-admin-strong">{fmtRange(c)}</div>
          {c.startTime && <div className="pfm-admin-dim">from {c.startTime}</div>}
        </div>
      ),
    },
    {
      title: "Overlaps",
      key: "overlaps",
      width: 190,
      render: (c) =>
        c.overlaps.length === 0 ? (
          <span className="pfm-admin-dim">—</span>
        ) : (
          <div className="pfm-admin-overlaps">
            {c.overlaps.map((o) => (
              <Tooltip key={o.id} title={`${o.clubName} · ${o.range} · ${STATUSES.find((s) => s.value === o.status)?.label}`}>
                <Tag color={o.status === "approved" ? "red" : "orange"} icon={<FiAlertTriangle style={{ marginRight: 4 }} />}>
                  {o.name}
                </Tag>
              </Tooltip>
            ))}
          </div>
        ),
    },
    {
      title: "Contact",
      key: "contact",
      render: (c) =>
        c.contactName || c.contactEmail || c.contactPhone ? (
          <div className="pfm-admin-contact">
            {c.contactName && <div>{c.contactName}</div>}
            {c.contactEmail && (
              <a href={`mailto:${c.contactEmail}`} className="pfm-admin-dim">
                {c.contactEmail}
              </a>
            )}
            {c.contactPhone && (
              <a href={`tel:${c.contactPhone.replace(/[^\d+]/g, "")}`} className="pfm-admin-dim">
                {c.contactPhone}
              </a>
            )}
          </div>
        ) : (
          <span className="pfm-admin-dim">—</span>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      actions: true,
      width: 160,
      render: (c) => actionsFor(c),
    },
  ];

  return (
    <div className="pfm-admin-section">
      <WindowCard />

      <div className="pfm-admin-toolbar">
        <StatusSwitch value={status} onChange={setStatus} options={statusOptions} label="Status" />
        <Button type="primary" icon={<FiPlus />} onClick={() => setEditing(null)}>
          Add competition
        </Button>
      </div>

      <AdminTable
        columns={columns}
        dataSource={list.data ?? []}
        loading={list.isLoading}
        expandable={{ render: (c) => <Details c={c} /> }}
        emptyText={status === "pending" ? "No competitions waiting for review" : "Nothing here"}
      />

      {review && <ReviewModal key={`${review.action}-${review.competition.id}`} review={review} onClose={() => setReview(null)} />}
      {editing !== undefined && <EditModal competition={editing} onClose={() => setEditing(undefined)} />}
    </div>
  );
};

export default CompetitionsTab;
