// src/pages/Welcome/Welcome.jsx
// /welcome — where people land right after creating an account (see
// SIGN_UP_REDIRECT). They choose what the account is for:
//   - swimmer / water polo player: done, nothing else to fill in yet;
//   - club: the club's details go to the federation, and the account waits
//     for an admin to approve the club (then it shows on the Clubs page).
// Also reachable later from the account menu ("Choose account type").
import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { SignInButton, useAuth, useUser } from "@clerk/react";
import { Alert, Button, ConfigProvider, Form, Input, Select, Spin } from "antd";
import { FiSend, FiUser, FiUsers } from "react-icons/fi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import Reveal from "../../components/fx/Reveal.jsx";
import { antDarkTheme } from "../../lib/antDarkTheme.js";
import { CLERK_PUBLISHABLE_KEY, SIGN_UP_REDIRECT } from "../../lib/clerk.js";
import { CLUB_TYPES } from "../../lib/clubs.js";
import { useAuthedApi } from "../../lib/useAuthedApi.js";
import { useMyAccount } from "../../lib/useMyAccount.js";
import "../Clubs/Clubs.css";
import "../ClubAccount/ClubAccount.css";
import "../../components/competitions/competitions.css";
import "./Welcome.css";

const Shell = ({ title, subtitle, children }) => {
  const { t } = useTranslation();
  return (
    <div className="pfm-clubs pfm-welcome pt-24">
      <div className="pfm-landing-inner max-w-4xl mx-auto px-4 md:px-6">
        <Reveal>
          <header className="pfm-clubs-head">
            <div className="pfm-clubs-kicker">{t("welcome.kicker")}</div>
            <h1 className="pfm-clubs-title">{title}</h1>
            {subtitle && <p className="pfm-clubs-sub">{subtitle}</p>}
          </header>
          {children}
        </Reveal>
      </div>
    </div>
  );
};

// After the server changed the account's metadata, refresh Clerk's copy (for
// the navbar menu) and ours.
const useAccountRefresh = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  return async () => {
    await user?.reload();
    await queryClient.invalidateQueries({ queryKey: ["my-account"] });
  };
};

const ClubSignUp = ({ onBack }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { user } = useUser();
  const api = useAuthedApi();
  const refresh = useAccountRefresh();
  const navigate = useNavigate();
  const required = { required: true, message: t("competitions.form.errors.required") };

  const send = useMutation({
    mutationFn: (values) => api.post("/api/account/club", values),
    onSuccess: async () => {
      await refresh();
      navigate("/club");
    },
    onError: (err) => {
      if (err.status === 409 && err.body?.errors?.includes("name")) {
        form.setFields([{ name: "name", errors: [t("welcome.club.nameTaken")] }]);
      } else if (err.status === 400) {
        form.setFields(
          (err.body?.errors ?? []).map((name) => ({ name, errors: [t("competitions.form.errors.invalid")] }))
        );
      }
    },
  });

  return (
    <div className="pfm-compform-card">
      <ConfigProvider theme={antDarkTheme}>
        <Alert type="info" showIcon message={t("welcome.club.alreadyListed")} style={{ marginBottom: 20 }} />
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          initialValues={{ email: user?.primaryEmailAddress?.emailAddress ?? "" }}
          onFinish={(values) => send.mutate(values)}
        >
          <h3 className="pfm-compform-section">{t("welcome.club.sections.club")}</h3>
          <Form.Item name="name" label={t("welcome.club.fields.name")} rules={[required, { max: 150 }]}>
            <Input placeholder={t("welcome.club.fields.namePlaceholder")} />
          </Form.Item>
          <div className="pfm-compform-grid">
            <Form.Item name="type" label={t("welcome.club.fields.type")} rules={[required]}>
              <Select options={CLUB_TYPES.map((v) => ({ value: v, label: v }))} />
            </Form.Item>
            <Form.Item name="city" label={t("welcome.club.fields.city")} rules={[required, { max: 100 }]}>
              <Input />
            </Form.Item>
          </div>
          <Form.Item name="address" label={t("welcome.club.fields.address")} rules={[{ max: 200 }]}>
            <Input />
          </Form.Item>

          <h3 className="pfm-compform-section">{t("welcome.club.sections.contact")}</h3>
          <Form.Item name="president" label={t("welcome.club.fields.president")} rules={[required, { max: 100 }]}>
            <Input />
          </Form.Item>
          <div className="pfm-compform-grid">
            <Form.Item
              name="email"
              label={t("welcome.club.fields.email")}
              rules={[required, { type: "email", message: t("competitions.form.errors.email") }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="phone" label={t("welcome.club.fields.phone")} rules={[required, { max: 50 }]}>
              <Input />
            </Form.Item>
          </div>
          <Form.Item name="note" label={t("welcome.club.fields.note")} rules={[{ max: 2000 }]}>
            <Input.TextArea rows={3} placeholder={t("welcome.club.fields.notePlaceholder")} />
          </Form.Item>

          {send.isError && send.error.status !== 400 && !send.error.body?.errors && (
            <Alert style={{ marginBottom: 16 }} type="error" showIcon message={send.error.message} />
          )}

          <div className="pfm-welcome-buttons">
            <Button size="large" onClick={onBack}>
              {t("welcome.back")}
            </Button>
            <Button type="primary" size="large" htmlType="submit" loading={send.isPending}>
              {t("welcome.club.submit")} <FiSend />
            </Button>
          </div>
        </Form>
      </ConfigProvider>
    </div>
  );
};

const WelcomeInner = () => {
  const { t } = useTranslation();
  const { isLoaded, isSignedIn } = useAuth();
  const account = useMyAccount();
  const api = useAuthedApi();
  const refresh = useAccountRefresh();
  const [step, setStep] = useState("choose");

  const athlete = useMutation({
    mutationFn: () => api.post("/api/account/athlete"),
    onSuccess: refresh,
  });

  if (!isLoaded || (isSignedIn && account.isPending)) return <Shell title="…" />;

  if (!isSignedIn) {
    return (
      <Shell title={t("welcome.signedOut.title")} subtitle={t("welcome.signedOut.text")}>
        <div className="pfm-clubacc-actions">
          <SignInButton mode="modal" signUpForceRedirectUrl={SIGN_UP_REDIRECT}>
            <button type="button" className="pfm-clubacc-btn is-primary">
              {t("welcome.signedOut.button")}
            </button>
          </SignInButton>
        </div>
      </Shell>
    );
  }

  if (account.isError) return <Shell title={account.error.message} />;
  const { accountType } = account.data;

  if (accountType === "club") return <Navigate to="/club" replace />;
  if (accountType) {
    return (
      <Shell title={t("welcome.athleteDone.title")} subtitle={t("welcome.athleteDone.text")}>
        <div className="pfm-clubacc-actions">
          <Link to="/" className="pfm-clubacc-btn is-primary">
            {t("welcome.athleteDone.home")}
          </Link>
        </div>
      </Shell>
    );
  }

  if (step === "club") {
    return (
      <Shell title={t("welcome.club.title")} subtitle={t("welcome.club.text")}>
        <ClubSignUp onBack={() => setStep("choose")} />
      </Shell>
    );
  }

  return (
    <Shell title={t("welcome.title")} subtitle={t("welcome.subtitle")}>
      <div className="pfm-welcome-choices">
        <button
          type="button"
          className="pfm-welcome-choice"
          disabled={athlete.isPending}
          onClick={() => athlete.mutate()}
        >
          <span className="pfm-welcome-choice-icon">
            <FiUser />
          </span>
          <span className="pfm-welcome-choice-title">{t("welcome.athlete.title")}</span>
          <span className="pfm-welcome-choice-text">{t("welcome.athlete.text")}</span>
        </button>
        <button type="button" className="pfm-welcome-choice" onClick={() => setStep("club")}>
          <span className="pfm-welcome-choice-icon">
            <FiUsers />
          </span>
          <span className="pfm-welcome-choice-title">{t("welcome.clubChoice.title")}</span>
          <span className="pfm-welcome-choice-text">{t("welcome.clubChoice.text")}</span>
        </button>
      </div>
      {athlete.isPending && <Spin style={{ marginTop: 20 }} />}
      {athlete.isError && (
        <p className="pfm-clubacc-note" role="alert">
          {athlete.error.message}
        </p>
      )}
    </Shell>
  );
};

const Welcome = () => {
  const { t } = useTranslation();
  // Without Clerk there are no accounts (and Clerk's hooks would throw).
  if (!CLERK_PUBLISHABLE_KEY) return <Shell title={t("welcome.signedOut.title")} />;
  return <WelcomeInner />;
};

export default Welcome;
