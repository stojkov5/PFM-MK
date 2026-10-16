// server/lib/competitions.js
// Validation and shaping of calendar competitions (see the Competition model).
import { randomBytes } from "node:crypto";
import { isValidProofUrl } from "./validate.js";

export const SPORTS = ["swimming"];
export const COURSES = ["SC", "LC", "OW"];
export const STATUSES = ["pending", "changes", "approved", "denied"];
// Statuses a club (or an admin) can still change before a final decision.
export const OPEN_STATUSES = ["pending", "changes"];

export const pickSport = (v) => (SPORTS.includes(v) ? v : SPORTS[0]);

export const newEditToken = () => randomBytes(24).toString("base64url");

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_DAYS = 31;

// Dates are calendar days ("2027-03-14"), stored as UTC midnight so they never
// shift with time zones.
export const parseDay = (v) => {
  if (typeof v !== "string" || !DATE_RE.test(v)) return null;
  const d = new Date(`${v}T00:00:00Z`);
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== v ? null : d;
};
export const dayString = (d) => (d ? new Date(d).toISOString().slice(0, 10) : null);
export const todayUtc = () => parseDay(new Date().toISOString().slice(0, 10));

const text = (v, max) => {
  if (typeof v !== "string") return "";
  const s = v.trim();
  return s.length <= max ? s : null;
};

/**
 * Checks a competition from a club account (`admin: false`) or the admin
 * panel (`admin: true`). `club` is the organizing Club (looked up by the
 * caller): clubs always have one and must give contact details; admins may
 * type any organizer instead and skip the contact fields.
 */
export const validateCompetition = (body = {}, { admin = false, club = null } = {}) => {
  const errors = [];
  const field = (key, max, required) => {
    const v = text(body[key], max);
    if (v === null || (required && !v)) errors.push(key);
    return v ?? "";
  };

  const name = field("name", 200, true);

  let clubId = null;
  let clubName = "";
  if (club) {
    clubId = club.id;
    clubName = club.name;
  } else if (admin) {
    clubName = field("clubName", 200, true);
  } else {
    errors.push("clubId");
  }

  const startDate = parseDay(body.startDate);
  const endDate = parseDay(body.endDate ?? body.startDate);
  if (!startDate) errors.push("startDate");
  else if (!admin && startDate < todayUtc()) errors.push("startDate");
  if (!endDate) errors.push("endDate");
  if (startDate && endDate) {
    const days = (endDate - startDate) / 86_400_000;
    if (days < 0 || days > MAX_DAYS) errors.push("endDate");
  }

  const startTime = body.startTime ? String(body.startTime) : null;
  if (startTime && !TIME_RE.test(startTime)) errors.push("startTime");

  const city = field("city", 100, true);
  const venue = field("venue", 200, false);
  if (!COURSES.includes(body.course)) errors.push("course");
  const criteria = field("criteria", 3000, !admin);
  const description = field("description", 3000, false);

  let entryDeadline = null;
  if (body.entryDeadline) {
    entryDeadline = parseDay(body.entryDeadline);
    if (!entryDeadline || (endDate && entryDeadline > endDate)) errors.push("entryDeadline");
  }

  const infoUrl = body.infoUrl ? String(body.infoUrl).trim() : null;
  if (infoUrl && !isValidProofUrl(infoUrl)) errors.push("infoUrl");

  const contactName = field("contactName", 100, !admin);
  const contactEmail = field("contactEmail", 200, !admin).toLowerCase();
  if (contactEmail && !EMAIL_RE.test(contactEmail)) errors.push("contactEmail");
  const contactPhone = field("contactPhone", 50, false);

  if (errors.length > 0) return { ok: false, errors: [...new Set(errors)] };
  return {
    ok: true,
    data: {
      name,
      clubId,
      clubName,
      startDate,
      endDate,
      startTime,
      city,
      venue,
      course: body.course,
      criteria,
      description,
      entryDeadline,
      infoUrl,
      contactName,
      contactEmail,
      contactPhone,
    },
  };
};

// What everyone may see: no contact details, no edit token.
export const toPublicDto = (c) => ({
  id: c.id,
  sport: c.sport,
  name: c.name,
  clubId: c.clubId,
  clubName: c.clubName,
  startDate: dayString(c.startDate),
  endDate: dayString(c.endDate),
  startTime: c.startTime,
  city: c.city,
  venue: c.venue,
  course: c.course,
  criteria: c.criteria,
  description: c.description,
  entryDeadline: dayString(c.entryDeadline),
  infoUrl: c.infoUrl,
});

// The club's own view through its edit link, and the admin panel's view.
export const toFullDto = (c) => ({
  ...toPublicDto(c),
  contactName: c.contactName,
  contactEmail: c.contactEmail,
  contactPhone: c.contactPhone,
  status: c.status,
  source: c.source,
  createdAt: c.createdAt,
  updatedAt: c.updatedAt,
  reviewedAt: c.reviewedAt,
  reviewerName: c.reviewerName,
});

export const overlaps = (a, b) =>
  a.id !== b.id && a.startDate <= b.endDate && b.startDate <= a.endDate;

// Where the registration window stands right now.
export const windowState = (w, now = new Date()) => {
  if (!w) return { status: "none" };
  const status = now < w.opensAt ? "upcoming" : now >= w.closesAt ? "closed" : "open";
  return { status, season: w.season, opensAt: w.opensAt, closesAt: w.closesAt };
};
