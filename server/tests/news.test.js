// server/tests/news.test.js
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createTestApp } from "./helpers.js";
import { excerptFromHtml, slugify } from "../lib/news.js";

let app, db;

const as = (userId) => ({
  get: (url) => request(app).get(url).set("x-test-user", userId),
  post: (url, body) => request(app).post(url).set("x-test-user", userId).send(body),
  put: (url, body) => request(app).put(url).set("x-test-user", userId).send(body),
  delete: (url) => request(app).delete(url).set("x-test-user", userId),
});
const admin = () => as("user_admin");

const article = {
  title: "Државно првенство во пливање",
  category: "swimming",
  content: "<p>Резултати од <strong>првенството</strong>.</p>",
  status: "published",
};

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);

beforeAll(async () => {
  ({ app, db } = await createTestApp());
});

describe("news helpers", () => {
  it("turns Macedonian titles into Latin slugs", () => {
    expect(slugify("Државно првенство во Пливање 2026!")).toBe("drzhavno-prvenstvo-vo-plivanje-2026");
    expect(slugify("Ќе се одржи џиновски шампионат")).toBe("kje-se-odrzhi-dzhinovski-shampionat");
    expect(slugify("???")).toBe("article");
  });
  it("builds a plain-text excerpt from HTML", () => {
    expect(excerptFromHtml("<h2>Наслов</h2><p>Прв&nbsp;пасус &amp; втор.</p>")).toBe("Наслов Прв пасус & втор.");
    const long = excerptFromHtml(`<p>${"збор ".repeat(100)}</p>`);
    expect(long.length).toBeLessThanOrEqual(221);
    expect(long.endsWith("…")).toBe(true);
  });
});

describe("admin news CRUD", () => {
  it("requires an admin", async () => {
    expect((await request(app).get("/api/admin/news")).status).toBe(401);
    expect((await as("user_regular").post("/api/admin/news", article)).status).toBe(403);
  });

  it("creates an article with a slug, excerpt, author and publish date", async () => {
    const res = await admin().post("/api/admin/news", article);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      slug: "drzhavno-prvenstvo-vo-plivanje",
      excerpt: "Резултати од првенството.",
      status: "published",
      authorId: "user_admin",
    });
    expect(res.body.publishedAt).toBeTruthy();
  });

  it("gives a second article with the same title its own slug", async () => {
    const res = await admin().post("/api/admin/news", article);
    expect(res.body.slug).toBe("drzhavno-prvenstvo-vo-plivanje-2");
  });

  it("rejects invalid articles", async () => {
    const res = await admin().post("/api/admin/news", { ...article, title: " ", category: "chess" });
    expect(res.status).toBe(400);
    expect(res.body.fields).toEqual(["title", "category"]);
    const cover = await admin().post("/api/admin/news", { ...article, coverImage: "https://evil.example/x.png" });
    expect(cover.body.fields).toEqual(["coverImage"]);
  });

  it("renames the slug of a draft but keeps it once published", async () => {
    const draft = (await admin().post("/api/admin/news", { ...article, title: "Нацрт", status: "draft" })).body;
    expect(draft.publishedAt).toBeNull();

    const renamed = await admin().put(`/api/admin/news/${draft.id}`, {
      ...article,
      title: "Ватерполо куп",
      category: "waterpolo",
      status: "published",
    });
    expect(renamed.status).toBe(200);
    expect(renamed.body).toMatchObject({ slug: "vaterpolo-kup", category: "waterpolo" });
    expect(renamed.body.publishedAt).toBeTruthy();

    const again = await admin().put(`/api/admin/news/${draft.id}`, {
      ...article,
      title: "Ватерполо куп — финале",
      category: "waterpolo",
    });
    expect(again.body.slug).toBe("vaterpolo-kup");
    expect(again.body.publishedAt).toBe(renamed.body.publishedAt);
  });

  it("lists every article for admins, filtered by status", async () => {
    await admin().post("/api/admin/news", { ...article, title: "Само нацрт", status: "draft" });
    const all = await admin().get("/api/admin/news");
    const drafts = await admin().get("/api/admin/news?status=draft");
    expect(all.body.length).toBeGreaterThan(drafts.body.length);
    expect(drafts.body.every((a) => a.status === "draft")).toBe(true);
    expect(all.body[0]).not.toHaveProperty("content");
  });

  it("deletes an article", async () => {
    const created = (await admin().post("/api/admin/news", { ...article, title: "За бришење" })).body;
    expect((await admin().delete(`/api/admin/news/${created.id}`)).status).toBe(200);
    expect((await admin().get(`/api/admin/news/${created.id}`)).status).toBe(404);
    expect((await admin().delete(`/api/admin/news/${created.id}`)).status).toBe(404);
  });
});

describe("public news", () => {
  it("lists only published articles, without their body", async () => {
    const res = await request(app).get("/api/news");
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(res.body.items.length);
    expect(res.body.items.map((a) => a.title)).not.toContain("Само нацрт");
    expect(res.body.items[0]).not.toHaveProperty("content");
    expect(res.body.items[0]).not.toHaveProperty("status");
  });

  it("filters by category and pages", async () => {
    const polo = await request(app).get("/api/news?category=waterpolo");
    expect(polo.body.items.map((a) => a.slug)).toEqual(["vaterpolo-kup"]);
    const page = await request(app).get("/api/news?limit=1&offset=1");
    expect(page.body.items).toHaveLength(1);
    expect(page.body.total).toBeGreaterThan(1);
  });

  it("returns a published article by slug", async () => {
    const res = await request(app).get("/api/news/vaterpolo-kup");
    expect(res.status).toBe(200);
    expect(res.body.content).toContain("<strong>");
  });

  it("hides drafts and articles scheduled for later", async () => {
    expect((await request(app).get("/api/news/samo-nacrt")).status).toBe(404);
    const later = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const scheduled = (
      await admin().post("/api/admin/news", { ...article, title: "Закажана вест", publishedAt: later })
    ).body;
    expect((await request(app).get(`/api/news/${scheduled.slug}`)).status).toBe(404);
  });
});

describe("media uploads", () => {
  const upload = (userId, type, body, name = "слика 1.png") =>
    request(app)
      .post(`/api/admin/media?name=${encodeURIComponent(name)}`)
      .set("x-test-user", userId)
      .set("Content-Type", type)
      .send(body);

  it("requires an admin", async () => {
    expect((await upload("user_regular", "image/png", PNG)).status).toBe(403);
  });

  it("stores a file and serves it publicly", async () => {
    const res = await upload("user_admin", "image/png", PNG);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ filename: "слика 1.png", mimeType: "image/png", size: PNG.length });
    expect(res.body.url).toBe(`/api/media/${res.body.id}`);

    const file = await request(app).get(res.body.url);
    expect(file.status).toBe(200);
    expect(file.headers["content-type"]).toBe("image/png");
    expect(file.headers["cache-control"]).toContain("immutable");
    expect(Buffer.compare(file.body, PNG)).toBe(0);

    const cover = await admin().post("/api/admin/news", { ...article, title: "Со слика", coverImage: res.body.url });
    expect(cover.status).toBe(201);
  });

  it("rejects other file types and files that lie about their type", async () => {
    expect((await upload("user_admin", "text/html", "<script>alert(1)</script>")).status).toBe(415);
    expect((await upload("user_admin", "application/pdf", PNG)).status).toBe(400);
    expect(await db.media.count()).toBe(1);
  });

  it("returns 404 for unknown files", async () => {
    expect((await request(app).get("/api/media/nope")).status).toBe(404);
  });
});
