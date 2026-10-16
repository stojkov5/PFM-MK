// server/lib/competitionEmails.js
// The emails sent about calendar competitions. Written in Macedonian — they go
// to the clubs and to the federation's inbox.
import { dayString } from "./competitions.js";

const SIGNATURE = "Национална пливачка федерација на Македонија";

const escapeHtml = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);

const fmtDay = (d) => {
  const [y, m, day] = dayString(d).split("-");
  return `${day}.${m}.${y}`;
};
export const fmtRange = (c) => {
  const a = fmtDay(c.startDate);
  const b = fmtDay(c.endDate);
  return a === b ? a : `${a} – ${b}`;
};

const COURSE = { SC: "25 м базен", LC: "50 м базен", OW: "Отворени води" };

const summaryLines = (c) => [
  `Натпревар: ${c.name}`,
  `Организатор: ${c.clubName}`,
  `Датум: ${fmtRange(c)}${c.startTime ? `, почеток ${c.startTime}` : ""}`,
  `Место: ${[c.venue, c.city].filter(Boolean).join(", ")}`,
  `Базен: ${COURSE[c.course] ?? c.course}`,
];

// Builds { subject, text, html } from paragraphs. A paragraph is a string or
// { quote } for the admin's own words, or { link, label }.
export const compose = (subject, paragraphs) => {
  const all = [...paragraphs, `Поздрав,\n${SIGNATURE}`];
  const text = all
    .map((p) =>
      typeof p === "string" ? p : p.quote ? p.quote : `${p.label}: ${p.link}`
    )
    .join("\n\n");
  const html = all
    .map((p) => {
      if (typeof p === "string") return `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`;
      if (p.quote) {
        return `<blockquote style="margin:0;padding:10px 14px;border-left:3px solid #38bdf8;background:#f1f5f9">${escapeHtml(p.quote).replace(/\n/g, "<br>")}</blockquote>`;
      }
      return `<p><a href="${escapeHtml(p.link)}">${escapeHtml(p.label)}</a></p>`;
    })
    .join("\n");
  return {
    subject,
    text,
    html: `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#0f172a">${html}</div>`,
  };
};

// The club account's page, where the club sees its competitions and edits them.
const clubPageLink = (site) => ({ link: `${site}/club`, label: "Отвори ја страницата „Мој клуб“" });

export const submittedEmail = (c, site) =>
  compose(`Пријавата за „${c.name}“ е примена`, [
    "Почитувани,",
    "Ја примивме пријавата на вашиот натпревар за календарот. Федерацијата ќе ја разгледа и ќе ве извести по е-пошта кога ќе биде одобрена.",
    summaryLines(c).join("\n"),
    "Додека пријавата чека на одобрување, можете да ја измените на страницата „Мој клуб“ (најавете се со сметката на клубот):",
    clubPageLink(site),
  ]);

export const federationNoticeEmail = (c, site, { updated = false, by = null } = {}) =>
  compose(
    `${updated ? "Изменета пријава" : "Нова пријава"} за календарот: ${c.name} (${c.clubName})`,
    [
      updated
        ? "Клубот ја измени својата пријава и таа повторно чека на одобрување."
        : "Нов натпревар чека на одобрување.",
      [
        ...summaryLines(c),
        `Контакт: ${[c.contactName, c.contactEmail, c.contactPhone].filter(Boolean).join(", ")}`,
        ...(by ? [`Пријавено од сметката: ${by}`] : []),
      ].join("\n"),
      { link: `${site}/admin`, label: "Отвори го админ панелот" },
    ]
  );

export const approvedEmail = (c, site, note) =>
  compose(`Натпреварот „${c.name}“ е одобрен`, [
    "Почитувани,",
    "Вашиот натпревар е одобрен и објавен во календарот на федерацијата.",
    summaryLines(c).join("\n"),
    ...(note ? [{ quote: note }] : []),
    { link: `${site}/swimming/calendar-national`, label: "Погледни го календарот" },
  ]);

export const changesEmail = (c, site, note) =>
  compose(`Потребни се измени: „${c.name}“`, [
    "Почитувани,",
    "Федерацијата ја разгледа вашата пријава и бара измени пред да ја одобри:",
    { quote: note },
    summaryLines(c).join("\n"),
    "Изменете ја пријавата на страницата „Мој клуб“ (најавете се со сметката на клубот). Откако ќе ја зачувате, повторно ќе ја разгледаме.",
    clubPageLink(site),
    "Ако имате прашања, само одговорете на оваа порака.",
  ]);

export const deniedEmail = (c, site, note) =>
  compose(`Пријавата за „${c.name}“ е одбиена`, [
    "Почитувани,",
    "За жал, вашата пријава за натпреварот не е одобрена.",
    ...(note ? [{ quote: note }] : []),
    summaryLines(c).join("\n"),
    "Ако имате прашања, само одговорете на оваа порака.",
  ]);

// The club's addresses: the contact person from the form, plus the club's
// official email from the clubs list (so a club always hears about
// submissions made in its name).
export const clubRecipients = (c, club) => [c.contactEmail, club?.email].filter(Boolean);
