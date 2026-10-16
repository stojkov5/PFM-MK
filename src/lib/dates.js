// src/lib/dates.js
// Month names and dates in the site's language. Many browsers ship no
// Macedonian date data, so Intl.DateTimeFormat("mk") quietly falls back to
// English ("July"); Macedonian names are therefore built in here.

const MK_MONTHS = [
  "јануари",
  "февруари",
  "март",
  "април",
  "мај",
  "јуни",
  "јули",
  "август",
  "септември",
  "октомври",
  "ноември",
  "декември",
];
const MK_MONTHS_SHORT = ["јан", "фев", "мар", "апр", "мај", "јун", "јул", "авг", "сеп", "окт", "ное", "дек"];

const isMk = (locale) => String(locale ?? "").toLowerCase().startsWith("mk");
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// "Јули" / "July"
export const monthLong = (monthIndex, locale) =>
  capitalize(
    isMk(locale)
      ? MK_MONTHS[monthIndex]
      : new Intl.DateTimeFormat(locale, { month: "long" }).format(new Date(2000, monthIndex, 1))
  );

// "јул" / "Jul"
export const monthShort = (date, locale) =>
  isMk(locale)
    ? MK_MONTHS_SHORT[date.getMonth()]
    : new Intl.DateTimeFormat(locale, { month: "short" }).format(date).replace(/\.$/, "");

// "1 октомври 2026" / "1 October 2026"
export const formatLongDate = (date, locale) => {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return isMk(locale)
    ? `${d.getDate()} ${MK_MONTHS[d.getMonth()]} ${d.getFullYear()}`
    : new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(d);
};
