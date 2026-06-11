// server/tests/applications.test.js
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createTestApp } from "./helpers.js";

let app, db;
beforeAll(async () => {
  ({ app, db } = await createTestApp());
});

const good = {
  firstName: "Ana",
  lastName: "Stojanova",
  gender: "female",
  pool: "25",
  category: "Seniors (17+)",
  discipline: "50m Freestyle",
  time: "0:25.99",
  proofUrl: "https://results.example.com/1",
};

describe("POST /api/applications", () => {
  it("creates a pending application", async () => {
    const res = await request(app).post("/api/applications").send(good);
    expect(res.status).toBe(201);
    expect(res.body.id).toBeTruthy();
    const row = await db.recordApplication.findUnique({
      where: { id: res.body.id },
    });
    expect(row.status).toBe("pending");
    expect(row.firstName).toBe("Ana");
  });
  it("rejects invalid payloads", async () => {
    const res = await request(app).post("/api/applications").send({ ...good, time: "fast" });
    expect(res.status).toBe(400);
    expect(res.body.errors).toContain("time");
  });
  it("rejects category/discipline that has no record slot", async () => {
    const res = await request(app)
      .post("/api/applications")
      .send({ ...good, discipline: "999m Doggy Paddle" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/discipline/i);
  });
});
