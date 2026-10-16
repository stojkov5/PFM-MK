// server/auth/clerk.js
import { clerkMiddleware, clerkClient, getAuth } from "@clerk/express";

// A Clerk user is an admin when their public metadata contains { "role": "admin" }.
// Public metadata can only be written from the Clerk dashboard or the backend API,
// so users can't grant it to themselves.
export const ADMIN_ROLE = "admin";

export const isAdmin = (user) => user?.publicMetadata?.role === ADMIN_ROLE;

// A club account is a Clerk user whose public metadata contains
//   { "accountType": "club", "clubId": 5, "clubStatus": "approved" }
// clubId points at a Club row. clubStatus is "approved" for accounts
// the federation created (npm run clubs:create) and for sign-ups an admin
// approved; "pending" while a sign-up waits for review.
// Kept apart from `role` so an admin flag and a club link never overwrite each other.
export const CLUB_ACCOUNT = "club";
export const CLUB_STATUSES = ["pending", "approved"];

export const clubLinkOf = (user) => {
  const m = user?.publicMetadata ?? {};
  if (m.accountType !== CLUB_ACCOUNT || !Number.isInteger(m.clubId)) return null;
  return { clubId: m.clubId, status: CLUB_STATUSES.includes(m.clubStatus) ? m.clubStatus : "pending" };
};

export const clubMetadata = (clubId, status = "approved") => ({
  accountType: CLUB_ACCOUNT,
  clubId,
  clubStatus: status,
});

export const toAdminDto = (user) => ({
  id: user.id,
  name: [user.firstName, user.lastName].filter(Boolean).join(" ") || null,
  email:
    user.primaryEmailAddress?.emailAddress ?? user.emailAddresses?.[0]?.emailAddress ?? null,
  imageUrl: user.imageUrl ?? null,
  lastSignInAt: user.lastSignInAt ?? null,
});

// The auth "adapter" the app uses. Tests swap this for a fake with the same shape.
//   middleware  — parses the Clerk session token from the Authorization header
//   getUserId   — the signed-in Clerk user id for a request, or null
//   client      — Clerk Backend API client (users, invitations)
export const createClerkAuth = ({ authorizedParties } = {}) => ({
  middleware: clerkMiddleware(
    authorizedParties?.length ? { authorizedParties } : undefined
  ),
  getUserId: (req) => getAuth(req).userId ?? null,
  client: clerkClient,
});
