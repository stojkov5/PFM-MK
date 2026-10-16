// server/routes/criteria.js
// Criteria PDFs: the public list for a sport's Criteria page, and the admin
// side (add, edit, replace the PDF, reorder, delete). Files are uploaded first
// through /api/admin/media; a document points at the uploaded file's id.
import { Router } from "express";
import { pickCriteriaSport, toCriteriaDto, validateCriteria } from "../lib/criteria.js";

const ORDER = [{ sortOrder: "asc" }, { id: "asc" }];

// Documents of one sport (or all), with their files' names and sizes.
const listDocs = async (db, sport) => {
  const docs = await db.criteriaDocument.findMany({ where: sport ? { sport } : {}, orderBy: ORDER });
  const media = await db.media.findMany({
    where: { id: { in: docs.map((d) => d.mediaId) } },
    select: { id: true, filename: true, size: true },
  });
  return docs.map((d) => toCriteriaDto(d, media.find((m) => m.id === d.mediaId)));
};

export const criteriaRouter = (db) => {
  const router = Router();

  router.get("/", async (req, res) => {
    const sport = pickCriteriaSport(req.query.sport);
    if (!sport) return res.status(400).json({ error: "Unknown sport" });
    res.json(await listDocs(db, sport));
  });

  return router;
};

// Mounted under /api/admin/criteria, so requireAdmin applies.
export const adminCriteriaRouter = (db) => {
  const router = Router();

  const isPdf = async (mediaId) => {
    if (typeof mediaId !== "string" || !mediaId) return false;
    const media = await db.media.findUnique({ where: { id: mediaId }, select: { mimeType: true } });
    return media?.mimeType === "application/pdf";
  };

  const find = (req) => {
    const id = Number(req.params.id);
    return Number.isInteger(id) ? db.criteriaDocument.findUnique({ where: { id } }) : null;
  };

  const by = (req) => req.admin.name ?? req.admin.email;

  // Removes a replaced or deleted document's PDF (criteria files aren't shared).
  const dropMedia = (mediaId) => db.media.deleteMany({ where: { id: mediaId } });

  router.get("/", async (req, res) => {
    res.json(await listDocs(db, pickCriteriaSport(req.query.sport)));
  });

  router.post("/", async (req, res) => {
    const v = validateCriteria(req.body);
    const errors = v.ok ? [] : [...v.errors];
    if (!(await isPdf(req.body?.mediaId))) errors.push("file");
    if (errors.length) return res.status(400).json({ error: "Invalid fields", errors });

    // New documents go to the end of their sport's list.
    const last = await db.criteriaDocument.findFirst({
      where: { sport: v.data.sport },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    const doc = await db.criteriaDocument.create({
      data: {
        ...v.data,
        mediaId: req.body.mediaId,
        sortOrder: (last?.sortOrder ?? -1) + 1,
        updatedBy: by(req),
      },
    });
    res.status(201).json({ id: doc.id });
  });

  // Rename, change the sport, or replace the PDF (send a new mediaId).
  router.put("/:id", async (req, res) => {
    const doc = await find(req);
    if (!doc) return res.status(404).json({ error: "Not found" });
    const v = validateCriteria(req.body);
    const errors = v.ok ? [] : [...v.errors];
    const newFile = req.body?.mediaId && req.body.mediaId !== doc.mediaId;
    if (newFile && !(await isPdf(req.body.mediaId))) errors.push("file");
    if (errors.length) return res.status(400).json({ error: "Invalid fields", errors });

    let sortOrder = doc.sortOrder;
    if (v.data.sport !== doc.sport) {
      const last = await db.criteriaDocument.findFirst({
        where: { sport: v.data.sport },
        orderBy: { sortOrder: "desc" },
        select: { sortOrder: true },
      });
      sortOrder = (last?.sortOrder ?? -1) + 1;
    }
    await db.criteriaDocument.update({
      where: { id: doc.id },
      data: {
        ...v.data,
        sortOrder,
        mediaId: newFile ? req.body.mediaId : doc.mediaId,
        updatedBy: by(req),
      },
    });
    if (newFile) await dropMedia(doc.mediaId);
    res.json({ ok: true });
  });

  // Move one place up or down within its sport.
  router.post("/:id/move", async (req, res) => {
    const doc = await find(req);
    if (!doc) return res.status(404).json({ error: "Not found" });
    const step = req.body?.direction === "up" ? -1 : req.body?.direction === "down" ? 1 : 0;
    if (!step) return res.status(400).json({ error: "direction must be up or down" });

    const siblings = await db.criteriaDocument.findMany({ where: { sport: doc.sport }, orderBy: ORDER });
    const i = siblings.findIndex((d) => d.id === doc.id);
    const j = i + step;
    if (j < 0 || j >= siblings.length) return res.json({ ok: true });
    [siblings[i], siblings[j]] = [siblings[j], siblings[i]];
    // Renumber the whole list so old ties or gaps disappear.
    for (const [index, d] of siblings.entries()) {
      if (d.sortOrder !== index) {
        await db.criteriaDocument.update({ where: { id: d.id }, data: { sortOrder: index } });
      }
    }
    res.json({ ok: true });
  });

  router.delete("/:id", async (req, res) => {
    const doc = await find(req);
    if (!doc) return res.status(404).json({ error: "Not found" });
    await db.criteriaDocument.delete({ where: { id: doc.id } });
    await dropMedia(doc.mediaId);
    res.json({ ok: true });
  });

  return router;
};
