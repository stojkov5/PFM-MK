import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createTestApp } from "./helpers.js";
import { ensureClubs } from "../lib/clubs.js";

let app, db, auth, mailer;

const as = (user) => ({
  get: (url) => request(app).get(url).set("x-test-user", user),
  post: (url, body) => request(app).post(url).set("x-test-user", user).send(body),
  put: (url, body) => request(app).put(url).set("x-test-user", user).send(body),
});

const application = (over = {}) => ({
  name: "ПК Нов Клуб",
  type: "Пливачки клуб",
  city: "Битола",
  address: "",
  president: "Петар Петровски",
  email: "Nov@Example.com",
  phone: "070 123 456",
  note: "Основан 2024",
  ...over,
});

beforeEach(async () => {
  ({ app, db, auth, mailer } = await createTestApp());
});

describe("clubs list", () => {
  it("is seeded once from the federation's list", async () => {
    expect(await db.club.count()).toBe(31);
    expect(await ensureClubs(db)).toBe(0);
    expect(await db.club.count()).toBe(31);
  });

  it("shows approved clubs only, never the test club", async () => {
    await db.club.create({ data: { id: 40, name: "Pending", status: "pending" } });
    const res = await request(app).get("/api/clubs");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(30);
    expect(res.body.map((c) => c.name)).not.toContain("ПК ТЕСТ");
    expect(res.body.map((c) => c.name)).not.toContain("Pending");
    expect(res.body[0]).not.toHaveProperty("status");
  });
});

describe("account type", () => {
  it("needs a signed-in user", async () => {
    expect((await request(app).get("/api/account")).status).toBe(401);
  });

  it("reports the club of a club account", async () => {
    const res = await as("user_club").get("/api/account");
    expect(res.body).toMatchObject({
      accountType: "club",
      club: { id: 14, name: "ПК Делфин Скопје", status: "approved", accountStatus: "approved" },
    });
    expect((await as("user_regular").get("/api/account")).body).toEqual({ accountType: null, club: null });
  });

  it("can be set to athlete once", async () => {
    expect((await as("user_regular").post("/api/account/athlete")).status).toBe(200);
    expect(auth.users.get("user_regular").publicMetadata.accountType).toBe("athlete");
    expect((await as("user_regular").post("/api/account/athlete")).status).toBe(409);
    expect((await as("user_regular").post("/api/account/club", application())).status).toBe(409);
  });
});

describe("club sign-up", () => {
  it("creates a pending club, links the account and emails both sides", async () => {
    const res = await as("user_regular").post("/api/account/club", application());
    expect(res.status).toBe(201);

    const club = await db.club.findUnique({ where: { id: 32 } });
    expect(club).toMatchObject({ name: "ПК Нов Клуб", status: "pending", email: "nov@example.com", createdBy: "user_regular" });
    expect(auth.users.get("user_regular").publicMetadata).toMatchObject({
      accountType: "club",
      clubId: 32,
      clubStatus: "pending",
    });

    expect(mailer.sent.map((m) => m.to)).toEqual([["info@npf.mk"], ["nov@example.com", "regular@example.com"]]);
    expect(mailer.sent[0].text).toContain("Основан 2024");

    // Not public, and can't register competitions yet.
    expect((await request(app).get("/api/clubs")).body.map((c) => c.id)).not.toContain(32);
    expect((await as("user_regular").get("/api/competitions/mine")).status).toBe(403);
  });

  it("rejects missing fields and existing club names", async () => {
    const bad = await as("user_regular").post("/api/account/club", application({ name: "", email: "nope" }));
    expect(bad.status).toBe(400);
    expect(bad.body.errors).toEqual(expect.arrayContaining(["name", "email"]));

    const taken = await as("user_regular").post("/api/account/club", application({ name: "пк делфин скопје" }));
    expect(taken.status).toBe(409);
    expect(taken.body.errors).toEqual(["name"]);
    expect(await db.club.count()).toBe(31);
  });
});

describe("admin club review", () => {
  const admin = () => as("user_admin");
  const signUp = async () => {
    const res = await as("user_regular").post("/api/account/club", application());
    expect(res.status).toBe(201);
    mailer.sent.length = 0;
    return res.body.club.id;
  };

  it("is admin-only", async () => {
    expect((await request(app).get("/api/admin/clubs")).status).toBe(401);
    expect((await as("user_club").get("/api/admin/clubs")).status).toBe(403);
  });

  it("lists pending sign-ups with their accounts", async () => {
    const id = await signUp();
    expect((await admin().get("/api/admin/clubs/counts")).body).toEqual({ pending: 1, approved: 31 });
    const res = await admin().get("/api/admin/clubs?status=pending");
    expect(res.body).toMatchObject([
      { id, name: "ПК Нов Клуб", note: "Основан 2024", accounts: [{ email: "regular@example.com", status: "pending" }] },
    ]);
    const approved = await admin().get("/api/admin/clubs?status=approved");
    expect(approved.body.find((c) => c.id === 14).accounts).toMatchObject([{ email: "delfin@example.com" }]);
  });

  it("approve makes the club public and lets its account register competitions", async () => {
    const id = await signUp();
    const res = await admin().post(`/api/admin/clubs/${id}/approve`, { message: "Добредојдовте" });
    expect(res.body).toEqual({ ok: true, emailed: true });
    expect(auth.users.get("user_regular").publicMetadata.clubStatus).toBe("approved");
    expect((await request(app).get("/api/clubs")).body.map((c) => c.id)).toContain(id);
    expect((await as("user_regular").get("/api/competitions/mine")).status).toBe(200);
    expect(mailer.sent[0].to).toEqual(["nov@example.com", "regular@example.com"]);
    expect(mailer.sent[0].text).toContain("Добредојдовте");
    expect((await admin().post(`/api/admin/clubs/${id}/approve`)).status).toBe(409);
  });

  it("reject emails the club, deletes its account and the club", async () => {
    const id = await signUp();
    const res = await admin().post(`/api/admin/clubs/${id}/reject`, { message: "Непознат клуб" });
    expect(res.body).toEqual({ ok: true, emailed: true, deletedAccounts: 1 });
    expect(auth.users.has("user_regular")).toBe(false);
    expect(await db.club.findUnique({ where: { id } })).toBeNull();
    expect(mailer.sent[0].text).toContain("Непознат клуб");
    // Approved clubs can't be rejected.
    expect((await admin().post("/api/admin/clubs/14/reject")).status).toBe(409);
  });

  it("never deletes an admin's account on reject", async () => {
    const res = await as("user_admin").post("/api/account/club", application());
    await admin().post(`/api/admin/clubs/${res.body.club.id}/reject`);
    expect(auth.users.get("user_admin").publicMetadata).toEqual({ role: "admin" });
  });

  it("edits a club and renames its competitions", async () => {
    await db.competition.create({
      data: {
        name: "Delfin Kup", clubId: 14, clubName: "ПК Делфин Скопје", startDate: new Date("2027-03-01"),
        endDate: new Date("2027-03-01"), city: "Скопје", course: "SC", editToken: "t".repeat(30),
      },
    });
    const club = await db.club.findUnique({ where: { id: 14 } });
    const res = await admin().put("/api/admin/clubs/14", { ...club, name: "ПК Делфин", phone: "070 000 000" });
    expect(res.status).toBe(200);
    expect(await db.club.findUnique({ where: { id: 14 } })).toMatchObject({ name: "ПК Делфин", phone: "070 000 000" });
    expect((await db.competition.findFirst()).clubName).toBe("ПК Делфин");

    const taken = await admin().put("/api/admin/clubs/14", { ...club, name: "ПК ТЕСТ" });
    expect(taken.status).toBe(409);

    // Admins may leave fields empty (some listed clubs have no phone), not the name.
    expect((await admin().put("/api/admin/clubs/31", { name: "ПК ТЕСТ", phone: "" })).status).toBe(200);
    expect((await admin().put("/api/admin/clubs/31", { name: "" })).status).toBe(400);
  });
});
