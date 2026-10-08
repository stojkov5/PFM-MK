// src/pages/Admin/AdminRoot.jsx
// Entry point for /admin. Loaded lazily (see routes.jsx) so Clerk is only
// downloaded by people who actually open the admin panel.
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ClerkProvider, SignIn, SignUp, SignOutButton, useAuth, useUser } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { App as AntApp, Button, ConfigProvider, Result, Spin, theme } from "antd";
import { useAdminApi } from "./useAdminApi.js";
import AdminPanel from "./AdminPanel.jsx";
import "./admin.css";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Matches the site's dark navy + sky-blue look.
const clerkAppearance = {
  variables: {
    colorPrimary: "#38bdf8",
    colorPrimaryForeground: "#020617",
    colorBackground: "#0b1324",
    colorForeground: "#e2e8f0",
    colorMutedForeground: "#94a3b8",
    colorInput: "#0f1a2e",
    colorInputForeground: "#f1f5f9",
    colorNeutral: "#cbd5e1",
    borderRadius: "12px",
  },
};

const antTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: "#38bdf8",
    colorBgContainer: "#0b1324",
    colorBgElevated: "#0f1a2e",
    borderRadius: 10,
  },
};

const Centered = ({ children }) => <div className="pfm-admin-center">{children}</div>;

const AdminSignIn = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  // Invitation links land here with __clerk_ticket; new people need the sign-up form.
  const invited = params.has("__clerk_ticket") && params.get("__clerk_status") !== "sign_in";

  return (
    <Centered>
      {invited ? (
        <SignUp routing="hash" fallbackRedirectUrl="/admin" signInUrl="/admin" />
      ) : (
        <SignIn routing="hash" fallbackRedirectUrl="/admin" />
      )}
    </Centered>
  );
};

const NoAccess = () => {
  const { user } = useUser();
  return (
    <Centered>
      <Result
        status="403"
        title="No admin access"
        subTitle={
          <>
            You're signed in as <b>{user?.primaryEmailAddress?.emailAddress}</b>, but this
            account isn't an admin. Ask an existing admin to add you.
          </>
        }
        extra={
          <SignOutButton>
            <Button>Sign out</Button>
          </SignOutButton>
        }
      />
    </Centered>
  );
};

const AdminGate = () => {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const api = useAdminApi();

  const me = useQuery({
    queryKey: ["admin-me", userId],
    queryFn: () => api.get("/api/admin/me"),
    enabled: !!isSignedIn,
    retry: false,
  });

  if (!isLoaded) return <Centered><Spin size="large" /></Centered>;
  if (!isSignedIn) return <AdminSignIn />;
  if (me.isPending) return <Centered><Spin size="large" /></Centered>;
  if (me.error?.status === 403) return <NoAccess />;
  if (me.isError) {
    return (
      <Centered>
        <Result
          status="error"
          title="Couldn't reach the server"
          subTitle={me.error.message}
          extra={<Button onClick={() => me.refetch()}>Try again</Button>}
        />
      </Centered>
    );
  }
  return <AdminPanel me={me.data} />;
};

const AdminRoot = () => {
  const navigate = useNavigate();

  return (
    <ConfigProvider theme={antTheme}>
      <AntApp>
        <div className="pfm-admin pt-24">
          {PUBLISHABLE_KEY ? (
            <ClerkProvider
              publishableKey={PUBLISHABLE_KEY}
              appearance={clerkAppearance}
              afterSignOutUrl="/admin"
              routerPush={(to) => navigate(to)}
              routerReplace={(to) => navigate(to, { replace: true })}
            >
              <AdminGate />
            </ClerkProvider>
          ) : (
            <Centered>
              <Result
                status="warning"
                title="Admin login isn't configured"
                subTitle="Set VITE_CLERK_PUBLISHABLE_KEY in .env (or in Vercel) and rebuild."
              />
            </Centered>
          )}
        </div>
      </AntApp>
    </ConfigProvider>
  );
};

export default AdminRoot;
