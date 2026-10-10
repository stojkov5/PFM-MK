// server/routes/media.js
// Images and PDFs used in news articles. Files live in the database (table
// "media"), so there is no extra storage service to set up or back up.
import { randomUUID } from "node:crypto";
import express, { Router } from "express";

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

const startsWith = (buf, bytes, offset = 0) =>
  bytes.every((b, i) => buf[offset + i] === b);
const ascii = (s) => [...s].map((c) => c.charCodeAt(0));

// Allowed upload types, each with a check of the file's first bytes so a file
// can't claim to be something it isn't.
const TYPES = {
  "image/jpeg": (b) => startsWith(b, [0xff, 0xd8, 0xff]),
  "image/png": (b) => startsWith(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  "image/gif": (b) => startsWith(b, ascii("GIF8")),
  "image/webp": (b) => startsWith(b, ascii("RIFF")) && startsWith(b, ascii("WEBP"), 8),
  "application/pdf": (b) => startsWith(b, ascii("%PDF-")),
};

// Drops path separators and control characters from an uploaded file's name.
const cleanFilename = (name) =>
  [...String(name ?? "")]
    .filter((ch) => ch !== "/" && ch !== "\\" && ch.charCodeAt(0) >= 32)
    .join("")
    .trim()
    .slice(0, 200) || "file";

// Public: serves a stored file. Ids are random and files never change, so
// browsers can cache them forever.
export const mediaRouter = (db) => {
  const router = Router();

  router.get("/:id", async (req, res) => {
    const file = await db.media.findUnique({ where: { id: req.params.id } });
    if (!file) return res.status(404).json({ error: "Not found" });

    res.set({
      "Content-Type": file.mimeType,
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(file.filename)}`,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    });
    res.send(Buffer.from(file.data));
  });

  return router;
};

// Admin: POST the raw file as the request body, with its type in Content-Type
// and its name in ?name=.
export const adminMediaRouter = (db) => {
  const router = Router();

  router.post(
    "/",
    express.raw({ type: Object.keys(TYPES), limit: MAX_UPLOAD_BYTES }),
    async (req, res) => {
      const mimeType = String(req.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
      const body = req.body;
      if (!TYPES[mimeType] || !Buffer.isBuffer(body) || body.length === 0) {
        return res.status(415).json({ error: "Only JPG, PNG, GIF, WebP images and PDF files are allowed" });
      }
      if (!TYPES[mimeType](body)) {
        return res.status(400).json({ error: "The file doesn't match its type" });
      }

      const file = await db.media.create({
        data: {
          id: randomUUID(),
          filename: cleanFilename(req.query.name),
          mimeType,
          size: body.length,
          data: body,
          uploaderId: req.admin.id,
        },
        select: { id: true, filename: true, mimeType: true, size: true },
      });
      res.status(201).json({ ...file, url: `/api/media/${file.id}` });
    }
  );

  return router;
};
