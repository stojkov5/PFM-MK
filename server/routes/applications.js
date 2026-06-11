// server/routes/applications.js
import { Router } from "express";
import { validateApplication } from "../lib/validate.js";

export const applicationsRouter = (db) => {
  const router = Router();

  router.post("/", async (req, res) => {
    const v = validateApplication(req.body);
    if (!v.ok) return res.status(400).json({ error: "Invalid fields", errors: v.errors });
    const d = v.data;

    const slot = await db.record.findFirst({
      where: { pool: d.pool, gender: d.gender, category: d.category, discipline: d.discipline },
      select: { id: true },
    });
    if (!slot) {
      return res.status(400).json({
        error: "Unknown category/discipline for the selected pool and sex",
      });
    }

    const created = await db.recordApplication.create({
      data: {
        firstName: d.firstName,
        lastName: d.lastName,
        gender: d.gender,
        pool: d.pool,
        category: d.category,
        discipline: d.discipline,
        time: d.time,
        proofUrl: d.proofUrl,
      },
      select: { id: true },
    });
    res.status(201).json({ id: created.id });
  });

  return router;
};
