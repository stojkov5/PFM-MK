// src/lib/clerk.js
// Clerk (accounts + admin login) settings shared by the whole site.

// Unset = accounts are switched off: no account button, and /admin explains
// how to configure it.
export const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Where people land right after creating an account: they choose whether the
// account is for a swimmer / player or for a club (pages/Welcome).
export const SIGN_UP_REDIRECT = "/welcome";

// The account type chosen on /welcome ("athlete" or "club"), or null.
export const accountTypeOfUser = (user) => user?.publicMetadata?.accountType ?? null;

// A Clerk user is an admin when their public metadata contains this role (see
// server/auth/clerk.js). On the site it only decides whether the "Admin panel"
// link is shown — the API checks the role itself on every admin request.
export const isAdminUser = (user) => user?.publicMetadata?.role === "admin";

// The club a signed-in account belongs to: { clubId, status } or null (see
// clubLinkOf in server/auth/clerk.js). Only approved club accounts may act
// for their club; the API checks this again on every club request.
export const clubLinkOfUser = (user) => {
  const m = user?.publicMetadata ?? {};
  if (m.accountType !== "club" || !Number.isInteger(m.clubId)) return null;
  return { clubId: m.clubId, status: m.clubStatus === "approved" ? "approved" : "pending" };
};

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
