// server/routes/admin.js
import { Router } from "express";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { teamRouter } from "./team.js";
import { adminNewsRouter } from "./adminNews.js";
import { adminMediaRouter } from "./media.js";

const STATUSES = ["pending", "approved", "denied"];

const recordSlot = (a) => ({
  pool: a.pool,
  gender: a.gender,
  category: a.category,
  discipline: a.discipline,
});

export const adminRouter = (db, auth, { allowedOrigins = [] } = {}) => {
  const router = Router();
  router.use(auth.middleware, requireAdmin(auth));

  router.get("/me", (req, res) => res.json(req.admin));

  router.get("/applications/counts", async (req, res) => {
    const counts = await Promise.all(
      STATUSES.map((status) => db.recordApplication.count({ where: { status } }))
    );
    res.json(Object.fromEntries(STATUSES.map((s, i) => [s, counts[i]])));
  });

  router.get("/applications", async (req, res) => {
    const status = STATUSES.includes(req.query.status) ? req.query.status : "pending";
    const apps = await db.recordApplication.findMany({
      where: { status },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
    const withCurrent = await Promise.all(
      apps.map(async (a) => {
        const current = await db.record.findFirst({
          where: recordSlot(a),
          select: { time: true, athlete: true },
        });
        return { ...a, currentRecord: current ?? null };
      })
    );
    res.json(withCurrent);
  });

  const reviewedBy = (req) => ({
    reviewedAt: new Date(),
    reviewerId: req.admin.id,
    reviewerName: req.admin.name ?? req.admin.email,
  });

  router.post("/applications/:id/approve", async (req, res) => {
    const id = Number(req.params.id);
    const result = await db.$transaction(async (tx) => {
      const app = await tx.recordApplication.findUnique({ where: { id } });
      if (!app) return { error: 404 };
      if (app.status !== "pending") return { error: 409 };

      const athlete = `${app.lastName} ${app.firstName}`;
      const existing = await tx.record.findFirst({
        where: recordSlot(app),
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
            ...recordSlot(app),
            sortOrder: sibling?.sortOrder ?? 0,
            time: app.time,
            athlete,
          },
        });
      }

      await tx.recordApplication.update({
        where: { id },
        data: { status: "approved", ...reviewedBy(req) },
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
      data: { status: "denied", ...reviewedBy(req) },
    });
    res.json({ ok: true });
  });

  router.use("/team", teamRouter(auth, { allowedOrigins }));
  router.use("/news", adminNewsRouter(db));
  router.use("/media", adminMediaRouter(db));

  return router;
};
