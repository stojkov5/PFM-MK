// server/routes/competitions.js
// Calendar API: the approved competitions and the registration window are
// public; submitting and editing competitions needs an approved club account
// (see middleware/requireClub.js), which only ever acts for its own club.
import { Router } from "express";
import { requireClub } from "../middleware/requireClub.js";
import {
  OPEN_STATUSES,
  newEditToken,
  pickSport,
  toFullDto,
  toPublicDto,
  validateCompetition,
  windowState,
} from "../lib/competitions.js";
import {
  clubRecipients,
  federationNoticeEmail,
  submittedEmail,
} from "../lib/competitionEmails.js";

const noLimit = (req, res, next) => next();

// Base URL of the website, for links in emails.
export const siteUrl = (req, allowedOrigins = []) => {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  const origin = req.get("origin");
  if (origin && allowedOrigins.includes(origin)) return origin;
  if (allowedOrigins[0]) return allowedOrigins[0];
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin ?? "")) return origin;
  return "https://npf.mk";
};

export const competitionsRouter = (
  db,
  { auth, mailer, allowedOrigins = [], writeLimit = noLimit } = {}
) => {
  const router = Router();
  const clubOnly = [auth.middleware, requireClub(auth, db)];

  const currentWindow = async (sport) =>
    windowState(await db.competitionWindow.findUnique({ where: { sport } }));

  // Approved competitions of one year (default: this year), plus the years
  // that have any, for the year picker.
  router.get("/", async (req, res) => {
    const sport = pickSport(req.query.sport);
    const all = await db.competition.findMany({
      where: { sport, status: "approved" },
      orderBy: [{ startDate: "asc" }, { id: "asc" }],
    });
    const years = [...new Set(all.map((c) => c.startDate.getUTCFullYear()))];
    const year = Number(req.query.year) || null;
    const list = year ? all.filter((c) => c.startDate.getUTCFullYear() === year) : all;
    res.json({ years, competitions: list.map(toPublicDto) });
  });

  router.get("/window", async (req, res) => {
    res.json(await currentWindow(pickSport(req.query.sport)));
  });

  router.post("/", writeLimit, ...clubOnly, async (req, res) => {
    const sport = pickSport(req.body?.sport);
    const window = await currentWindow(sport);
    if (window.status !== "open") {
      return res.status(403).json({ error: "Registration is closed", window });
    }

    // The organizer is always the signed-in club, whatever the body says.
    const v = validateCompetition(req.body, { club: req.club });
    if (!v.ok) return res.status(400).json({ error: "Invalid fields", errors: v.errors });

    const created = await db.competition.create({
      // editToken is no longer used (clubs edit from their account) but the
      // column is required and unique, so every row still gets one.
      data: { ...v.data, sport, status: "pending", source: "club", editToken: newEditToken() },
    });

    const site = siteUrl(req, allowedOrigins);
    await Promise.all([
      mailer.send({ to: clubRecipients(created, req.club), ...submittedEmail(created, site) }),
      mailer.send({
        to: mailer.federation,
        ...federationNoticeEmail(created, site, { by: req.clubUser.email }),
      }),
    ]);
    res.status(201).json({ id: created.id });
  });

  // --- The club's own competitions -------------------------------------------

  // Clubs can edit while the admin asks for changes, or while it's still
  // pending and the window is open. Decided submissions are read-only.
  const canEdit = (c, window) =>
    c.status === "changes" || (c.status === "pending" && window.status === "open");

  const withReview = async (list) => {
    const messages = await db.competitionMessage.findMany({
      where: { competitionId: { in: list.map((c) => c.id) } },
      orderBy: { createdAt: "desc" },
      select: { competitionId: true, kind: true, body: true, createdAt: true },
    });
    const windows = new Map();
    for (const sport of new Set(list.map((c) => c.sport))) windows.set(sport, await currentWindow(sport));
    return list.map((c) => ({
      ...toFullDto(c),
      canEdit: canEdit(c, windows.get(c.sport)),
      messages: messages
        .filter((m) => m.competitionId === c.id)
        .map(({ kind, body, createdAt }) => ({ kind, body, createdAt })),
    }));
  };

  const findOwn = (req) => {
    const id = Number(req.params.id);
    return Number.isInteger(id)
      ? db.competition.findFirst({ where: { id, clubId: req.club.id } })
      : null;
  };

  // Everything the club has submitted (and what admins added for it), newest
  // dates first.
  router.get("/mine", ...clubOnly, async (req, res) => {
    const list = await db.competition.findMany({
      where: { clubId: req.club.id },
      orderBy: [{ startDate: "desc" }, { id: "desc" }],
    });
    res.json({ club: { id: req.club.id, name: req.club.name }, competitions: await withReview(list) });
  });

  router.get("/mine/:id", ...clubOnly, async (req, res) => {
    const c = await findOwn(req);
    if (!c) return res.status(404).json({ error: "Not found" });
    const [competition] = await withReview([c]);
    res.json(competition);
  });

  router.put("/mine/:id", writeLimit, ...clubOnly, async (req, res) => {
    const c = await findOwn(req);
    if (!c) return res.status(404).json({ error: "Not found" });
    if (!OPEN_STATUSES.includes(c.status) || !canEdit(c, await currentWindow(c.sport))) {
      return res.status(409).json({ error: "This submission can no longer be edited" });
    }

    const v = validateCompetition(req.body, { club: req.club });
    if (!v.ok) return res.status(400).json({ error: "Invalid fields", errors: v.errors });

    const updated = await db.competition.update({
      where: { id: c.id },
      data: { ...v.data, status: "pending" },
    });
    await mailer.send({
      to: mailer.federation,
      ...federationNoticeEmail(updated, siteUrl(req, allowedOrigins), {
        updated: true,
        by: req.clubUser.email,
      }),
    });
    res.json({ ok: true });
  });

  return router;
};
