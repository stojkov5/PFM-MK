// server/tests/newsletter.test.js
// Newsletter subscriptions (no account needed) and who gets the
// "new article" email.
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createTestApp } from "./helpers.js";

let app, db, mailer;

const as = (userId) => ({
  get: (url) => request(app).get(url).set("x-test-user", userId),
  post: (url, body) => request(app).post(url).set("x-test-user", userId).send(body),
  put: (url, body) => request(app).put(url).set("x-test-user", userId).send(body),
});
const admin = () => as("user_admin");

let titles = 0;
const article = (extra = {}) => ({
  title: `Вест ${(titles += 1)}`,
  category: "swimming",
  content: "<p>Текст.</p>",
  status: "published",
  ...extra,
});

// The email goes out in the background after the response.
const emailedTo = async (title) => {
  for (let i = 0; i < 50; i += 1) {
    const a = await db.article.findFirst({ where: { title } });
    if (a.emailStatus !== "pending" && a.emailStatus !== "sending") break;
    await new Promise((r) => setTimeout(r, 10));
  }
  return mailer.sent
    .filter((m) => m.subject === `Нова вест: ${title}`)
    .flatMap((m) => m.to)
    .sort();
};

beforeAll(async () => {
  ({ app, db, mailer } = await createTestApp());
});

describe("newsletter subscription", () => {
  it("lets anyone subscribe, without an account", async () => {
    const res = await request(app).post("/api/newsletter").send({ email: "  Fan@Example.com " });
    expect(res.body).toEqual({ ok: true });
    expect(await db.newsletterSubscriber.findUnique({ where: { email: "fan@example.com" } })).toBeTruthy();
  });

  it("accepts the same address twice without a duplicate", async () => {
    await request(app).post("/api/newsletter").send({ email: "twice@example.com" });
    expect((await request(app).post("/api/newsletter").send({ email: "TWICE@example.com" })).status).toBe(200);
    expect(await db.newsletterSubscriber.count({ where: { email: "twice@example.com" } })).toBe(1);
  });

  it("rejects invalid addresses", async () => {
    expect((await request(app).post("/api/newsletter").send({ email: "not-an-email" })).status).toBe(400);
    expect((await request(app).post("/api/newsletter").send({})).status).toBe(400);
  });

  it("unsubscribes with the token from the email", async () => {
    await request(app).post("/api/newsletter").send({ email: "leaving@example.com" });
    const { token } = await db.newsletterSubscriber.findUnique({ where: { email: "leaving@example.com" } });
    const res = await request(app).post("/api/newsletter/unsubscribe").send({ token });
    expect(res.body).toEqual({ ok: true, email: "leaving@example.com" });
    expect((await request(app).post("/api/newsletter/unsubscribe").send({ token })).status).toBe(404);
    expect((await request(app).post("/api/newsletter/unsubscribe").send({})).status).toBe(404);
  });

  it("lists accounts and subscribers for admins", async () => {
    await request(app).post("/api/newsletter").send({ email: "regular@example.com" });
    expect((await as("user_regular").get("/api/admin/news/recipients")).status).toBe(403);
    const res = await admin().get("/api/admin/news/recipients");
    expect(res.status).toBe(200);
    expect(res.body).toContainEqual({ email: "regular@example.com", name: "user_regular", account: true, subscribed: true });
    expect(res.body).toContainEqual({ email: "delfin@example.com", name: "user_club", account: true, subscribed: false });
    expect(res.body).toContainEqual({ email: "fan@example.com", name: null, account: false, subscribed: true });
  });
});

describe("who gets the new-article email", () => {
  it("defaults to the subscribers, each with their own unsubscribe link", async () => {
    const a = article();
    const res = await admin().post("/api/admin/news", a);
    expect(res.body.emailAudience).toBe("subscribers");
    expect(await emailedTo(a.title)).toEqual(["fan@example.com", "regular@example.com", "twice@example.com"]);

    const { token } = await db.newsletterSubscriber.findUnique({ where: { email: "fan@example.com" } });
    const mail = mailer.sent.find((m) => m.subject === `Нова вест: ${a.title}` && m.to[0] === "fan@example.com");
    expect(mail.text).toContain(`/newsletter/unsubscribe?token=${token}`);
  });

  it("can go to every registered account", async () => {
    const a = article({ emailAudience: "all" });
    await admin().post("/api/admin/news", a);
    const mail = mailer.sent.find((m) => m.subject === `Нова вест: ${a.title}`);
    expect(mail.text).not.toContain("unsubscribe");
    expect(await emailedTo(a.title)).toEqual([
      "admin@example.com",
      "delfin@example.com",
      "mladost@example.com",
      "pending-club@example.com",
      "regular@example.com",
    ]);
  });

  it("can go to a hand-picked list, including addresses without an account", async () => {
    const a = article({ emailAudience: "manual", emailRecipients: ["Delfin@example.com", "coach@gmail.com"] });
    await admin().post("/api/admin/news", a);
    expect(await emailedTo(a.title)).toEqual(["coach@gmail.com", "delfin@example.com"]);
  });

  it("can be skipped", async () => {
    const a = article({ emailAudience: "none" });
    const res = await admin().post("/api/admin/news", a);
    expect(res.body.emailStatus).toBeNull();
    expect(await emailedTo(a.title)).toEqual([]);
  });

  it("uses the audience chosen when a draft is published", async () => {
    const a = article({ status: "draft", emailAudience: "manual", emailRecipients: ["one@example.com"] });
    const draft = await admin().post("/api/admin/news", a);
    expect(draft.body.emailStatus).toBeNull();
    await admin().put(`/api/admin/news/${draft.body.id}`, {
      ...a,
      status: "published",
      emailRecipients: ["two@example.com"],
    });
    expect(await emailedTo(a.title)).toEqual(["two@example.com"]);
  });

  it("rejects bad audiences and recipient lists", async () => {
    const bad = (extra) => admin().post("/api/admin/news", article(extra));
    expect((await bad({ emailAudience: "everyone" })).body.fields).toContain("emailAudience");
    expect((await bad({ emailAudience: "manual" })).body.fields).toContain("emailRecipients");
    expect((await bad({ emailAudience: "manual", emailRecipients: ["not-an-email"] })).body.fields).toContain(
      "emailRecipients"
    );
    // A draft may keep an empty manual list until it's published.
    expect((await bad({ status: "draft", emailAudience: "manual" })).status).toBe(201);
  });
});
