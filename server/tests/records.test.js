// server/tests/records.test.js
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createTestApp } from "./helpers.js";

let app;
beforeAll(async () => {
  ({ app } = await createTestApp());
});

describe("GET /api/records", () => {
  it("returns grouped categories for pool+gender, ordered", async () => {
    const res = await request(app).get("/api/records?pool=25&gender=female");
    expect(res.status).toBe(200);
    expect(res.body.map((c) => c.name)).toEqual(["Seniors (17+)", "Juniors (15/16)"]);
    expect(res.body[0].records[0]).toEqual({
      discipline: "50m Freestyle",
      time: "0:26.34",
      athlete: "Bogdanovska Anastasija",
    });
  });
  it("rejects bad params", async () => {
    expect((await request(app).get("/api/records?pool=33&gender=female")).status).toBe(400);
    expect((await request(app).get("/api/records?pool=25&gender=x")).status).toBe(400);
  });
});

describe("GET /api/records/options", () => {
  it("returns categories and per-category disciplines", async () => {
    const res = await request(app).get("/api/records/options?pool=25&gender=female");
    expect(res.status).toBe(200);
    expect(res.body.categories).toEqual(["Seniors (17+)", "Juniors (15/16)"]);
    expect(res.body.disciplines["Seniors (17+)"]).toContain("100m Freestyle");
    expect(res.body.disciplines["Juniors (15/16)"]).toEqual(["50m Freestyle"]);
  });
});

describe("GET /api/records/export", () => {
  const binary = (res, cb) => {
    const chunks = [];
    res.on("data", (c) => chunks.push(c));
    res.on("end", () => cb(null, Buffer.concat(chunks)));
  };

  it("downloads the list as an .xlsx file", async () => {
    const res = await request(app)
      .get("/api/records/export?pool=25&gender=female")
      .buffer()
      .parse(binary);
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("spreadsheetml.sheet");
    expect(res.headers["content-disposition"]).toContain("national-records-25m-women.xlsx");
    // An .xlsx file is a ZIP archive: "PK" signature, end record at the tail.
    expect(res.body.subarray(0, 4)).toEqual(Buffer.from([0x50, 0x4b, 0x03, 0x04]));
    expect(res.body.readUInt32LE(res.body.length - 22)).toBe(0x06054b50);
  });
  it("rejects bad params", async () => {
    expect((await request(app).get("/api/records/export?pool=33&gender=female")).status).toBe(400);
  });
});
