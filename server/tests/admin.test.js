// server/tests/admin.test.js
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createTestApp, TEST_ADMIN } from "./helpers.js";

let app, db, agent;

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

const submit = async (over = {}) => {
  const res = await request(app).post("/api/applications").send({ ...application, ...over });
  return res.body.id;
};

beforeAll(async () => {
  ({ app, db } = await createTestApp());
  agent = request.agent(app);
  await agent.post("/api/auth/login").send(TEST_ADMIN);
});

describe("admin guard", () => {
  it("rejects unauthenticated access", async () => {
    expect((await request(app).get("/api/admin/applications")).status).toBe(401);
  });
});

describe("GET /api/admin/applications", () => {
  it("lists pending applications with the current record attached", async () => {
    await submit();
    const res = await agent.get("/api/admin/applications?status=pending");
    expect(res.status).toBe(200);
    const item = res.body.find((a) => a.firstName === "Ana");
    expect(item.currentRecord).toEqual({
      time: "0:26.34",
      athlete: "Bogdanovska Anastasija",
    });
  });
});

describe("approve / deny", () => {
  it("approve replaces the record and marks the application", async () => {
    const id = await submit({ time: "0:25.50" });
    const res = await agent.post(`/api/admin/applications/${id}/approve`);
    expect(res.status).toBe(200);
    const rec = await db.record.findFirst({
      where: { pool: "25", gender: "female", category: "Seniors (17+)", discipline: "50m Freestyle" },
      select: { time: true, athlete: true },
    });
    expect(rec).toEqual({ time: "0:25.50", athlete: "Stojanova Ana" });
    const appRow = await db.recordApplication.findUnique({
      where: { id },
      select: { status: true, reviewedBy: true },
    });
    expect(appRow.status).toBe("approved");
    expect(appRow.reviewedBy).not.toBeNull();
  });
  it("deny marks the application and leaves the record alone", async () => {
    const id = await submit({ discipline: "100m Freestyle", time: "0:55.00" });
    const res = await agent.post(`/api/admin/applications/${id}/deny`);
    expect(res.status).toBe(200);
    const rec = await db.record.findFirst({
      where: { pool: "25", gender: "female", category: "Seniors (17+)", discipline: "100m Freestyle" },
      select: { time: true },
    });
    expect(rec.time).toBe("0:56.12");
  });
  it("acting on a non-pending application returns 409", async () => {
    const id = await submit({ time: "0:25.40" });
    await agent.post(`/api/admin/applications/${id}/approve`);
    expect((await agent.post(`/api/admin/applications/${id}/approve`)).status).toBe(409);
    expect((await agent.post(`/api/admin/applications/${id}/deny`)).status).toBe(409);
  });
});

describe("POST /api/admin/admins", () => {
  it("creates a new admin who can log in", async () => {
    const res = await agent
      .post("/api/admin/admins")
      .send({ username: "second", password: "long-enough-pw" });
    expect(res.status).toBe(201);
    const login = await request(app)
      .post("/api/auth/login")
      .send({ username: "second", password: "long-enough-pw" });
    expect(login.status).toBe(200);
  });
  it("rejects short passwords and duplicates", async () => {
    expect(
      (await agent.post("/api/admin/admins").send({ username: "x", password: "short" })).status
    ).toBe(400);
    expect(
      (await agent.post("/api/admin/admins").send({ username: "second", password: "long-enough-pw" })).status
    ).toBe(409);
  });
});
