import React from "react";
import { Form, Input, Button, Alert } from "antd";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { apiPost } from "../../lib/api.js";
import "./admin.css";

const AdminLogin = () => {
  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: (values) => apiPost("/api/auth/login", values),
    onSuccess: () => navigate("/admin/applications"),
  });

  return (
    <div className="pfm-admin pt-24">
      <div className="pfm-admin-login-wrap">
        <div className="pfm-admin-card">
          <h1 className="pfm-admin-title">Admin login</h1>
          <Form layout="vertical" requiredMark={false} onFinish={(v) => mutation.mutate(v)}>
            <Form.Item name="username" label="Username" rules={[{ required: true }]}>
              <Input autoComplete="username" />
            </Form.Item>
            <Form.Item name="password" label="Password" rules={[{ required: true }]}>
              <Input.Password autoComplete="current-password" />
            </Form.Item>
            {mutation.isError && (
              <Alert className="pfm-admin-error" type="error" showIcon message="Invalid credentials" />
            )}
            <Button type="primary" htmlType="submit" block loading={mutation.isPending}>
              Log in
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
