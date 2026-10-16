// server/lib/clubEmails.js
// Emails about club sign-ups. Written in Macedonian, like the calendar emails.
import { compose } from "./competitionEmails.js";

const detailLines = (club) =>
  [
    `Клуб: ${club.name}`,
    `Вид: ${club.type}`,
    `Град: ${club.city}`,
    club.address && `Адреса: ${club.address}`,
    `Претседател: ${club.president}`,
    `Е-пошта: ${club.email}`,
    `Телефон: ${club.phone}`,
  ].filter(Boolean);

// To the federation: a new club account waits for approval.
export const clubApplicationEmail = (club, site, by) =>
  compose(`Нова клупска сметка чека одобрување: ${club.name}`, [
    "Нов клуб се регистрираше на страницата и чека одобрување.",
    [...detailLines(club), `Сметка: ${[by.name, by.email].filter(Boolean).join(", ")}`].join("\n"),
    ...(club.note ? ["Порака од клубот:", { quote: club.note }] : []),
    { link: `${site}/admin`, label: "Отвори го админ панелот" },
  ]);

// To the club: we received the sign-up.
export const clubApplicationReceivedEmail = (club) =>
  compose(`Регистрацијата на „${club.name}“ е примена`, [
    "Почитувани,",
    "Ја примивме регистрацијата на вашиот клуб. Федерацијата ќе ги провери податоците и ќе ве извести по е-пошта кога сметката ќе биде одобрена.",
    detailLines(club).join("\n"),
    "Ако имате прашања, само одговорете на оваа порака.",
  ]);

// To the club: approved — it's on the Clubs page and can register competitions.
export const clubApprovedEmail = (club, site, note) =>
  compose(`Клубот „${club.name}“ е одобрен`, [
    "Почитувани,",
    "Федерацијата ја одобри сметката на вашиот клуб. Клубот е додаден на страницата „Клубови“ и од сега може да пријавува натпревари во календарот додека е отворен периодот за пријавување.",
    ...(note ? [{ quote: note }] : []),
    { link: `${site}/club`, label: "Отвори ја страницата „Мој клуб“" },
    "Ако имате прашања, само одговорете на оваа порака.",
  ]);

// To the club: rejected — the account is deleted.
export const clubRejectedEmail = (club, note) =>
  compose(`Регистрацијата на „${club.name}“ не е одобрена`, [
    "Почитувани,",
    "За жал, федерацијата не ја одобри регистрацијата на вашиот клуб, па сметката е избришана.",
    ...(note ? [{ quote: note }] : []),
    "Ако мислите дека станува збор за грешка, само одговорете на оваа порака.",
  ]);
