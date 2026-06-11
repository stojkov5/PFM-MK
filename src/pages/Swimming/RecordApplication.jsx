import React, { useState } from "react";
import { Form, Input, Radio, Select, Button, Alert, Result } from "antd";
import { FiSend } from "react-icons/fi";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { apiGet, apiPost } from "../../lib/api.js";
import Reveal from "../../components/fx/Reveal.jsx";
import "./RecordApplication.css";

const TIME_RE = /^\d{1,2}:\d{2}\.\d{2}$/;

const RecordApplication = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [submitted, setSubmitted] = useState(false);

  const gender = Form.useWatch("gender", form) ?? "female";
  const pool = Form.useWatch("pool", form) ?? "25";
  const category = Form.useWatch("category", form);

  const { data: options } = useQuery({
    queryKey: ["record-options", pool, gender],
    queryFn: () => apiGet(`/api/records/options?pool=${pool}&gender=${gender}`),
  });

  const mutation = useMutation({
    mutationFn: (values) =>
      apiPost("/api/applications", {
        firstName: values.firstName,
        lastName: values.lastName,
        gender: values.gender,
        pool: values.pool,
        category: values.category,
        discipline: values.discipline,
        time: values.time,
        proofUrl: values.proofUrl,
      }),
    onSuccess: () => setSubmitted(true),
  });

  if (submitted) {
    return (
      <div className="pfm-recapp pt-24">
        <div className="pfm-landing-inner max-w-3xl mx-auto px-4 md:px-6">
          <Result
            status="success"
            title={t("recordApplication.success.title")}
            subTitle={t("recordApplication.success.text")}
            extra={
              <Button
                onClick={() => {
                  form.resetFields();
                  mutation.reset();
                  setSubmitted(false);
                }}
              >
                {t("recordApplication.success.another")}
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="pfm-recapp pt-24">
      <div className="pfm-landing-inner max-w-3xl mx-auto px-4 md:px-6">
        <Reveal>
          <div className="pfm-recapp-head">
            <div className="pfm-recapp-kicker">{t("recordApplication.kicker")}</div>
            <h1 className="pfm-recapp-title pfm-lane-underline pfm-lane-underline-left">
              {t("recordApplication.title")}
            </h1>
            <p className="pfm-recapp-sub">{t("recordApplication.subtitle")}</p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="pfm-recapp-card">
            <Form
              form={form}
              layout="vertical"
              requiredMark={false}
              initialValues={{ gender: "female", pool: "25" }}
              onValuesChange={(changed) => {
                if (changed.gender || changed.pool) {
                  form.setFieldsValue({ category: undefined, discipline: undefined });
                }
                if (changed.category) {
                  form.setFieldsValue({ discipline: undefined });
                }
              }}
              onFinish={(values) => mutation.mutate(values)}
            >
              <div className="pfm-recapp-grid">
                <Form.Item
                  name="firstName"
                  label={t("recordApplication.fields.firstName")}
                  rules={[
                    { required: true, message: t("recordApplication.errors.required") },
                    { max: 100 },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="lastName"
                  label={t("recordApplication.fields.lastName")}
                  rules={[
                    { required: true, message: t("recordApplication.errors.required") },
                    { max: 100 },
                  ]}
                >
                  <Input />
                </Form.Item>
              </div>

              <div className="pfm-recapp-grid">
                <Form.Item name="gender" label={t("recordApplication.fields.sex")}>
                  <Radio.Group
                    options={[
                      { label: t("recordApplication.fields.female"), value: "female" },
                      { label: t("recordApplication.fields.male"), value: "male" },
                    ]}
                    optionType="button"
                  />
                </Form.Item>
                <Form.Item name="pool" label={t("recordApplication.fields.pool")}>
                  <Radio.Group
                    options={[
                      { label: "25m", value: "25" },
                      { label: "50m", value: "50" },
                    ]}
                    optionType="button"
                  />
                </Form.Item>
              </div>

              <div className="pfm-recapp-grid">
                <Form.Item
                  name="category"
                  label={t("recordApplication.fields.category")}
                  rules={[{ required: true, message: t("recordApplication.errors.required") }]}
                >
                  <Select
                    options={(options?.categories ?? []).map((c) => ({ label: c, value: c }))}
                    placeholder={t("recordApplication.fields.categoryPlaceholder")}
                  />
                </Form.Item>
                <Form.Item
                  name="discipline"
                  label={t("recordApplication.fields.discipline")}
                  rules={[{ required: true, message: t("recordApplication.errors.required") }]}
                >
                  <Select
                    disabled={!category}
                    options={(options?.disciplines?.[category] ?? []).map((d) => ({
                      label: d,
                      value: d,
                    }))}
                    placeholder={t("recordApplication.fields.disciplinePlaceholder")}
                  />
                </Form.Item>
              </div>

              <div className="pfm-recapp-grid">
                <Form.Item
                  name="time"
                  label={t("recordApplication.fields.time")}
                  extra={t("recordApplication.fields.timeHint")}
                  rules={[
                    { required: true, message: t("recordApplication.errors.required") },
                    { pattern: TIME_RE, message: t("recordApplication.errors.timeFormat") },
                  ]}
                >
                  <Input placeholder="0:26.34" />
                </Form.Item>
                <Form.Item
                  name="proofUrl"
                  label={t("recordApplication.fields.proofUrl")}
                  rules={[
                    { required: true, message: t("recordApplication.errors.required") },
                    { type: "url", message: t("recordApplication.errors.urlFormat") },
                  ]}
                >
                  <Input placeholder="https://..." />
                </Form.Item>
              </div>

              {mutation.isError && (
                <Alert
                  className="pfm-recapp-error"
                  type="error"
                  showIcon
                  message={mutation.error?.message || t("recordApplication.errors.submitFailed")}
                />
              )}

              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={mutation.isPending}
                className="pfm-recapp-submit"
              >
                {t("recordApplication.submit")} <FiSend />
              </Button>
            </Form>
          </div>
        </Reveal>
      </div>
    </div>
  );
};

export default RecordApplication;
