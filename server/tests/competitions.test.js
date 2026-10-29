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

const as = (user) => ({
  get: (url) => request(app).get(url).set("x-test-user", user),
  post: (url, body) => request(app).post(url).set("x-test-user", user).send(body),
  put: (url, body) => request(app).put(url).set("x-test-user", user).send(body),
  delete: (url) => request(app).delete(url).set("x-test-user", user),
});
const admin = as("user_admin");
const club = as("user_club"); // ПК Делфин Скопје (14)
const club2 = as("user_club2"); // ПК Младост Скопје (8)

const openWindow = (sport = "swimming") =>
  admin.put("/api/admin/competitions/window", {
    sport,
    season: 2027,
    opensAt: new Date(Date.now() - 86_400_000).toISOString(),
    closesAt: new Date(Date.now() + 86_400_000).toISOString(),
  });

const submit = async (over, by = club) => {
  const res = await by.post("/api/competitions", submission(over));
  expect(res.status).toBe(201);
  return res.body;
};

beforeEach(async () => {
  ({ app, db, mailer } = await createTestApp());
});

describe("validateCompetition", () => {
  it("requires a club, contact details and criteria from clubs", () => {
    const v = validateCompetition({ ...submission(), contactEmail: "", criteria: "" });
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
  it("needs a course for swimming only", () => {
    const club = { id: 14, name: "ПК Делфин Скопје" };
    expect(validateCompetition(submission({ course: "" }), { club }).errors).toContain("course");
    const v = validateCompetition(submission({ course: "" }), { club, sport: "waterpolo" });
    expect(v.ok).toBe(true);
    expect(v.data.course).toBe("");
    // A course sent for water polo is dropped.
    expect(validateCompetition(submission(), { club, sport: "waterpolo" }).data.course).toBe("");
  });
});

describe("registration window", () => {
  it("refuses submissions when no window is set or it is closed", async () => {
    expect((await club.post("/api/competitions", submission())).status).toBe(403);
    await openWindow();
    await admin.post("/api/admin/competitions/window/close", {});
    const res = await request(app).get("/api/competitions/window");
    expect(res.body.status).toBe("closed");
    expect((await club.post("/api/competitions", submission())).status).toBe(403);
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

  it("needs an approved club account", async () => {
    expect((await request(app).post("/api/competitions").send(submission())).status).toBe(401);
    expect((await as("user_regular").post("/api/competitions", submission())).status).toBe(403);
    expect((await as("user_club_pending").post("/api/competitions", submission())).status).toBe(403);
    expect(await db.competition.count()).toBe(0);
  });

  it("stores it as pending for the signed-in club and emails the club and the federation", async () => {
    // The body names another club; the account's own club wins.
    const { id } = await submit({ clubId: 8 });
    const c = await db.competition.findUnique({ where: { id } });
    expect(c).toMatchObject({ status: "pending", clubId: 14, clubName: "ПК Делфин Скопје", contactEmail: "ana@example.com" });
    expect(mailer.sent).toHaveLength(2);
    expect(mailer.sent[0].to).toEqual(["ana@example.com", "aleksandarf@yahoo.com"]);
    expect(mailer.sent[0].text).toContain("/club");
    expect(mailer.sent[0].text).not.toContain(c.editToken);
    expect(mailer.sent[1].to).toEqual(["info@npf.mk"]);
    expect(mailer.sent[1].text).toContain("delfin@example.com");
  });

  it("is not public until approved", async () => {
    await submit();
    const res = await request(app).get("/api/competitions");
    expect(res.body.competitions).toEqual([]);
  });

  it("is listed for the club only, and editable while pending", async () => {
    const { id } = await submit();
    const mine = await club.get("/api/competitions/mine");
    expect(mine.body.club).toEqual({ id: 14, name: "ПК Делфин Скопје" });
    expect(mine.body.competitions).toMatchObject([{ id, name: "Delfin Kup", status: "pending", canEdit: true }]);
    expect(mine.body.competitions[0]).not.toHaveProperty("editToken");
    expect((await club2.get("/api/competitions/mine")).body.competitions).toEqual([]);

    const res = await club.put(`/api/competitions/mine/${id}`, submission({ name: "Delfin Cup" }));
    expect(res.status).toBe(200);
    expect((await db.competition.findFirst()).name).toBe("Delfin Cup");
  });

  it("hides other clubs' competitions", async () => {
    const { id } = await submit();
    expect((await club2.get(`/api/competitions/mine/${id}`)).status).toBe(404);
    expect((await club2.put(`/api/competitions/mine/${id}`, submission({ name: "Hijacked" }))).status).toBe(404);
    expect((await db.competition.findFirst()).name).toBe("Delfin Kup");
  });
});

describe("admin review", () => {
  beforeEach(openWindow);

  it("lists pending submissions with overlapping ones", async () => {
    const a = await submit();
    await submit({ name: "Neptun Kup", startDate: inDays(61), endDate: inDays(62) }, club2);
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
    const { id } = await submit();
    expect((await admin.post(`/api/admin/competitions/${id}/changes`, {})).status).toBe(400);
    mailer.sent.length = 0;
    await admin.post(`/api/admin/competitions/${id}/changes`, { message: "Overlaps with Neptun Kup" });
    expect((await db.competition.findUnique({ where: { id } })).status).toBe("changes");
    expect(mailer.sent[0].text).toContain("Overlaps with Neptun Kup");
    expect(mailer.sent[0].text).toContain("/club");

    // Even with the window closed, the club can still fix it.
    await admin.post("/api/admin/competitions/window/close", {});
    const view = await club.get(`/api/competitions/mine/${id}`);
    expect(view.body.canEdit).toBe(true);
    expect(view.body.messages[0].body).toBe("Overlaps with Neptun Kup");
    await club.put(`/api/competitions/mine/${id}`, submission({ startDate: inDays(70), endDate: inDays(70) }));
    expect((await db.competition.findUnique({ where: { id } })).status).toBe("pending");
  });

  it("deny emails the reason and locks editing", async () => {
    const { id } = await submit();
    await admin.post(`/api/admin/competitions/${id}/deny`, { message: "Not a sanctioned meet" });
    expect((await db.competition.findUnique({ where: { id } })).status).toBe("denied");
    const view = await club.get(`/api/competitions/mine/${id}`);
    expect(view.body.canEdit).toBe(false);
    expect((await club.put(`/api/competitions/mine/${id}`, submission())).status).toBe(409);
  });

  it("links an admin's competition to a club when the organizer is a club's name", async () => {
    const res = await admin.post("/api/admin/competitions", {
      name: "Delfin Open",
      clubName: "ПК Делфин Скопје",
      startDate: "2027-05-01",
      city: "Скопје",
      course: "SC",
    });
    expect(res.status).toBe(201);
    expect(await db.competition.findUnique({ where: { id: res.body.id } })).toMatchObject({ clubId: 14 });
    expect((await club.get("/api/competitions/mine")).body.competitions).toHaveLength(1);
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

describe("water polo calendar", () => {
  const waterpolo = (over) => submission({ sport: "waterpolo", course: undefined, ...over });

  it("has its own registration window", async () => {
    await openWindow("swimming");
    expect((await club.post("/api/competitions", waterpolo())).status).toBe(403);
    expect((await request(app).get("/api/competitions/window?sport=waterpolo")).body.status).toBe("none");

    await openWindow("waterpolo");
    expect((await club.post("/api/competitions", waterpolo())).status).toBe(201);
    expect(await db.competition.findFirst()).toMatchObject({ sport: "waterpolo", course: "", status: "pending" });
  });

  it("is reviewed and listed apart from swimming", async () => {
    await openWindow("swimming");
    await openWindow("waterpolo");
    await submit();
    const { id } = await submit({ sport: "waterpolo", name: "Ватерполо турнир" });

    const pending = await admin.get("/api/admin/competitions?sport=waterpolo&status=pending");
    expect(pending.body.map((c) => c.id)).toEqual([id]);
    // Same dates as the swimming one, but only the same sport counts as an overlap.
    expect(pending.body[0].overlaps).toEqual([]);
    expect((await admin.get("/api/admin/competitions/counts?sport=waterpolo")).body.pending).toBe(1);

    expect((await admin.post(`/api/admin/competitions/${id}/approve`, {})).status).toBe(200);
    expect(mailer.sent.at(-1).text).toContain("/waterpolo/calendar");
    const wp = await request(app).get("/api/competitions?sport=waterpolo");
    expect(wp.body.competitions).toMatchObject([{ id, sport: "waterpolo", course: "" }]);
    expect((await request(app).get("/api/competitions")).body.competitions).toEqual([]);
  });
});
