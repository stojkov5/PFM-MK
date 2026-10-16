// server/lib/criteria.js
// Criteria documents (see the CriteriaDocument model): which sports have a
// Criteria page, checks for the admin form, and the one-time import of the
// PDFs that used to be hard-coded on the swimming criteria page.
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";

// Sports with a Criteria page on the site. Same keys as the news categories.
export const CRITERIA_SPORTS = ["swimming", "distance-swimming"];

export const pickCriteriaSport = (v) => (CRITERIA_SPORTS.includes(v) ? v : null);

// { ok, data } or { ok: false, errors: [field…] }. mediaId is checked by the route.
export const validateCriteria = (body = {}) => {
  const errors = [];
  const sport = pickCriteriaSport(body.sport);
  if (!sport) errors.push("sport");
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title || title.length > 200) errors.push("title");
  const description = typeof body.description === "string" ? body.description.trim() : "";
  if (description.length > 300) errors.push("description");
  return errors.length ? { ok: false, errors } : { ok: true, data: { sport, title, description } };
};

// What the public pages get. `file` describes the PDF for the admin panel.
export const toCriteriaDto = (doc, media) => ({
  id: doc.id,
  sport: doc.sport,
  title: doc.title,
  description: doc.description,
  url: `/api/media/${doc.mediaId}`,
  file: media ? { name: media.filename, size: media.size } : null,
  sortOrder: doc.sortOrder,
  updatedAt: doc.updatedAt,
  updatedBy: doc.updatedBy,
});

const SEED_NAME = "criteria-pdfs";

/**
 * Copies the PDFs listed in server/db/criteria-seed.json into the database
 * the first time the server starts after the criteria table was added. Runs
 * once ever (recorded in seed_runs), so documents an admin deleted stay deleted.
 */
export const ensureCriteria = async (db) => {
  if (await db.seedRun.findUnique({ where: { name: SEED_NAME } })) return 0;
  const root = new URL("../../", import.meta.url);
  const seed = JSON.parse(await readFile(new URL("server/db/criteria-seed.json", root), "utf8"));

  // Read every file first, then save all of it in one transaction: a failed
  // import leaves nothing behind and simply runs again on the next start.
  const files = await Promise.all(seed.map((item) => readFile(new URL(item.file, root))));
  await db.$transaction(
    async (tx) => {
      for (const [order, item] of seed.entries()) {
        const media = await tx.media.create({
          data: {
            id: randomUUID(),
            filename: item.file.split("/").pop(),
            mimeType: "application/pdf",
            size: files[order].length,
            data: files[order],
          },
        });
        await tx.criteriaDocument.create({
          data: {
            sport: item.sport,
            title: item.title,
            description: item.description ?? "",
            mediaId: media.id,
            sortOrder: order,
          },
        });
      }
      await tx.seedRun.create({ data: { name: SEED_NAME } });
    },
    { timeout: 120_000 }
  );
  return seed.length;
};
