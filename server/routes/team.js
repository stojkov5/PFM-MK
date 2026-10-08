// server/routes/team.js
import { Router } from "express";
import { ADMIN_ROLE, isAdmin, toAdminDto } from "../auth/clerk.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Clerk API errors carry a human-readable message in errors[0].longMessage.
const clerkMessage = (err, fallback) =>
  err?.errors?.[0]?.longMessage ?? err?.errors?.[0]?.message ?? fallback;

// Where the invitation email's link should land. Clerk appends __clerk_ticket,
// and the /admin page turns that into a sign-up form. Only origins we trust
// (CLIENT_ORIGIN, or localhost in dev) are used; otherwise Clerk's hosted
// sign-up page is used as a fallback.
const inviteRedirectUrl = (req, allowedOrigins) => {
  const origin = req.get("origin");
  const trusted = allowedOrigins.length
    ? allowedOrigins.includes(origin)
    : /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin ?? "");
  if (trusted) return `${origin}/admin`;
  return allowedOrigins[0] ? `${allowedOrigins[0]}/admin` : undefined;
};

export const teamRouter = (auth, { allowedOrigins = [] } = {}) => {
  const router = Router();
  const clerk = auth.client;

  router.get("/", async (req, res) => {
    const [users, invitations] = await Promise.all([
      clerk.users.getUserList({ limit: 500, orderBy: "-created_at" }),
      clerk.invitations.getInvitationList({ status: "pending" }),
    ]);
    res.json({
      admins: users.data.filter(isAdmin).map(toAdminDto),
      invitations: invitations.data
        .filter((i) => i.publicMetadata?.role === ADMIN_ROLE)
        .map((i) => ({ id: i.id, email: i.emailAddress, createdAt: i.createdAt })),
    });
  });

  // Add an admin by email: an existing Clerk user gets the role immediately,
  // anyone else gets an invitation email (and the role once they sign up).
  router.post("/", async (req, res) => {
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: "Invalid email address" });

    try {
      const existing = await clerk.users.getUserList({ emailAddress: [email], limit: 1 });
      const user = existing.data[0];
      if (user) {
        if (isAdmin(user)) return res.status(409).json({ error: "This user is already an admin" });
        await clerk.users.updateUserMetadata(user.id, { publicMetadata: { role: ADMIN_ROLE } });
        return res.json({ status: "granted" });
      }

      await clerk.invitations.createInvitation({
        emailAddress: email,
        publicMetadata: { role: ADMIN_ROLE },
        redirectUrl: inviteRedirectUrl(req, allowedOrigins),
        notify: true,
        ignoreExisting: true,
      });
      res.status(201).json({ status: "invited" });
    } catch (err) {
      res.status(400).json({ error: clerkMessage(err, "Could not add admin") });
    }
  });

  router.delete("/admins/:userId", async (req, res) => {
    if (req.params.userId === req.admin.id) {
      return res.status(400).json({ error: "You can't remove your own admin access" });
    }
    try {
      // Deep merge: setting the key to null removes it.
      await clerk.users.updateUserMetadata(req.params.userId, { publicMetadata: { role: null } });
      res.json({ ok: true });
    } catch (err) {
      res.status(400).json({ error: clerkMessage(err, "Could not remove admin") });
    }
  });

  router.delete("/invitations/:id", async (req, res) => {
    try {
      await clerk.invitations.revokeInvitation(req.params.id);
      res.json({ ok: true });
    } catch (err) {
      res.status(400).json({ error: clerkMessage(err, "Could not revoke invitation") });
    }
  });

  return router;
};
