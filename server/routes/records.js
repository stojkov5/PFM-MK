// server/routes/records.js
import { Router } from "express";

const validParams = (q) =>
  (q.pool === "25" || q.pool === "50") &&
  (q.gender === "male" || q.gender === "female");

const fetchRows = (db, q) =>
  db.record.findMany({
    where: { pool: q.pool, gender: q.gender },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });

export const recordsRouter = (db) => {
  const router = Router();

  router.get("/", async (req, res) => {
    if (!validParams(req.query)) return res.status(400).json({ error: "Invalid pool or gender" });
    const rows = await fetchRows(db, req.query);
    const byCategory = new Map();
    for (const r of rows) {
      if (!byCategory.has(r.category)) byCategory.set(r.category, []);
      byCategory.get(r.category).push({ discipline: r.discipline, time: r.time, athlete: r.athlete });
    }
    res.json([...byCategory.entries()].map(([name, records]) => ({ name, records })));
  });

  router.get("/options", async (req, res) => {
    if (!validParams(req.query)) return res.status(400).json({ error: "Invalid pool or gender" });
    const rows = await fetchRows(db, req.query);
    const categories = [];
    const disciplines = {};
    for (const r of rows) {
      if (!disciplines[r.category]) {
        categories.push(r.category);
        disciplines[r.category] = [];
      }
      disciplines[r.category].push(r.discipline);
    }
    res.json({ categories, disciplines });
  });

  return router;
};
