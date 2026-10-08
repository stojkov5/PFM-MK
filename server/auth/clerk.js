// server/auth/clerk.js
import { clerkMiddleware, clerkClient, getAuth } from "@clerk/express";

// A Clerk user is an admin when their public metadata contains { "role": "admin" }.
// Public metadata can only be written from the Clerk dashboard or the backend API,
// so users can't grant it to themselves.
export const ADMIN_ROLE = "admin";

export const isAdmin = (user) => user?.publicMetadata?.role === ADMIN_ROLE;

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
