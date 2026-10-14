import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createTestApp } from "./helpers.js";
import { validateCompetition } from "../lib/competitions.js";

let app, db, mailer;

const inDays = (n) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);

const submission = (over = {}) => ({
  name: "Delfin Kup",
  clubId: 14, // ПК Делфин Скопје
  startDate: inDays(60),
  endDate: inDays(61),
  startTime: "09:00",
  city: "Скопје",
  venue: "Карпош",
  course: "SC",
  criteria: "2010–2016",
  contactName: "Ana",
  contactEmail: "Ana@Example.com",
  ...over,
});

const admin = {
  get: (url) => request(app).get(url).set("x-test-user", "user_admin"),
  post: (url, body) => request(app).post(url).set("x-test-user", "user_admin").send(body),
  put: (url, body) => request(app).put(url).set("x-test-user", "user_admin").send(body),
  delete: (url) => request(app).delete(url).set("x-test-user", "user_admin"),
};

const openWindow = () =>
  admin.put("/api/admin/competitions/window", {
    season: 2027,
    opensAt: new Date(Date.now() - 86_400_000).toISOString(),
    closesAt: new Date(Date.now() + 86_400_000).toISOString(),
  });

const submit = async (over) => {
  const res = await request(app).post("/api/competitions").send(submission(over));
  expect(res.status).toBe(201);
  return res.body;
};

beforeEach(async () => {
  ({ app, db, mailer } = await createTestApp());
});

describe("validateCompetition", () => {
  it("requires a listed club, contact details and criteria from clubs", () => {
    const v = validateCompetition({ ...submission(), clubId: 999, contactEmail: "", criteria: "" });
    expect(v.ok).toBe(false);
    expect(v.errors).toEqual(expect.arrayContaining(["clubId", "contactEmail", "criteria"]));
  });
  it("rejects past dates, reversed ranges and bad times", () => {
    expect(validateCompetition(submission({ startDate: "2020-01-01", endDate: "2020-01-02" })).errors).toContain("startDate");
    expect(validateCompetition(submission({ endDate: inDays(50) })).errors).toContain("endDate");
    expect(validateCompetition(submission({ startTime: "25:00" })).errors).toContain("startTime");
    expect(validateCompetition(submission({ startDate: "2027-02-30" })).errors).toContain("startDate");
  });
  it("lets admins type any organizer", () => {
    const v = validateCompetition(
      { ...submission({ clubId: null, clubName: "НПФ", contactName: "", contactEmail: "" }) },
      { admin: true }
    );
    expect(v.ok).toBe(true);
    expect(v.data).toMatchObject({ clubId: null, clubName: "НПФ" });
  });
});

describe("registration window", () => {
  it("refuses submissions when no window is set or it is closed", async () => {
    expect((await request(app).post("/api/competitions").send(submission())).status).toBe(403);
    await openWindow();
    await admin.post("/api/admin/competitions/window/close", {});
    const res = await request(app).get("/api/competitions/window");
    expect(res.body.status).toBe("closed");
    expect((await request(app).post("/api/competitions").send(submission())).status).toBe(403);
  });
  it("reports an open window publicly", async () => {
    await openWindow();
    const res = await request(app).get("/api/competitions/window");
    expect(res.body).toMatchObject({ status: "open", season: 2027 });
  });
  it("is admin-only to change", async () => {
    const res = await request(app).put("/api/admin/competitions/window").send({});
    expect(res.status).toBe(401);
  });
});

describe("club submission", () => {
  beforeEach(openWindow);

  it("stores it as pending and emails the club and the federation", async () => {
    const { id } = await submit();
    const c = await db.competition.findUnique({ where: { id } });
    expect(c).toMatchObject({ status: "pending", clubName: "ПК Делфин Скопје", contactEmail: "ana@example.com" });
    expect(mailer.sent).toHaveLength(2);
    expect(mailer.sent[0].to).toEqual(["ana@example.com", "aleksandarf@yahoo.com"]);
    expect(mailer.sent[0].text).toContain(`submit?edit=${c.editToken}`);
    expect(mailer.sent[1].to).toEqual(["info@npf.mk"]);
  });

  it("is not public until approved", async () => {
    await submit();
    const res = await request(app).get("/api/competitions");
    expect(res.body.competitions).toEqual([]);
  });

  it("can be edited through the edit link while pending", async () => {
    const { editToken } = await submit();
    const view = await request(app).get(`/api/competitions/edit/${editToken}`);
    expect(view.body).toMatchObject({ canEdit: true, competition: { name: "Delfin Kup", status: "pending" } });
    const res = await request(app).put(`/api/competitions/edit/${editToken}`).send(submission({ name: "Delfin Cup" }));
    expect(res.status).toBe(200);
    expect((await db.competition.findFirst()).name).toBe("Delfin Cup");
  });

  it("rejects unknown edit links", async () => {
    expect((await request(app).get("/api/competitions/edit/nope-nope-nope-nope-nope")).status).toBe(404);
  });
});

describe("admin review", () => {
  beforeEach(openWindow);

  it("lists pending submissions with overlapping ones", async () => {
    const a = await submit();
    await submit({ name: "Neptun Kup", clubId: 8, startDate: inDays(61), endDate: inDays(62) });
    await submit({ name: "Far away", startDate: inDays(90), endDate: inDays(90) });
    const res = await admin.get("/api/admin/competitions?status=pending");
    expect(res.status).toBe(200);
    const item = res.body.find((c) => c.id === a.id);
    expect(item.overlaps.map((o) => o.name)).toEqual(["Neptun Kup"]);
    expect((await admin.get("/api/admin/competitions/counts")).body.pending).toBe(3);
  });

  it("approve publishes it and emails the club", async () => {
    const { id } = await submit();
    mailer.sent.length = 0;
    const res = await admin.post(`/api/admin/competitions/${id}/approve`, {});
    expect(res.body).toEqual({ ok: true, emailed: true });
    const pub = await request(app).get("/api/competitions");
    expect(pub.body.competitions).toHaveLength(1);
    expect(pub.body.competitions[0]).not.toHaveProperty("contactEmail");
    expect(pub.body.competitions[0]).not.toHaveProperty("editToken");
    expect(mailer.sent[0].subject).toContain("одобрен");
    expect((await admin.post(`/api/admin/competitions/${id}/approve`, {})).status).toBe(409);
  });

  it("asking for changes needs a message, emails it, and the club's edit sends it back to pending", async () => {
    const { id, editToken } = await submit();
    expect((await admin.post(`/api/admin/competitions/${id}/changes`, {})).status).toBe(400);
    mailer.sent.length = 0;
    await admin.post(`/api/admin/competitions/${id}/changes`, { message: "Overlaps with Neptun Kup" });
    expect((await db.competition.findUnique({ where: { id } })).status).toBe("changes");
    expect(mailer.sent[0].text).toContain("Overlaps with Neptun Kup");
    expect(mailer.sent[0].text).toContain(editToken);

    // Even with the window closed, the club can still fix it.
    await admin.post("/api/admin/competitions/window/close", {});
    const view = await request(app).get(`/api/competitions/edit/${editToken}`);
    expect(view.body.canEdit).toBe(true);
    expect(view.body.messages[0].body).toBe("Overlaps with Neptun Kup");
    await request(app).put(`/api/competitions/edit/${editToken}`).send(submission({ startDate: inDays(70), endDate: inDays(70) }));
    expect((await db.competition.findUnique({ where: { id } })).status).toBe("pending");
  });

  it("deny emails the reason and locks the edit link", async () => {
    const { id, editToken } = await submit();
    await admin.post(`/api/admin/competitions/${id}/deny`, { message: "Not a sanctioned meet" });
    expect((await db.competition.findUnique({ where: { id } })).status).toBe("denied");
    const view = await request(app).get(`/api/competitions/edit/${editToken}`);
    expect(view.body.canEdit).toBe(false);
    expect((await request(app).put(`/api/competitions/edit/${editToken}`).send(submission())).status).toBe(409);
  });

  it("admins add approved competitions directly, edit and delete them", async () => {
    const res = await admin.post("/api/admin/competitions", {
      name: "National Championships",
      clubName: "НПФ",
      startDate: "2027-07-01",
      endDate: "2027-07-03",
      city: "Скопје",
      course: "LC",
    });
    expect(res.status).toBe(201);
    const pub = await request(app).get("/api/competitions?year=2027");
    expect(pub.body).toMatchObject({ years: [2027], competitions: [{ name: "National Championships", startDate: "2027-07-01" }] });

    const put = await admin.put(`/api/admin/competitions/${res.body.id}`, {
      name: "National Championships",
      clubName: "НПФ",
      startDate: "2027-07-02",
      city: "Скопје",
      course: "LC",
    });
    expect(put.status).toBe(200);
    expect((await request(app).get("/api/competitions")).body.competitions[0].endDate).toBe("2027-07-02");

    expect((await admin.delete(`/api/admin/competitions/${res.body.id}`)).status).toBe(200);
    expect((await request(app).get("/api/competitions")).body.competitions).toEqual([]);
  });
});
