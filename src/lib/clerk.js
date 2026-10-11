// src/lib/clerk.js
// Clerk (accounts + admin login) settings shared by the whole site.

// Unset = accounts are switched off: no account button, and /admin explains
// how to configure it.
export const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// A Clerk user is an admin when their public metadata contains this role (see
// server/auth/clerk.js). On the site it only decides whether the "Admin panel"
// link is shown — the API checks the role itself on every admin request.
export const isAdminUser = (user) => user?.publicMetadata?.role === "admin";

// Matches the site's dark navy + sky-blue look.
export const clerkAppearance = {
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
