// src/pages/Swimming/RecordApplicationForm.jsx
// The "apply for a national record" form. Used on its own page and in the
// dialog on the records page. A submitted application waits in the admin
// panel; the record list only changes once an admin approves it.
import React, { useState } from "react";
import { Form, Input, Radio, Select, Button, Alert, Result, ConfigProvider } from "antd";
import { FiSend } from "react-icons/fi";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { apiGet, apiPost } from "../../lib/api.js";
import { antDarkTheme } from "../../lib/antDarkTheme.js";
import "./RecordApplication.css";

const TIME_RE = /^\d{1,2}:\d{2}\.\d{2}$/;

/**
 * @param initialPool / initialGender  preselected list ("25"|"50", "female"|"male")
 * @param onClose  when given, the success screen offers a Close button
 */
const RecordApplicationForm = ({ initialPool = "25", initialGender = "female", onClose }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [submitted, setSubmitted] = useState(false);

  const gender = Form.useWatch("gender", form) ?? initialGender;
  const pool = Form.useWatch("pool", form) ?? initialPool;
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
        competition: values.competition,
        location: values.location,
        proofUrl: values.proofUrl,
      }),
    onSuccess: () => setSubmitted(true),
  });

  const required = { required: true, message: t("recordApplication.errors.required") };

  if (submitted) {
    return (
      <ConfigProvider theme={antDarkTheme}>
        <Result
          status="success"
          title={t("recordApplication.success.title")}
          subTitle={t("recordApplication.success.text")}
          extra={[
            <Button
              key="another"
              onClick={() => {
                form.resetFields();
                mutation.reset();
                setSubmitted(false);
              }}
            >
              {t("recordApplication.success.another")}
            </Button>,
            onClose && (
              <Button key="close" type="primary" onClick={onClose}>
                {t("recordApplication.success.close")}
              </Button>
            ),
          ]}
        />
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider theme={antDarkTheme}>
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={{ gender: initialGender, pool: initialPool }}
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
            rules={[required, { max: 100 }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="lastName"
            label={t("recordApplication.fields.lastName")}
            rules={[required, { max: 100 }]}
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
            rules={[required]}
          >
            <Select
              options={(options?.categories ?? []).map((c) => ({ label: c, value: c }))}
              placeholder={t("recordApplication.fields.categoryPlaceholder")}
            />
          </Form.Item>
          <Form.Item
            name="discipline"
            label={t("recordApplication.fields.discipline")}
            rules={[required]}
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

        <Form.Item
          name="time"
          label={t("recordApplication.fields.time")}
          extra={t("recordApplication.fields.timeHint")}
          rules={[required, { pattern: TIME_RE, message: t("recordApplication.errors.timeFormat") }]}
        >
          <Input placeholder="0:26.34" />
        </Form.Item>

        <div className="pfm-recapp-grid">
          <Form.Item
            name="competition"
            label={t("recordApplication.fields.competition")}
            rules={[required, { max: 200 }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="location"
            label={t("recordApplication.fields.location")}
            rules={[required, { max: 200 }]}
          >
            <Input placeholder={t("recordApplication.fields.locationPlaceholder")} />
          </Form.Item>
        </div>

        <Form.Item
          name="proofUrl"
          label={t("recordApplication.fields.proofUrl")}
          rules={[required, { type: "url", message: t("recordApplication.errors.urlFormat") }]}
        >
          <Input placeholder="https://..." />
        </Form.Item>

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
    </ConfigProvider>
  );
};

export default RecordApplicationForm;
