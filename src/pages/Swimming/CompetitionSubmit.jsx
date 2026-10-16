// src/pages/Swimming/CompetitionSubmit.jsx
// Clubs register a competition for the calendar here (/swimming/calendar-national/submit)
// while the registration window is open. Only approved club accounts can use
// it, and the organizer is always the signed-in club. ?edit=<id> opens one of
// the club's own competitions (linked from "My club") to fix it when the
// federation asks for changes.
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SignInButton, useAuth, useUser } from "@clerk/react";
import {
  Alert,
  Button,
  ConfigProvider,
  DatePicker,
  Form,
  Input,
  Radio,
  Result,
  Spin,
  TimePicker,
} from "antd";
import dayjs from "dayjs";
import { FiSend } from "react-icons/fi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import Reveal from "../../components/fx/Reveal.jsx";
import { useRegistrationWindow } from "../../components/competitions/hooks.js";
import { useAuthedApi } from "../../lib/useAuthedApi.js";
import { antDarkTheme } from "../../lib/antDarkTheme.js";
import { CLERK_PUBLISHABLE_KEY, SIGN_UP_REDIRECT } from "../../lib/clerk.js";
import { COURSES } from "../../lib/competitions.js";
import { useMyAccount } from "../../lib/useMyAccount.js";
import "../../components/competitions/competitions.css";

const DAY = "YYYY-MM-DD";
const fmtWindow = (iso, locale) =>
  new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));

// Form values ⇄ API body (no clubId: the server uses the signed-in club)
const toBody = (v) => ({
  sport: "swimming",
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

const MyClubLink = ({ children }) => (
  <Link to="/club">
    <Button>{children}</Button>
  </Link>
);

// Only approved club accounts get past this; children receive the club
// (from /api/account) and the account's email.
const ClubGate = ({ children }) => {
  const { t } = useTranslation();
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const account = useMyAccount();

  if (!isLoaded) return <Spin />;
  if (!isSignedIn) {
    return (
      <Result
        status="info"
        title={t("competitions.form.clubOnly.title")}
        subTitle={t("competitions.form.clubOnly.text")}
        extra={[
          <SignInButton key="signin" mode="modal" signUpForceRedirectUrl={SIGN_UP_REDIRECT}>
            <Button type="primary">{t("competitions.form.clubOnly.signIn")}</Button>
          </SignInButton>,
          <BackLink key="back">{t("competitions.form.back")}</BackLink>,
        ]}
      />
    );
  }

  if (account.isPending) return <Spin />;
  if (account.isError) return <Result status="error" title={account.error.message} />;

  const club = account.data.club;
  if (!club) {
    return (
      <Result
        status="warning"
        title={t("clubAccount.notClub.title")}
        subTitle={t("clubAccount.notClub.text")}
        extra={<BackLink>{t("competitions.form.back")}</BackLink>}
      />
    );
  }
  if (club.status !== "approved" || club.accountStatus !== "approved") {
    return (
      <Result
        status="info"
        title={t("clubAccount.pending.badge")}
        subTitle={t("clubAccount.pending.text")}
        extra={<BackLink>{t("competitions.form.back")}</BackLink>}
      />
    );
  }
  return children({ club, accountEmail: user.primaryEmailAddress?.emailAddress ?? club.email });
};

const CompetitionForm = ({ club, accountEmail, initial, editId, onDone }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const api = useAuthedApi();
  const required = { required: true, message: t("competitions.form.errors.required") };

  useEffect(() => {
    if (initial) form.setFieldsValue(toValues(initial));
  }, [initial, form]);

  const mutation = useMutation({
    mutationFn: (values) =>
      editId
        ? api.put(`/api/competitions/mine/${editId}`, toBody(values))
        : api.post("/api/competitions", toBody(values)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club-competitions"] });
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
      initialValues={{ course: "SC", contactEmail: accountEmail }}
      onFinish={(values) => mutation.mutate(values)}
    >
      <h3 className="pfm-compform-section">{t("competitions.form.sections.event")}</h3>
      {/* Not a form field: the server always uses the signed-in club. */}
      <Form.Item label={t("competitions.form.fields.club")}>
        <Input value={club.name} disabled />
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
        {editId ? t("competitions.form.save") : t("competitions.form.submit")} <FiSend />
      </Button>
    </Form>
  );
};

// One of the club's competitions: status, the federation's messages, and the
// form if it can still be changed.
const EditSubmission = ({ id, club, accountEmail }) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? "mk";
  const [saved, setSaved] = useState(false);
  const api = useAuthedApi();
  const { data: c, isLoading, error } = useQuery({
    queryKey: ["club-competitions", id],
    queryFn: () => api.get(`/api/competitions/mine/${id}`),
    retry: false,
  });

  if (isLoading) return <Spin />;
  if (error) {
    return (
      <Result
        status={error.status === 404 ? "404" : "error"}
        title={error.status === 404 ? t("competitions.form.notFound") : error.message}
        extra={<MyClubLink>{t("navbar.actions.myClub")}</MyClubLink>}
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
          <MyClubLink key="club">{t("navbar.actions.myClub")}</MyClubLink>,
        ]}
      />
    );
  }

  const { messages, canEdit } = c;
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
      {canEdit && (
        <CompetitionForm
          club={club}
          accountEmail={accountEmail}
          initial={c}
          editId={id}
          onDone={() => setSaved(true)}
        />
      )}
    </>
  );
};

const NewSubmission = ({ club, accountEmail }) => {
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
          <MyClubLink key="club">{t("navbar.actions.myClub")}</MyClubLink>,
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
  return (
    <CompetitionForm
      key={formKey}
      club={club}
      accountEmail={accountEmail}
      onDone={() => setDone(true)}
    />
  );
};

const CompetitionSubmit = () => {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? "mk";
  const [params] = useSearchParams();
  const editParam = params.get("edit");
  // Ids only; links from before club accounts carried a long secret token.
  const editId = /^\d+$/.test(editParam ?? "") ? Number(editParam) : null;
  const { data: w } = useRegistrationWindow();

  let body;
  if (!CLERK_PUBLISHABLE_KEY) {
    body = <Result status="warning" title={t("competitions.form.clubOnly.title")} />;
  } else if (editParam && !editId) {
    body = (
      <Result
        status="info"
        title={t("competitions.form.oldLink.title")}
        subTitle={t("competitions.form.oldLink.text")}
        extra={<MyClubLink>{t("navbar.actions.myClub")}</MyClubLink>}
      />
    );
  } else {
    body = (
      <ClubGate>
        {(props) =>
          editParam ? <EditSubmission id={editId} {...props} /> : <NewSubmission {...props} />
        }
      </ClubGate>
    );
  }

  return (
    <div className="pfm-compform pt-24">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        <Reveal>
          <div className="pfm-compcal-kicker">{t("competitions.form.kicker")}</div>
          <h2 className="pfm-compcal-title">
            {editParam ? t("competitions.form.editTitle") : t("competitions.form.title")}
          </h2>
          {!editParam && w?.status === "open" && (
            <p className="pfm-compform-sub">
              {t("competitions.form.subtitle", { season: w.season, date: fmtWindow(w.closesAt, locale) })}
            </p>
          )}
        </Reveal>

        <Reveal delay={0.1}>
          <div className="pfm-compform-card">
            <ConfigProvider theme={antDarkTheme}>
              {body}
            </ConfigProvider>
          </div>
        </Reveal>
      </div>
    </div>
  );
};

export default CompetitionSubmit;
