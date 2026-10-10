// server/routes/news.js
import { Router } from "express";
import { ARTICLE_CATEGORIES } from "../lib/news.js";

const MAX_PAGE_SIZE = 50;

const listFields = {
  id: true,
  slug: true,
  title: true,
  category: true,
  excerpt: true,
  coverImage: true,
  publishedAt: true,
};

// Only articles that are published and whose publish date has passed are public.
const visible = () => ({ status: "published", publishedAt: { lte: new Date() } });

const toInt = (v, fallback) => {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

export const newsRouter = (db) => {
  const router = Router();

  router.get("/", async (req, res) => {
    const where = visible();
    if (ARTICLE_CATEGORIES.includes(req.query.category)) where.category = req.query.category;
    const take = Math.min(toInt(req.query.limit, 12) || 12, MAX_PAGE_SIZE);
    const skip = toInt(req.query.offset, 0);

    const [items, total] = await Promise.all([
      db.article.findMany({
        where,
        select: listFields,
        orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
        skip,
        take,
      }),
      db.article.count({ where }),
    ]);
    res.json({ items, total });
  });

  router.get("/:slug", async (req, res) => {
    const article = await db.article.findFirst({
      where: { ...visible(), slug: req.params.slug },
      select: { ...listFields, content: true, authorName: true },
    });
    if (!article) return res.status(404).json({ error: "Not found" });
    res.json(article);
  });

  return router;
};
