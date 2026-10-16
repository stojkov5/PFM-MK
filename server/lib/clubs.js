// server/lib/clubs.js
// Clubs live in the database (see the Club model). This file seeds the
// federation's original list, looks clubs up, and checks club sign-ups.
import { readFileSync } from "node:fs";

const SEED = JSON.parse(readFileSync(new URL("../db/clubs-seed.json", import.meta.url), "utf8"));

/**
 * Copies server/db/clubs-seed.json into an empty clubs table. Runs on every
 * server start but only does something the first time (after `npm run db:push`
 * added the table). Edits to the JSON file after that have no effect.
 */
export const ensureClubs = async (db) => {
  if ((await db.club.count()) > 0) return 0;
  await db.club.createMany({
    data: SEED.map((c) => ({
      id: c.id,
      name: c.name.trim(),
      city: c.city ?? "",
      type: c.type ?? "",
      address: c.address ?? "",
      email: c.email ?? "",
      phone: c.phone ?? "",
      president: c.president ?? "",
      test: !!c.test,
      status: "approved",
    })),
  });
  return SEED.length;
};

export const findClub = (db, id) => {
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? db.club.findUnique({ where: { id: n } }) : null;
};

const sameName = (a, b) => a.trim().toLocaleLowerCase("mk") === b.trim().toLocaleLowerCase("mk");

// Any club (also pending or test) with exactly this name, ignoring case.
export const findClubByName = async (db, name) => {
  if (typeof name !== "string" || !name.trim()) return null;
  const all = await db.club.findMany({ select: { id: true, name: true } });
  const hit = all.find((c) => sameName(c.name, name));
  return hit ? db.club.findUnique({ where: { id: hit.id } }) : null;
};

export const nextClubId = async (db) => {
  const last = await db.club.findFirst({ orderBy: { id: "desc" }, select: { id: true } });
  return (last?.id ?? 0) + 1;
};

// What everyone may see on the Clubs page.
export const toPublicClub = (c) => ({
  id: c.id,
  name: c.name,
  city: c.city,
  type: c.type,
  address: c.address,
  email: c.email,
  phone: c.phone,
  president: c.president,
});

// Shown to the club's own account and to admins.
export const toFullClub = (c) => ({
  ...toPublicClub(c),
  status: c.status,
  test: c.test,
  note: c.note,
  createdAt: c.createdAt,
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A club signing up: { ok, data } or { ok: false, errors: [field…] }.
// Admins editing a club (`admin: true`) only have to give the name, since
// some clubs on the federation's list have no phone or president on file.
export const validateClubApplication = (body = {}, { admin = false } = {}) => {
  const errors = [];
  const field = (key, max, required) => {
    const v = typeof body[key] === "string" ? body[key].trim() : "";
    if (v.length > max || (required && !admin && !v)) errors.push(key);
    return v.slice(0, max);
  };

  const data = {
    name: field("name", 150, true),
    city: field("city", 100, true),
    type: field("type", 100, true),
    address: field("address", 200, false),
    email: field("email", 200, true).toLowerCase(),
    phone: field("phone", 50, true),
    president: field("president", 100, true),
    note: field("note", 2000, false),
  };
  if (!data.name) errors.push("name");
  if (data.email && !EMAIL_RE.test(data.email)) errors.push("email");

  return errors.length ? { ok: false, errors: [...new Set(errors)] } : { ok: true, data };
};
