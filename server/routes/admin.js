// server/routes/admin.js
import { Router } from "express";
import bcrypt from "bcryptjs";
import { requireAdmin } from "../middleware/requireAdmin.js";

export const adminRouter = (db) => {
  const router = Router();
  router.use(requireAdmin);

  router.get("/applications", async (req, res) => {
    const status = ["pending", "approved", "denied"].includes(req.query.status)
      ? req.query.status
      : "pending";
    const apps = await db.recordApplication.findMany({
      where: { status },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
    const withCurrent = await Promise.all(
      apps.map(async (a) => {
        const current = await db.record.findFirst({
          where: {
            pool: a.pool,
            gender: a.gender,
            category: a.category,
            discipline: a.discipline,
          },
          select: { time: true, athlete: true },
        });
        return { ...a, currentRecord: current ?? null };
      })
    );
    res.json(withCurrent);
  });

  router.post("/applications/:id/approve", async (req, res) => {
    const id = Number(req.params.id);
    const result = await db.$transaction(async (tx) => {
      const app = await tx.recordApplication.findUnique({ where: { id } });
      if (!app) return { error: 404 };
      if (app.status !== "pending") return { error: 409 };

      const athlete = `${app.lastName} ${app.firstName}`;

      const existing = await tx.record.findFirst({
        where: {
          pool: app.pool,
          gender: app.gender,
          category: app.category,
          discipline: app.discipline,
        },
        select: { id: true },
      });

      if (existing) {
        await tx.record.update({
          where: { id: existing.id },
          data: { time: app.time, athlete },
        });
      } else {
        const sibling = await tx.record.findFirst({
          where: { pool: app.pool, gender: app.gender, category: app.category },
          select: { sortOrder: true },
        });
        await tx.record.create({
          data: {
            pool: app.pool,
            gender: app.gender,
            category: app.category,
            sortOrder: sibling?.sortOrder ?? 0,
            discipline: app.discipline,
            time: app.time,
            athlete,
          },
        });
      }

      await tx.recordApplication.update({
        where: { id },
        data: { status: "approved", reviewedAt: new Date(), reviewedBy: req.admin.id },
      });
      return { ok: true };
    });

    if (result.error === 404) return res.status(404).json({ error: "Not found" });
    if (result.error === 409) return res.status(409).json({ error: "Already reviewed" });
    res.json({ ok: true });
  });

  router.post("/applications/:id/deny", async (req, res) => {
    const id = Number(req.params.id);
    const app = await db.recordApplication.findUnique({
      where: { id },
      select: { status: true },
    });
    if (!app) return res.status(404).json({ error: "Not found" });
    if (app.status !== "pending") return res.status(409).json({ error: "Already reviewed" });
    await db.recordApplication.update({
      where: { id },
      data: { status: "denied", reviewedAt: new Date(), reviewedBy: req.admin.id },
    });
    res.json({ ok: true });
  });

  router.post("/admins", async (req, res) => {
    const { username, password } = req.body ?? {};
    if (
      typeof username !== "string" || username.trim().length < 3 || username.length > 50 ||
      typeof password !== "string" || password.length < 10
    ) {
      return res.status(400).json({ error: "Username min 3 chars, password min 10 chars" });
    }
    const existing = await db.admin.findUnique({
      where: { username: username.trim() },
      select: { id: true },
    });
    if (existing) return res.status(409).json({ error: "Username already exists" });
    const passwordHash = await bcrypt.hash(password, 12);
    await db.admin.create({ data: { username: username.trim(), passwordHash } });
    res.status(201).json({ ok: true });
  });

  return router;
};
