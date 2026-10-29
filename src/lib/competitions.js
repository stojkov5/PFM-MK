// src/lib/competitions.js
// Helpers shared by the competition calendar, the submission form and the
// admin panel. Dates come from the API as "YYYY-MM-DD" calendar days.
import { formatLongDate, monthLong, monthShort } from "./dates.js";
export const COURSES = ["SC", "LC", "OW"];

// Sports with a club-run calendar, and their public pages.
export const CALENDAR_SPORTS = {
  swimming: { calendar: "/swimming/calendar-national", submit: "/swimming/calendar-national/submit" },
  waterpolo: { calendar: "/waterpolo/calendar", submit: "/waterpolo/calendar/submit" },
};
export const sportPaths = (sport) => CALENDAR_SPORTS[sport] ?? CALENDAR_SPORTS.swimming;
// Only swimming competitions have a pool length (25m / 50m / open water).
export const hasCourse = (sport) => sport === "swimming";

// Club-type prefix (ПВК / ПСК / ПК) left out where space is short.
const TYPE_PREFIX = /^(ПВК|ПСК|ПК|PK)\s+/i;
export const shortClubName = (name = "") => name.trim().replace(TYPE_PREFIX, "");

// "Делфин Скопје" → "ДС"
export const clubInitials = (name = "") =>
  shortClubName(name)
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("") || "•";

// Calendar day at local midnight, so formatting never shifts a day.
export const toDate = (day) => {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const todayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const dd = (date) => String(date.getDate()).padStart(2, "0");

// "Oct 01 – 03", "Oct 28 – Nov 01", "Oct 01"
export const formatRange = (start, end, locale) => {
  const a = toDate(start);
  const b = toDate(end ?? start);
  if (start === (end ?? start)) return `${monthShort(a, locale)} ${dd(a)}`;
  if (a.getMonth() === b.getMonth()) return `${monthShort(a, locale)} ${dd(a)} – ${dd(b)}`;
  return `${monthShort(a, locale)} ${dd(a)} – ${monthShort(b, locale)} ${dd(b)}`;
};

// "1 October 2026"
export const formatDay = (day, locale) => formatLongDate(toDate(day), locale);

export const monthName = (monthIndex, locale) => monthLong(monthIndex, locale);

// [{ key: "2026-10", month: 9, year: 2026, items: [...] }] in date order.
export const groupByMonth = (competitions) => {
  const groups = new Map();
  for (const c of competitions) {
    const key = c.startDate.slice(0, 7);
    if (!groups.has(key)) {
      groups.set(key, { key, year: Number(key.slice(0, 4)), month: Number(key.slice(5, 7)) - 1, items: [] });
    }
    groups.get(key).items.push(c);
  }
  return [...groups.values()];
};
