// server/routes/account.js
// The signed-in user's own account. After signing up, everyone picks what the
// account is for: "athlete" (swimmer / water polo player — nothing more to
// do yet) or "club", which sends the club's details for an admin to approve.
// The choice is stored in Clerk public metadata (see auth/clerk.js), which
// only the server can write — and so is the newsletter subscription.
import { Router } from "express";
import { CLUB_ACCOUNT, clubLinkOf, clubMetadata, toAdminDto } from "../auth/clerk.js";
import {
  findClub,
  findClubByName,
  nextClubId,
  toFullClub,
  validateClubApplication,
} from "../lib/clubs.js";
import { clubApplicationEmail, clubApplicationReceivedEmail } from "../lib/clubEmails.js";
import { isSubscribed } from "../lib/newsEmails.js";
import { siteUrl } from "./competitions.js";

export const ATHLETE_ACCOUNT = "athlete";
const noLimit = (req, res, next) => next();

export const accountRouter = (db, auth, { mailer, allowedOrigins = [], writeLimit = noLimit } = {}) => {
  const router = Router();

  router.use(auth.middleware, async (req, res, next) => {
    const userId = auth.getUserId(req);
    if (!userId) return res.status(401).json({ error: "Not authenticated" });
    try {
      req.user = await auth.client.users.getUser(userId);
    } catch {
      return res.status(401).json({ error: "Not authenticated" });
    }
    next();
  });

  const accountTypeOf = (user) => user.publicMetadata?.accountType ?? null;

  // { accountType, club, newsletter } — club is the account's club with its
  // status, or null; newsletter is whether the account gets news by email.
  router.get("/", async (req, res) => {
    const link = clubLinkOf(req.user);
    const club = link ? await findClub(db, link.clubId) : null;
    res.json({
      accountType: accountTypeOf(req.user),
      club: club ? { ...toFullClub(club), accountStatus: link.status } : null,
      newsletter: isSubscribed(req.user),
    });
  });

  // Subscribe ({ subscribed: true }) or unsubscribe from news emails.
  router.post("/newsletter", async (req, res) => {
    if (typeof req.body?.subscribed !== "boolean") {
      return res.status(400).json({ error: "subscribed must be true or false" });
    }
    // null removes the key from Clerk's metadata.
    await auth.client.users.updateUserMetadata(req.user.id, {
      publicMetadata: { newsletter: req.body.subscribed || null },
    });
    res.json({ newsletter: req.body.subscribed });
  });

  router.post("/athlete", writeLimit, async (req, res) => {
    if (accountTypeOf(req.user)) {
      return res.status(409).json({ error: "The account type is already chosen" });
    }
    await auth.client.users.updateUserMetadata(req.user.id, {
      publicMetadata: { accountType: ATHLETE_ACCOUNT },
    });
    res.json({ accountType: ATHLETE_ACCOUNT });
  });

  // A new club signs up. The club is stored as "pending" and the account is
  // linked to it right away (also pending); an admin approves or rejects both.
  router.post("/club", writeLimit, async (req, res) => {
    if (accountTypeOf(req.user)) {
      return res.status(409).json({ error: "The account type is already chosen" });
    }
    const v = validateClubApplication(req.body);
    if (!v.ok) return res.status(400).json({ error: "Invalid fields", errors: v.errors });
    if (await findClubByName(db, v.data.name)) {
      return res.status(409).json({ error: "A club with this name already exists", errors: ["name"] });
    }

    const by = toAdminDto(req.user);
    const club = await db.club.create({
      data: { ...v.data, id: await nextClubId(db), status: "pending", createdBy: req.user.id },
    });
    await auth.client.users.updateUserMetadata(req.user.id, {
      publicMetadata: clubMetadata(club.id, "pending"),
    });

    const site = siteUrl(req, allowedOrigins);
    await Promise.all([
      mailer.send({ to: mailer.federation, ...clubApplicationEmail(club, site, by) }),
      mailer.send({ to: [club.email, by.email], ...clubApplicationReceivedEmail(club) }),
    ]);
    res.status(201).json({ accountType: CLUB_ACCOUNT, club: { ...toFullClub(club), accountStatus: "pending" } });
  });

  return router;
};
