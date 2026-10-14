// server/routes/competitions.js
// Public calendar API: the approved competitions, the registration window,
// and the clubs' submission form (no login — each submission gets a secret
// edit link that is emailed to the club).
import { Router } from "express";
import {
  OPEN_STATUSES,
  findClub,
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

export const competitionsRouter = (db, { mailer, allowedOrigins = [], writeLimit = noLimit } = {}) => {
  const router = Router();

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

  router.post("/", writeLimit, async (req, res) => {
    const sport = pickSport(req.body?.sport);
    const window = await currentWindow(sport);
    if (window.status !== "open") {
      return res.status(403).json({ error: "Registration is closed", window });
    }

    const v = validateCompetition(req.body);
    if (!v.ok) return res.status(400).json({ error: "Invalid fields", errors: v.errors });

    const created = await db.competition.create({
      data: { ...v.data, sport, status: "pending", source: "club", editToken: newEditToken() },
    });

    const site = siteUrl(req, allowedOrigins);
    await Promise.all([
      mailer.send({ to: clubRecipients(created, findClub(created.clubId)), ...submittedEmail(created, site) }),
      mailer.send({ to: mailer.federation, ...federationNoticeEmail(created, site) }),
    ]);
    res.status(201).json({ id: created.id, editToken: created.editToken });
  });

  // --- The club's edit link -------------------------------------------------

  const byToken = (token) =>
    typeof token === "string" && token.length >= 20
      ? db.competition.findUnique({ where: { editToken: token } })
      : null;

  // Clubs can edit while the admin asks for changes, or while it's still
  // pending and the window is open. Decided submissions are read-only.
  const canEdit = (c, window) =>
    c.status === "changes" || (c.status === "pending" && window.status === "open");

  router.get("/edit/:token", async (req, res) => {
    const c = await byToken(req.params.token);
    if (!c) return res.status(404).json({ error: "Not found" });
    const window = await currentWindow(c.sport);
    const messages = await db.competitionMessage.findMany({
      where: { competitionId: c.id },
      orderBy: { createdAt: "desc" },
      select: { kind: true, body: true, createdAt: true },
    });
    res.json({ competition: toFullDto(c), messages, canEdit: canEdit(c, window), window });
  });

  router.put("/edit/:token", writeLimit, async (req, res) => {
    const c = await byToken(req.params.token);
    if (!c) return res.status(404).json({ error: "Not found" });
    if (!OPEN_STATUSES.includes(c.status) || !canEdit(c, await currentWindow(c.sport))) {
      return res.status(409).json({ error: "This submission can no longer be edited" });
    }

    const v = validateCompetition(req.body);
    if (!v.ok) return res.status(400).json({ error: "Invalid fields", errors: v.errors });

    const updated = await db.competition.update({
      where: { id: c.id },
      data: { ...v.data, status: "pending" },
    });
    await mailer.send({
      to: mailer.federation,
      ...federationNoticeEmail(updated, siteUrl(req, allowedOrigins), { updated: true }),
    });
    res.json({ ok: true });
  });

  return router;
};
