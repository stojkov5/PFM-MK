// server/tests/auth.test.js
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createTestApp, TEST_ADMIN } from "./helpers.js";

let app;
beforeAll(async () => {
  ({ app } = await createTestApp());
});

describe("auth", () => {
  it("login with valid credentials sets cookie and returns username", async () => {
    const agent = request.agent(app);
    const res = await agent.post("/api/auth/login").send(TEST_ADMIN);
    expect(res.status).toBe(200);
    expect(res.body.username).toBe(TEST_ADMIN.username);
    expect(res.headers["set-cookie"][0]).toMatch(/pfm_admin=/);
    const me = await agent.get("/api/auth/me");
    expect(me.status).toBe(200);
    expect(me.body.username).toBe(TEST_ADMIN.username);
  });
  it("login with bad credentials returns generic 401", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: TEST_ADMIN.username, password: "wrong" });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid credentials");
  });
  it("me without cookie is 401; logout clears session", async () => {
    expect((await request(app).get("/api/auth/me")).status).toBe(401);
    const agent = request.agent(app);
    await agent.post("/api/auth/login").send(TEST_ADMIN);
    await agent.post("/api/auth/logout");
    expect((await agent.get("/api/auth/me")).status).toBe(401);
  });
});
