// server/lib/news.js

// Keep in sync with src/lib/news.js (the labels live in the translation files).
export const ARTICLE_CATEGORIES = ["swimming", "waterpolo", "distance-swimming", "other"];
export const ARTICLE_STATUSES = ["draft", "published"];

export const MEDIA_PATH_RE = /^\/api\/media\/[a-f0-9-]{36}$/;

const MAX_CONTENT_LENGTH = 1_000_000;
const EXCERPT_LENGTH = 220;

// Macedonian Cyrillic → Latin, so article URLs stay readable and shareable.
const CYRILLIC = {
  а: "a", б: "b", в: "v", г: "g", д: "d", ѓ: "gj", е: "e", ж: "zh", з: "z", ѕ: "dz",
  и: "i", ј: "j", к: "k", л: "l", љ: "lj", м: "m", н: "n", њ: "nj", о: "o", п: "p",
  р: "r", с: "s", т: "t", ќ: "kj", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", џ: "dzh",
  ш: "sh",
};

export const slugify = (title) => {
  const latin = [...String(title).toLowerCase()].map((ch) => CYRILLIC[ch] ?? ch).join("");
  const slug = latin
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
  return slug || "article";
};

// Plain-text preview of the article body, used when the admin leaves the summary empty.
export const excerptFromHtml = (html) => {
  const text = String(html)
    // Block boundaries become spaces; inline tags (bold, links…) just disappear.
    .replace(/<\/?(p|div|h[1-6]|li|ul|ol|br|hr|blockquote|table|tr|td|th)\b[^>]*>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= EXCERPT_LENGTH) return text;
  return `${text.slice(0, EXCERPT_LENGTH).replace(/\s+\S*$/, "")}…`;
};

export const validateArticle = (body = {}) => {
  const errors = [];

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title || title.length > 200) errors.push("title");

  if (!ARTICLE_CATEGORIES.includes(body.category)) errors.push("category");

  const status = body.status ?? "draft";
  if (!ARTICLE_STATUSES.includes(status)) errors.push("status");

  const content = body.content ?? "";
  if (typeof content !== "string" || content.length > MAX_CONTENT_LENGTH) errors.push("content");

  const excerpt = typeof body.excerpt === "string" ? body.excerpt.trim() : "";
  if (excerpt.length > 500) errors.push("excerpt");

  const coverImage = body.coverImage || null;
  if (coverImage !== null && !(typeof coverImage === "string" && MEDIA_PATH_RE.test(coverImage))) {
    errors.push("coverImage");
  }

  let publishedAt = null;
  if (body.publishedAt) {
    publishedAt = new Date(body.publishedAt);
    if (Number.isNaN(publishedAt.getTime())) errors.push("publishedAt");
  }

  if (errors.length > 0) return { ok: false, errors };
  return {
    ok: true,
    data: {
      title,
      category: body.category,
      status,
      content,
      excerpt: excerpt || excerptFromHtml(content),
      coverImage,
      publishedAt,
    },
  };
};
