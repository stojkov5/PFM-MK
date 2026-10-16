import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createTestApp } from "./helpers.js";
import { ensureCriteria } from "../lib/criteria.js";

let app, db;

const admin = {
  get: (url) => request(app).get(url).set("x-test-user", "user_admin"),
  post: (url, body) => request(app).post(url).set("x-test-user", "user_admin").send(body),
  put: (url, body) => request(app).put(url).set("x-test-user", "user_admin").send(body),
  delete: (url) => request(app).delete(url).set("x-test-user", "user_admin"),
};

const PDF = Buffer.from("%PDF-1.4\n%test\n");
const uploadPdf = async (name = "norms.pdf") => {
  const res = await request(app)
    .post(`/api/admin/media?name=${name}`)
    .set("x-test-user", "user_admin")
    .set("Content-Type", "application/pdf")
    .send(PDF);
  expect(res.status).toBe(201);
  return res.body.id;
};
const addDoc = async (over = {}) => {
  const res = await admin.post("/api/admin/criteria", {
    sport: "swimming",
    title: "Европско првенство",
    description: "Париз · 50м",
    mediaId: await uploadPdf(),
    ...over,
  });
  expect(res.status).toBe(201);
  return res.body.id;
};
const titles = async (sport = "swimming") =>
  (await request(app).get(`/api/criteria?sport=${sport}`)).body.map((d) => d.title);

beforeEach(async () => {
  ({ app, db } = await createTestApp());
});

describe("criteria documents", () => {
  it("are admin-only to manage", async () => {
    expect((await request(app).post("/api/admin/criteria").send({})).status).toBe(401);
    expect((await request(app).get("/api/admin/criteria").set("x-test-user", "user_club")).status).toBe(403);
  });

  it("are listed per sport with a link to the PDF", async () => {
    await addDoc();
    await addDoc({ sport: "distance-swimming", title: "Охрид" });
    const res = await request(app).get("/api/criteria?sport=swimming");
    expect(res.body).toMatchObject([
      { title: "Европско првенство", description: "Париз · 50м", file: { name: "norms.pdf" } },
    ]);
    expect(res.body[0].url).toMatch(/^\/api\/media\//);
    expect(await titles("distance-swimming")).toEqual(["Охрид"]);
    expect((await request(app).get("/api/criteria?sport=nope")).status).toBe(400);
  });

  it("need a sport, a name and an uploaded PDF", async () => {
    const image = await request(app)
      .post("/api/admin/media?name=x.png")
      .set("x-test-user", "user_admin")
      .set("Content-Type", "image/png")
      .send(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0]));
    const res = await admin.post("/api/admin/criteria", { sport: "golf", title: " ", mediaId: image.body.id });
    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(expect.arrayContaining(["sport", "title", "file"]));
  });

  it("can be renamed, moved to another sport and get a new PDF (the old file is removed)", async () => {
    const id = await addDoc();
    const oldMedia = (await db.criteriaDocument.findUnique({ where: { id } })).mediaId;

    expect((await admin.put(`/api/admin/criteria/${id}`, { sport: "swimming", title: "Ново име" })).status).toBe(200);
    expect(await titles()).toEqual(["Ново име"]);
    expect((await db.criteriaDocument.findUnique({ where: { id } })).mediaId).toBe(oldMedia);

    const newMedia = await uploadPdf("new.pdf");
    await admin.put(`/api/admin/criteria/${id}`, { sport: "distance-swimming", title: "Ново име", mediaId: newMedia });
    expect(await titles()).toEqual([]);
    expect(await titles("distance-swimming")).toEqual(["Ново име"]);
    expect(await db.media.findUnique({ where: { id: oldMedia } })).toBeNull();
  });

  it("can be reordered and deleted", async () => {
    const a = await addDoc({ title: "A" });
    await addDoc({ title: "B" });
    const c = await addDoc({ title: "C" });
    await admin.post(`/api/admin/criteria/${c}/move`, { direction: "up" });
    expect(await titles()).toEqual(["A", "C", "B"]);
    await admin.post(`/api/admin/criteria/${a}/move`, { direction: "up" }); // already first
    expect(await titles()).toEqual(["A", "C", "B"]);

    const media = (await db.criteriaDocument.findUnique({ where: { id: a } })).mediaId;
    expect((await admin.delete(`/api/admin/criteria/${a}`)).status).toBe(200);
    expect(await titles()).toEqual(["C", "B"]);
    expect(await db.media.findUnique({ where: { id: media } })).toBeNull();
  });

  it("files can be served as a download", async () => {
    const id = await uploadPdf("Лимити.pdf");
    const open = await request(app).get(`/api/media/${id}`);
    expect(open.headers["content-disposition"]).toMatch(/^inline/);
    const dl = await request(app).get(`/api/media/${id}?download=1`);
    expect(dl.headers["content-disposition"]).toMatch(/^attachment; filename\*=UTF-8''%D0%9B/);
  });
});

describe("criteria import", () => {
  it("imports the original swimming PDFs once, and never again", async () => {
    expect(await ensureCriteria(db)).toBe(7);
    expect(await titles()).toHaveLength(7);
    expect((await titles())[0]).toBe("Мултинации Австрија");

    await db.criteriaDocument.deleteMany({});
    expect(await ensureCriteria(db)).toBe(0);
    expect(await titles()).toEqual([]);
  });
});
