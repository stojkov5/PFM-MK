// server/routes/adminNews.js
import { Router } from "express";
import { ARTICLE_CATEGORIES, ARTICLE_STATUSES, slugify, validateArticle } from "../lib/news.js";

const listFields = {
  id: true,
  slug: true,
  title: true,
  category: true,
  status: true,
  coverImage: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  authorName: true,
};

// "my-title", then "my-title-2", "my-title-3"… until one is free.
const uniqueSlug = async (db, title, ignoreId) => {
  const base = slugify(title);
  for (let n = 1; ; n += 1) {
    const slug = n === 1 ? base : `${base}-${n}`;
    const taken = await db.article.findFirst({ where: { slug }, select: { id: true } });
    if (!taken || taken.id === ignoreId) return slug;
  }
};

export const adminNewsRouter = (db) => {
  const router = Router();

  router.get("/", async (req, res) => {
    const where = {};
    if (ARTICLE_STATUSES.includes(req.query.status)) where.status = req.query.status;
    if (ARTICLE_CATEGORIES.includes(req.query.category)) where.category = req.query.category;
    const articles = await db.article.findMany({
      where,
      select: listFields,
      orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    });
    res.json(articles);
  });

  router.get("/:id", async (req, res) => {
    const article = await db.article.findUnique({ where: { id: Number(req.params.id) || 0 } });
    if (!article) return res.status(404).json({ error: "Not found" });
    res.json(article);
  });

  router.post("/", async (req, res) => {
    const v = validateArticle(req.body);
    if (!v.ok) return res.status(400).json({ error: "Invalid article", fields: v.errors });

    const { publishedAt, ...data } = v.data;
    const article = await db.article.create({
      data: {
        ...data,
        slug: await uniqueSlug(db, data.title),
        publishedAt: publishedAt ?? (data.status === "published" ? new Date() : null),
        authorId: req.admin.id,
        authorName: req.admin.name ?? req.admin.email,
      },
    });
    res.status(201).json(article);
  });

  router.put("/:id", async (req, res) => {
    const id = Number(req.params.id) || 0;
    const existing = await db.article.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Not found" });

    const v = validateArticle(req.body);
    if (!v.ok) return res.status(400).json({ error: "Invalid article", fields: v.errors });

    const { publishedAt, ...data } = v.data;
    // The URL follows the title while the article is a draft; once it has been
    // published the URL stays put so shared links keep working.
    const slug =
      existing.status === "draft" && data.title !== existing.title
        ? await uniqueSlug(db, data.title, id)
        : existing.slug;

    const article = await db.article.update({
      where: { id },
      data: {
        ...data,
        slug,
        publishedAt:
          publishedAt ?? existing.publishedAt ?? (data.status === "published" ? new Date() : null),
      },
    });
    res.json(article);
  });

  router.delete("/:id", async (req, res) => {
    const id = Number(req.params.id) || 0;
    const existing = await db.article.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return res.status(404).json({ error: "Not found" });
    await db.article.delete({ where: { id } });
    res.json({ ok: true });
  });

  return router;
};
