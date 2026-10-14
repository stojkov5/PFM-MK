// server/routes/adminCompetitions.js
// Admin side of the calendar: review club submissions (approve, ask for
// changes, deny — each emails the club), add/edit/delete competitions, and set
// the registration window. Mounted under /api/admin, so requireAdmin applies.
// The /window routes come before /:id so "window" isn't read as an id.
import { Router } from "express";
import {
  OPEN_STATUSES,
  STATUSES,
  findClub,
  newEditToken,
  overlaps,
  pickSport,
  toFullDto,
  validateCompetition,
  windowState,
} from "../lib/competitions.js";
import {
  approvedEmail,
  changesEmail,
  clubRecipients,
  deniedEmail,
  fmtRange,
} from "../lib/competitionEmails.js";
import { siteUrl } from "./competitions.js";

const MAX_MESSAGE = 3000;

export const adminCompetitionsRouter = (db, { mailer, allowedOrigins = [] } = {}) => {
  const router = Router();

  router.get("/counts", async (req, res) => {
    const sport = pickSport(req.query.sport);
    const counts = await Promise.all(
      STATUSES.map((status) => db.competition.count({ where: { sport, status } }))
    );
    res.json(Object.fromEntries(STATUSES.map((s, i) => [s, counts[i]])));
  });

  // --- Registration window ---------------------------------------------------

  router.get("/window", async (req, res) => {
    const w = await db.competitionWindow.findUnique({ where: { sport: pickSport(req.query.sport) } });
    res.json(windowState(w));
  });

  router.put("/window", async (req, res) => {
    const sport = pickSport(req.body?.sport);
    const opensAt = new Date(req.body?.opensAt);
    const closesAt = new Date(req.body?.closesAt);
    const season = Number(req.body?.season);
    if (Number.isNaN(opensAt.getTime()) || Number.isNaN(closesAt.getTime()) || closesAt <= opensAt) {
      return res.status(400).json({ error: "Pick a start and an end date" });
    }
    if (!Number.isInteger(season) || season < 2000 || season > 2100) {
      return res.status(400).json({ error: "Invalid season" });
    }
    const data = { season, opensAt, closesAt };
    const existing = await db.competitionWindow.findUnique({ where: { sport } });
    const w = existing
      ? await db.competitionWindow.update({ where: { sport }, data })
      : await db.competitionWindow.create({ data: { sport, ...data } });
    res.json(windowState(w));
  });

  // Closes registration right away (keeps the dates' season).
  router.post("/window/close", async (req, res) => {
    const sport = pickSport(req.body?.sport);
    const existing = await db.competitionWindow.findUnique({ where: { sport } });
    if (!existing) return res.status(404).json({ error: "No registration window set" });
    const now = new Date();
    const w = await db.competitionWindow.update({
      where: { sport },
      data: { closesAt: now, opensAt: existing.opensAt < now ? existing.opensAt : now },
    });
    res.json(windowState(w));
  });

  // Competitions with one status, each with the other (not denied)
  // competitions whose dates overlap it, and the messages sent to the club.
  router.get("/", async (req, res) => {
    const sport = pickSport(req.query.sport);
    const status = STATUSES.includes(req.query.status) ? req.query.status : "pending";
    const active = await db.competition.findMany({
      where: { sport, status: { not: "denied" } },
      orderBy: [{ startDate: "asc" }, { id: "asc" }],
    });
    const list =
      status === "denied"
        ? await db.competition.findMany({
            where: { sport, status },
            orderBy: [{ startDate: "asc" }, { id: "asc" }],
          })
        : active.filter((c) => c.status === status);

    const messages = await db.competitionMessage.findMany({
      where: { competitionId: { in: list.map((c) => c.id) } },
      orderBy: { createdAt: "desc" },
    });

    res.json(
      list.map((c) => ({
        ...toFullDto(c),
        overlaps: active
          .filter((o) => overlaps(c, o))
          .map((o) => ({ ...toFullDto(o), range: fmtRange(o) })),
        messages: messages.filter((m) => m.competitionId === c.id),
      }))
    );
  });

  // Admins add competitions directly to the calendar (approved right away).
  router.post("/", async (req, res) => {
    const v = validateCompetition(req.body, { admin: true });
    if (!v.ok) return res.status(400).json({ error: "Invalid fields", errors: v.errors });
    const created = await db.competition.create({
      data: {
        ...v.data,
        sport: pickSport(req.body?.sport),
        status: "approved",
        source: "admin",
        editToken: newEditToken(),
        ...reviewedBy(req),
      },
    });
    res.status(201).json({ id: created.id });
  });

  router.put("/:id", async (req, res) => {
    const c = await find(req);
    if (!c) return res.status(404).json({ error: "Not found" });
    const v = validateCompetition(req.body, { admin: true });
    if (!v.ok) return res.status(400).json({ error: "Invalid fields", errors: v.errors });
    await db.competition.update({ where: { id: c.id }, data: v.data });
    res.json({ ok: true });
  });

  router.delete("/:id", async (req, res) => {
    const c = await find(req);
    if (!c) return res.status(404).json({ error: "Not found" });
    await db.competitionMessage.deleteMany({ where: { competitionId: c.id } });
    await db.competition.delete({ where: { id: c.id } });
    res.json({ ok: true });
  });

  // --- Review actions --------------------------------------------------------
  // approve: message optional · changes: message required · deny: optional

  const ACTIONS = {
    approve: { status: "approved", email: approvedEmail, needsMessage: false },
    changes: { status: "changes", email: changesEmail, needsMessage: true },
    deny: { status: "denied", email: deniedEmail, needsMessage: false },
  };

  router.post("/:id/:action", async (req, res, next) => {
    const action = ACTIONS[req.params.action];
    if (!action) return next();

    const message = String(req.body?.message ?? "").trim();
    if (action.needsMessage && !message) return res.status(400).json({ error: "Write a message to the club" });
    if (message.length > MAX_MESSAGE) return res.status(400).json({ error: "The message is too long" });

    const c = await find(req);
    if (!c) return res.status(404).json({ error: "Not found" });
    if (!OPEN_STATUSES.includes(c.status)) return res.status(409).json({ error: "Already reviewed" });

    const updated = await db.competition.update({
      where: { id: c.id },
      data: { status: action.status, ...reviewedBy(req) },
    });

    const to = clubRecipients(updated, findClub(updated.clubId));
    const emailed =
      to.length > 0 &&
      (await mailer.send({ to, ...action.email(updated, siteUrl(req, allowedOrigins), message) }));

    if (message) {
      await db.competitionMessage.create({
        data: {
          competitionId: c.id,
          kind: action.status,
          body: message,
          authorName: reviewedBy(req).reviewerName,
          emailed,
        },
      });
    }
    res.json({ ok: true, emailed });
  });

  // --- helpers ---------------------------------------------------------------

  function find(req) {
    const id = Number(req.params.id);
    return Number.isInteger(id) ? db.competition.findUnique({ where: { id } }) : null;
  }

  function reviewedBy(req) {
    return {
      reviewedAt: new Date(),
      reviewerId: req.admin.id,
      reviewerName: req.admin.name ?? req.admin.email,
    };
  }

  return router;
};
