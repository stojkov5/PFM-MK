// src/pages/Swimming/CompetitionSubmit.jsx
// Clubs register a competition for the calendar here (/swimming/calendar-national/submit)
// while the registration window is open. No login: after submitting, the club
// gets an email with a private edit link (?edit=<token>) that opens this same
// page pre-filled — used to fix a submission when the federation asks for changes.
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Alert,
  Button,
  ConfigProvider,
  DatePicker,
  Form,
  Input,
  Radio,
  Result,
  Select,
  Spin,
  TimePicker,
} from "antd";
import dayjs from "dayjs";
import { FiSend } from "react-icons/fi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import Reveal from "../../components/fx/Reveal.jsx";
import { useRegistrationWindow } from "../../components/competitions/hooks.js";
import { apiGet, apiPost, apiPut } from "../../lib/api.js";
import { antDarkTheme } from "../../lib/antDarkTheme.js";
import { CLUB_OPTIONS, COURSES } from "../../lib/competitions.js";
import "../../components/competitions/competitions.css";

const DAY = "YYYY-MM-DD";
const fmtWindow = (iso, locale) =>
  new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));

// Form values ⇄ API body
const toBody = (v) => ({
  sport: "swimming",
  clubId: v.clubId,
  name: v.name,
  startDate: v.dates[0].format(DAY),
  endDate: v.dates[1].format(DAY),
  startTime: v.startTime ? v.startTime.format("HH:mm") : null,
  city: v.city,
  venue: v.venue ?? "",
  course: v.course,
  entryDeadline: v.entryDeadline ? v.entryDeadline.format(DAY) : null,
  criteria: v.criteria,
  description: v.description ?? "",
  infoUrl: v.infoUrl || null,
  contactName: v.contactName,
  contactEmail: v.contactEmail,
  contactPhone: v.contactPhone ?? "",
});

const toValues = (c) => ({
  clubId: c.clubId,
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
});

// Server field names → form field names
const FIELD_OF = { startDate: "dates", endDate: "dates" };

const BackLink = ({ children }) => (
  <Link to="/swimming/calendar-national">
    <Button>{children}</Button>
  </Link>
);

const CompetitionForm = ({ initial, editToken, onDone }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const required = { required: true, message: t("competitions.form.errors.required") };

  useEffect(() => {
    if (initial) form.setFieldsValue(toValues(initial));
  }, [initial, form]);

  const mutation = useMutation({
    mutationFn: (values) =>
      editToken
        ? apiPut(`/api/competitions/edit/${editToken}`, toBody(values))
        : apiPost("/api/competitions", toBody(values)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competition-edit", editToken] });
      onDone();
    },
    onError: (err) => {
      const fields = [...new Set((err.body?.errors ?? []).map((f) => FIELD_OF[f] ?? f))];
      form.setFields(fields.map((name) => ({ name, errors: [t("competitions.form.errors.invalid")] })));
    },
  });

  return (
    <Form
      form={form}
      layout="vertical"
      requiredMark={false}
      initialValues={{ course: "SC" }}
      onValuesChange={(changed) => {
        // Pre-fill the contact email with the club's email from the clubs list.
        if (changed.clubId && !form.getFieldValue("contactEmail")) {
          const club = CLUB_OPTIONS.find((c) => c.value === changed.clubId);
          if (club?.email) form.setFieldsValue({ contactEmail: club.email });
        }
      }}
      onFinish={(values) => mutation.mutate(values)}
    >
      <h3 className="pfm-compform-section">{t("competitions.form.sections.event")}</h3>
      <Form.Item name="clubId" label={t("competitions.form.fields.club")} rules={[required]}>
        <Select
          showSearch
          optionFilterProp="label"
          options={CLUB_OPTIONS}
          placeholder={t("competitions.form.fields.clubPlaceholder")}
        />
      </Form.Item>
      <Form.Item name="name" label={t("competitions.form.fields.name")} rules={[required, { max: 200 }]}>
        <Input placeholder={t("competitions.form.fields.namePlaceholder")} />
      </Form.Item>
      <Form.Item name="course" label={t("competitions.form.fields.course")} rules={[required]}>
        <Radio.Group
          optionType="button"
          options={COURSES.map((c) => ({ value: c, label: t(`competitions.courses.${c}`) }))}
        />
      </Form.Item>

      <h3 className="pfm-compform-section">{t("competitions.form.sections.when")}</h3>
      <div className="pfm-compform-grid">
        <Form.Item name="dates" label={t("competitions.form.fields.dates")} rules={[required]}>
          <DatePicker.RangePicker
            className="pfm-compform-picker"
            format="DD.MM.YYYY"
            disabledDate={(d) => d.isBefore(dayjs(), "day")}
          />
        </Form.Item>
        <Form.Item name="startTime" label={t("competitions.form.fields.startTime")}>
          <TimePicker className="pfm-compform-picker" format="HH:mm" minuteStep={5} needConfirm={false} />
        </Form.Item>
      </div>
      <div className="pfm-compform-grid">
        <Form.Item name="city" label={t("competitions.form.fields.city")} rules={[required, { max: 100 }]}>
          <Input />
        </Form.Item>
        <Form.Item name="venue" label={t("competitions.form.fields.venue")} rules={[{ max: 200 }]}>
          <Input placeholder={t("competitions.form.fields.venuePlaceholder")} />
        </Form.Item>
      </div>

      <h3 className="pfm-compform-section">{t("competitions.form.sections.details")}</h3>
      <Form.Item
        name="criteria"
        label={t("competitions.form.fields.criteria")}
        rules={[required, { max: 3000 }]}
      >
        <Input.TextArea rows={4} placeholder={t("competitions.form.fields.criteriaPlaceholder")} />
      </Form.Item>
      <div className="pfm-compform-grid">
        <Form.Item
          name="entryDeadline"
          label={t("competitions.form.fields.entryDeadline")}
          dependencies={["dates"]}
          rules={[
            ({ getFieldValue }) => ({
              validator(_, v) {
                const end = getFieldValue("dates")?.[1];
                return !v || !end || !v.isAfter(end, "day")
                  ? Promise.resolve()
                  : Promise.reject(new Error(t("competitions.form.errors.deadline")));
              },
            }),
          ]}
        >
          <DatePicker className="pfm-compform-picker" format="DD.MM.YYYY" />
        </Form.Item>
        <Form.Item
          name="infoUrl"
          label={t("competitions.form.fields.infoUrl")}
          rules={[{ type: "url", message: t("competitions.form.errors.url") }]}
        >
          <Input placeholder="https://..." />
        </Form.Item>
      </div>
      <Form.Item name="description" label={t("competitions.form.fields.description")} rules={[{ max: 3000 }]}>
        <Input.TextArea rows={3} />
      </Form.Item>

      <h3 className="pfm-compform-section">{t("competitions.form.sections.contact")}</h3>
      <div className="pfm-compform-grid-3">
        <Form.Item name="contactName" label={t("competitions.form.fields.contactName")} rules={[required, { max: 100 }]}>
          <Input />
        </Form.Item>
        <Form.Item
          name="contactEmail"
          label={t("competitions.form.fields.contactEmail")}
          rules={[required, { type: "email", message: t("competitions.form.errors.email") }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="contactPhone" label={t("competitions.form.fields.contactPhone")} rules={[{ max: 50 }]}>
          <Input />
        </Form.Item>
      </div>
      <p className="pfm-compform-hint">
        {t("competitions.form.fields.contactHint")}
      </p>

      {mutation.isError && (
        <Alert
          style={{ marginBottom: 16 }}
          type="error"
          showIcon
          message={
            mutation.error?.status === 400
              ? t("competitions.form.errors.checkFields")
              : mutation.error?.status === 403
                ? t("competitions.form.closed.title")
                : mutation.error?.message || t("competitions.form.errors.submitFailed")
          }
        />
      )}

      <Button
        type="primary"
        size="large"
        htmlType="submit"
        loading={mutation.isPending}
        className="pfm-compform-submit"
      >
        {editToken ? t("competitions.form.save") : t("competitions.form.submit")} <FiSend />
      </Button>
    </Form>
  );
};

// The edit-link view: status, the federation's messages, and the form if
// the submission can still be changed.
const EditSubmission = ({ token }) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? "mk";
  const [saved, setSaved] = useState(false);
  const { data, isLoading, error } = useQuery({
    queryKey: ["competition-edit", token],
    queryFn: () => apiGet(`/api/competitions/edit/${encodeURIComponent(token)}`),
    retry: false,
  });

  if (isLoading) return <Spin />;
  if (error) {
    return (
      <Result
        status={error.status === 404 ? "404" : "error"}
        title={error.status === 404 ? t("competitions.form.notFound") : error.message}
        extra={<BackLink>{t("competitions.form.back")}</BackLink>}
      />
    );
  }
  if (saved) {
    return (
      <Result
        status="success"
        title={t("competitions.form.saved.title")}
        subTitle={t("competitions.form.saved.text")}
        extra={[
          <Button key="again" onClick={() => setSaved(false)}>
            {t("competitions.form.saved.again")}
          </Button>,
          <BackLink key="back">{t("competitions.form.back")}</BackLink>,
        ]}
      />
    );
  }

  const { competition: c, messages, canEdit } = data;
  const statusType = { pending: "info", changes: "warning", approved: "success", denied: "error" }[c.status];

  return (
    <>
      <div className="pfm-compform-status">
        <Alert
          type={statusType}
          showIcon
          message={`${t("competitions.form.statusLabel")}: ${t(`competitions.form.status.${c.status}`)}`}
          description={canEdit ? null : t("competitions.form.locked")}
        />
        {messages.map((m, i) => (
          <Alert
            key={i}
            type="warning"
            message={`${t("competitions.form.messageFromFederation")} · ${new Date(m.createdAt).toLocaleDateString(locale)}`}
            description={<span className="pfm-comp-text">{m.body}</span>}
          />
        ))}
      </div>
      {canEdit && <CompetitionForm initial={c} editToken={token} onDone={() => setSaved(true)} />}
    </>
  );
};

const NewSubmission = () => {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? "mk";
  const [done, setDone] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const { data: w, isLoading } = useRegistrationWindow();

  if (isLoading) return <Spin />;
  if (done) {
    return (
      <Result
        status="success"
        title={t("competitions.form.success.title")}
        subTitle={t("competitions.form.success.text")}
        extra={[
          <Button
            key="another"
            onClick={() => {
              setFormKey((k) => k + 1);
              setDone(false);
            }}
          >
            {t("competitions.form.success.another")}
          </Button>,
          <BackLink key="back">{t("competitions.form.back")}</BackLink>,
        ]}
      />
    );
  }
  if (w?.status !== "open") {
    return (
      <Result
        status="info"
        title={t("competitions.form.closed.title")}
        subTitle={
          w?.status === "upcoming"
            ? t("competitions.window.upcoming", {
                season: w.season,
                from: fmtWindow(w.opensAt, locale),
                to: fmtWindow(w.closesAt, locale),
              })
            : t("competitions.form.closed.text")
        }
        extra={<BackLink>{t("competitions.form.back")}</BackLink>}
      />
    );
  }
  return <CompetitionForm key={formKey} onDone={() => setDone(true)} />;
};

const CompetitionSubmit = () => {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? "mk";
  const [params] = useSearchParams();
  const token = params.get("edit");
  const { data: w } = useRegistrationWindow();

  return (
    <div className="pfm-compform pt-24">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        <Reveal>
          <div className="pfm-compcal-kicker">{t("competitions.form.kicker")}</div>
          <h2 className="pfm-compcal-title">
            {token ? t("competitions.form.editTitle") : t("competitions.form.title")}
          </h2>
          {!token && w?.status === "open" && (
            <p className="pfm-compform-sub">
              {t("competitions.form.subtitle", { season: w.season, date: fmtWindow(w.closesAt, locale) })}
            </p>
          )}
        </Reveal>

        <Reveal delay={0.1}>
          <div className="pfm-compform-card">
            <ConfigProvider theme={antDarkTheme}>
              {token ? <EditSubmission token={token} /> : <NewSubmission />}
            </ConfigProvider>
          </div>
        </Reveal>
      </div>
    </div>
  );
};

export default CompetitionSubmit;
