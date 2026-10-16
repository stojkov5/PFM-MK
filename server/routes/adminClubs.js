// server/routes/adminClubs.js
// Admin side of clubs: review clubs that signed up (approve → public + the
// account can register competitions; reject → the club and its sign-up
// account are deleted) and edit any club's details. Mounted under
// /api/admin/clubs, so requireAdmin applies.
import { Router } from "express";
import { clubLinkOf, isAdmin, toAdminDto } from "../auth/clerk.js";
import { findClub, findClubByName, toFullClub, validateClubApplication } from "../lib/clubs.js";
import { clubApprovedEmail, clubRejectedEmail } from "../lib/clubEmails.js";
import { siteUrl } from "./competitions.js";

const STATUSES = ["pending", "approved"];
const MAX_MESSAGE = 3000;

export const adminClubsRouter = (db, auth, { mailer, allowedOrigins = [] } = {}) => {
  const router = Router();
  const clerk = auth.client;

  // Clerk accounts linked to each club id. Clerk can't filter by metadata,
  // so all users are read (fine for a federation-sized user list).
  const accountsByClub = async () => {
    const { data } = await clerk.users.getUserList({ limit: 500 });
    const map = new Map();
    for (const user of data) {
      const link = clubLinkOf(user);
      if (!link) continue;
      if (!map.has(link.clubId)) map.set(link.clubId, []);
      map.get(link.clubId).push({ user, status: link.status });
    }
    return map;
  };

  const toAccountDto = ({ user, status }) => ({ ...toAdminDto(user), status });

  router.get("/counts", async (req, res) => {
    const counts = await Promise.all(STATUSES.map((status) => db.club.count({ where: { status } })));
    res.json(Object.fromEntries(STATUSES.map((s, i) => [s, counts[i]])));
  });

  router.get("/", async (req, res) => {
    const status = STATUSES.includes(req.query.status) ? req.query.status : "pending";
    const [clubs, accounts, competitions] = await Promise.all([
      db.club.findMany({
        where: { status },
        orderBy: status === "pending" ? [{ createdAt: "asc" }] : [{ name: "asc" }],
      }),
      accountsByClub(),
      db.competition.findMany({ where: { clubId: { not: null } }, select: { clubId: true } }),
    ]);
    res.json(
      clubs.map((c) => ({
        ...toFullClub(c),
        accounts: (accounts.get(c.id) ?? []).map(toAccountDto),
        competitionCount: competitions.filter((x) => x.clubId === c.id).length,
      }))
    );
  });

  // Edit a club's details. Competitions keep a copy of the organizer's name,
  // so a renamed club's competitions are renamed too.
  router.put("/:id", async (req, res) => {
    const club = await findClub(db, req.params.id);
    if (!club) return res.status(404).json({ error: "Not found" });
    const v = validateClubApplication(
      { ...req.body, note: req.body?.note ?? club.note },
      { admin: true }
    );
    if (!v.ok) return res.status(400).json({ error: "Invalid fields", errors: v.errors });
    const sameName = await findClubByName(db, v.data.name);
    if (sameName && sameName.id !== club.id) {
      return res.status(409).json({ error: "Another club already has this name", errors: ["name"] });
    }

    const updated = await db.club.update({ where: { id: club.id }, data: v.data });
    if (updated.name !== club.name) {
      await db.competition.updateMany({ where: { clubId: club.id }, data: { clubName: updated.name } });
    }
    res.json(toFullClub(updated));
  });

  const readMessage = (req, res) => {
    const message = String(req.body?.message ?? "").trim();
    if (message.length > MAX_MESSAGE) {
      res.status(400).json({ error: "The message is too long" });
      return null;
    }
    return message;
  };

  const recipients = (club, linked) => [
    ...new Set([club.email, ...linked.map(({ user }) => toAdminDto(user).email)].filter(Boolean)),
  ];

  // The club becomes public and its accounts may act for it.
  router.post("/:id/approve", async (req, res) => {
    const message = readMessage(req, res);
    if (message === null) return;
    const club = await findClub(db, req.params.id);
    if (!club) return res.status(404).json({ error: "Not found" });
    if (club.status !== "pending") return res.status(409).json({ error: "Already reviewed" });

    const linked = (await accountsByClub()).get(club.id) ?? [];
    const updated = await db.club.update({ where: { id: club.id }, data: { status: "approved" } });
    for (const { user, status } of linked) {
      if (status !== "approved") {
        await clerk.users.updateUserMetadata(user.id, { publicMetadata: { clubStatus: "approved" } });
      }
    }

    const to = recipients(updated, linked);
    const emailed =
      to.length > 0 &&
      (await mailer.send({ to, ...clubApprovedEmail(updated, siteUrl(req, allowedOrigins), message) }));
    res.json({ ok: true, emailed });
  });

  // The club isn't legitimate: email it, delete the accounts that signed it
  // up, and delete the club. Admin accounts are only unlinked, never deleted.
  router.post("/:id/reject", async (req, res) => {
    const message = readMessage(req, res);
    if (message === null) return;
    const club = await findClub(db, req.params.id);
    if (!club) return res.status(404).json({ error: "Not found" });
    if (club.status !== "pending") return res.status(409).json({ error: "Only clubs waiting for approval can be rejected" });

    const linked = (await accountsByClub()).get(club.id) ?? [];
    const to = recipients(club, linked);
    const emailed = to.length > 0 && (await mailer.send({ to, ...clubRejectedEmail(club, message) }));

    let deletedAccounts = 0;
    for (const { user } of linked) {
      if (isAdmin(user)) {
        await clerk.users.updateUserMetadata(user.id, {
          publicMetadata: { accountType: null, clubId: null, clubStatus: null },
        });
      } else {
        await clerk.users.deleteUser(user.id);
        deletedAccounts += 1;
      }
    }
    await db.competition.updateMany({ where: { clubId: club.id }, data: { clubId: null } });
    await db.club.delete({ where: { id: club.id } });
    res.json({ ok: true, emailed, deletedAccounts });
  });

  return router;
};
