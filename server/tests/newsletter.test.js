// server/tests/newsletter.test.js
// Newsletter subscriptions and who gets the "new article" email.
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
  it("requires a signed-in account", async () => {
    expect((await request(app).post("/api/account/newsletter").send({ subscribed: true })).status).toBe(401);
  });

  it("subscribes and unsubscribes", async () => {
    expect((await as("user_regular").get("/api/account")).body.newsletter).toBe(false);

    const on = await as("user_regular").post("/api/account/newsletter", { subscribed: true });
    expect(on.body).toEqual({ newsletter: true });
    expect((await as("user_regular").get("/api/account")).body.newsletter).toBe(true);

    await as("user_club").post("/api/account/newsletter", { subscribed: true });
    await as("user_club").post("/api/account/newsletter", { subscribed: false });
    expect((await as("user_club").get("/api/account")).body.newsletter).toBe(false);
  });

  it("rejects anything but true / false", async () => {
    expect((await as("user_regular").post("/api/account/newsletter", { subscribed: "yes" })).status).toBe(400);
  });

  it("lists registered accounts with their subscription for admins", async () => {
    expect((await as("user_regular").get("/api/admin/news/recipients")).status).toBe(403);
    const res = await admin().get("/api/admin/news/recipients");
    expect(res.status).toBe(200);
    expect(res.body).toContainEqual({ email: "regular@example.com", name: "user_regular", subscribed: true });
    expect(res.body).toContainEqual({ email: "delfin@example.com", name: "user_club", subscribed: false });
  });
});

describe("who gets the new-article email", () => {
  it("defaults to the subscribers", async () => {
    const a = article();
    const res = await admin().post("/api/admin/news", a);
    expect(res.body.emailAudience).toBe("subscribers");
    expect(await emailedTo(a.title)).toEqual(["regular@example.com"]);
  });

  it("can go to every registered account", async () => {
    const a = article({ emailAudience: "all" });
    await admin().post("/api/admin/news", a);
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
