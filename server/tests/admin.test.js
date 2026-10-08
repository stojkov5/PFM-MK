// server/tests/admin.test.js
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createTestApp } from "./helpers.js";

let app, db, auth;

const application = {
  firstName: "Ana",
  lastName: "Stojanova",
  gender: "female",
  pool: "25",
  category: "Seniors (17+)",
  discipline: "50m Freestyle",
  time: "0:25.99",
  proofUrl: "https://results.example.com/1",
};

const as = (userId) => ({
  get: (url) => request(app).get(url).set("x-test-user", userId),
  post: (url, body) => request(app).post(url).set("x-test-user", userId).send(body),
  delete: (url) => request(app).delete(url).set("x-test-user", userId),
});
const admin = () => as("user_admin");

const submit = async (over = {}) => {
  const res = await request(app).post("/api/applications").send({ ...application, ...over });
  return res.body.id;
};

beforeAll(async () => {
  ({ app, db, auth } = await createTestApp());
});

describe("admin guard", () => {
  it("rejects unauthenticated access", async () => {
    expect((await request(app).get("/api/admin/applications")).status).toBe(401);
  });
  it("rejects signed-in users without the admin role", async () => {
    expect((await as("user_regular").get("/api/admin/applications")).status).toBe(403);
  });
  it("returns the current admin from /me", async () => {
    const res = await admin().get("/api/admin/me");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: "user_admin", email: "admin@example.com" });
  });
});

describe("GET /api/admin/applications", () => {
  it("lists pending applications with the current record attached", async () => {
    await submit();
    const res = await admin().get("/api/admin/applications?status=pending");
    expect(res.status).toBe(200);
    const item = res.body.find((a) => a.firstName === "Ana");
    expect(item.currentRecord).toEqual({
      time: "0:26.34",
      athlete: "Bogdanovska Anastasija",
    });
  });
  it("returns counts per status", async () => {
    const res = await admin().get("/api/admin/applications/counts");
    expect(res.status).toBe(200);
    expect(res.body.pending).toBeGreaterThan(0);
    expect(res.body).toHaveProperty("approved");
    expect(res.body).toHaveProperty("denied");
  });
});

describe("approve / deny", () => {
  it("approve replaces the record and records the reviewer", async () => {
    const id = await submit({ time: "0:25.50" });
    const res = await admin().post(`/api/admin/applications/${id}/approve`);
    expect(res.status).toBe(200);
    const rec = await db.record.findFirst({
      where: { pool: "25", gender: "female", category: "Seniors (17+)", discipline: "50m Freestyle" },
      select: { time: true, athlete: true },
    });
    expect(rec).toEqual({ time: "0:25.50", athlete: "Stojanova Ana" });
    const appRow = await db.recordApplication.findUnique({
      where: { id },
      select: { status: true, reviewerId: true },
    });
    expect(appRow).toEqual({ status: "approved", reviewerId: "user_admin" });
  });
  it("deny marks the application and leaves the record alone", async () => {
    const id = await submit({ discipline: "100m Freestyle", time: "0:55.00" });
    const res = await admin().post(`/api/admin/applications/${id}/deny`);
    expect(res.status).toBe(200);
    const rec = await db.record.findFirst({
      where: { pool: "25", gender: "female", category: "Seniors (17+)", discipline: "100m Freestyle" },
      select: { time: true },
    });
    expect(rec.time).toBe("0:56.12");
  });
  it("acting on a non-pending application returns 409", async () => {
    const id = await submit({ time: "0:25.40" });
    await admin().post(`/api/admin/applications/${id}/approve`);
    expect((await admin().post(`/api/admin/applications/${id}/approve`)).status).toBe(409);
    expect((await admin().post(`/api/admin/applications/${id}/deny`)).status).toBe(409);
  });
});

describe("team management", () => {
  it("lists admins only", async () => {
    const res = await admin().get("/api/admin/team");
    expect(res.status).toBe(200);
    expect(res.body.admins.map((a) => a.id)).toEqual(["user_admin"]);
  });
  it("grants the role to an existing user", async () => {
    const res = await admin().post("/api/admin/team", { email: "regular@example.com" });
    expect(res.body).toEqual({ status: "granted" });
    expect((await as("user_regular").get("/api/admin/me")).status).toBe(200);
  });
  it("rejects adding someone who is already an admin", async () => {
    expect((await admin().post("/api/admin/team", { email: "admin@example.com" })).status).toBe(409);
  });
  it("invites unknown emails and can revoke the invitation", async () => {
    const res = await admin().post("/api/admin/team", { email: "New@Example.com" });
    expect(res.status).toBe(201);
    const team = await admin().get("/api/admin/team");
    expect(team.body.invitations).toHaveLength(1);
    expect(team.body.invitations[0].email).toBe("new@example.com");
    const del = await admin().delete(`/api/admin/team/invitations/${team.body.invitations[0].id}`);
    expect(del.status).toBe(200);
    expect(auth.invitations).toHaveLength(0);
  });
  it("rejects invalid emails", async () => {
    expect((await admin().post("/api/admin/team", { email: "nope" })).status).toBe(400);
  });
  it("removes another admin but never yourself", async () => {
    expect((await admin().delete("/api/admin/team/admins/user_admin")).status).toBe(400);
    expect((await admin().delete("/api/admin/team/admins/user_regular")).status).toBe(200);
    expect((await as("user_regular").get("/api/admin/me")).status).toBe(403);
  });
});
