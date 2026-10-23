// server/lib/newsEmails.js
// When an article is published for the first time, an email about it goes to
// the audience the admin picked for it (article.emailAudience): every
// registered account, the newsletter subscribers (lib/newsletter.js), or a
// hand-picked list of addresses. Written in Macedonian, like the other emails.
//
// The route only marks the article emailStatus "pending"; sendPendingNewsEmails
// sends it once the article is live. It runs right after a save and on a timer
// (server/index.js), so articles scheduled for a later date go out on that date.
import { compose } from "./competitionEmails.js";
import { unsubscribeUrl } from "./newsletter.js";

// Keep in sync with news.categories in public/locales/mk/translation.json.
const CATEGORY_LABELS = {
  swimming: "Пливање",
  waterpolo: "Ватерполо",
  "distance-swimming": "Далечинско пливање",
  other: "Останато",
};

// Public URL of this API, for the cover image (/api/media/<id>) in the email.
// Railway sets RAILWAY_PUBLIC_DOMAIN; API_URL overrides it.
const apiBase = () => {
  if (process.env.API_URL) return process.env.API_URL.replace(/\/$/, "");
  if (process.env.RAILWAY_PUBLIC_DOMAIN) return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  return null;
};

// The last line of the email: why this person got it.
const REASONS = {
  all: "Оваа порака ја добивате затоа што имате регистрирана сметка на страницата на федерацијата.",
  subscribers: "Оваа порака ја добивате затоа што сте пријавени на билтенот на федерацијата.",
  manual: "Оваа порака ви ја испрати Националната пливачка федерација.",
};

// `unsubscribe` is the subscriber's own unsubscribe link (subscribers only).
export const newArticleEmail = (article, site, { unsubscribe = null, api = apiBase() } = {}) => {
  const label = CATEGORY_LABELS[article.category] ?? CATEGORY_LABELS.other;
  return compose(`Нова вест: ${article.title}`, [
    "Почитувани,",
    `На страницата на федерацијата е објавена нова вест во категоријата „${label}“.`,
    ...(article.coverImage && api ? [{ image: `${api}${article.coverImage}`, alt: article.title }] : []),
    article.title,
    ...(article.excerpt ? [{ quote: article.excerpt }] : []),
    { link: `${site}/news/${article.slug}`, label: "Прочитај ја веста" },
    REASONS[article.emailAudience] ?? REASONS.all,
    ...(unsubscribe ? [{ link: unsubscribe, label: "Откажи го билтенот" }] : []),
  ]);
};

// Every Clerk account that isn't banned or locked and has an email address:
// [{ email, name }].
export const registeredAccounts = async (clerk) => {
  const accounts = new Map();
  const limit = 500;
  for (let offset = 0; ; offset += limit) {
    const { data } = await clerk.users.getUserList({ limit, offset });
    for (const user of data) {
      if (user.banned || user.locked) continue;
      const email =
        user.primaryEmailAddress?.emailAddress ?? user.emailAddresses?.[0]?.emailAddress;
      if (!email || accounts.has(email.toLowerCase())) continue;
      accounts.set(email.toLowerCase(), {
        email: email.toLowerCase(),
        name: [user.firstName, user.lastName].filter(Boolean).join(" ") || null,
      });
    }
    if (data.length < limit) break;
  }
  return [...accounts.values()];
};

// Who an article's email goes to: { email: unsubscribeToken | null }.
// loadAccounts() (Clerk) is only called when the audience needs it.
export const recipientsFor = async (db, article, loadAccounts) => {
  switch (article.emailAudience) {
    case "manual":
      return Object.fromEntries((article.emailRecipients ?? []).map((e) => [e, null]));
    case "all":
      return Object.fromEntries((await loadAccounts()).map((a) => [a.email, null]));
    case "none":
      return {};
    default: {
      const subscribers = await db.newsletterSubscriber.findMany({ select: { email: true, token: true } });
      return Object.fromEntries(subscribers.map((s) => [s.email, s.token]));
    }
  }
};

/**
 * Emails the chosen audience about each article that is waiting
 * (emailStatus "pending") and is live by now. Resolves to the number of
 * articles sent. An article is claimed ("sending") before it goes out, so a
 * save and the timer running at the same moment can't send it twice.
 */
export const sendPendingNewsEmails = async (db, clerk, mailer, site) => {
  const due = await db.article.findMany({
    where: { emailStatus: "pending", status: "published", publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "asc" },
  });
  if (due.length === 0) return 0;

  // Clerk is read at most once per run, however many articles are due.
  let accounts;
  const loadAccounts = async () => (accounts ??= await registeredAccounts(clerk));
  let sent = 0;
  for (const article of due) {
    // updatedAt is passed back unchanged: sending isn't an edit of the article.
    const claimed = await db.article.updateMany({
      where: { id: article.id, emailStatus: "pending" },
      data: { emailStatus: "sending", updatedAt: article.updatedAt },
    });
    if (claimed.count !== 1) continue;

    const tokens = await recipientsFor(db, article, loadAccounts);
    const recipients = Object.keys(tokens);
    const reached = await mailer.sendEach(recipients, (email) =>
      newArticleEmail(article, site, {
        unsubscribe: tokens[email] ? unsubscribeUrl(site, tokens[email]) : null,
      })
    );
    // Nothing went out at all (e.g. the email service is down): try again on
    // the next run. A partial send counts as sent, so nobody gets it twice.
    const failed = recipients.length > 0 && reached === 0;
    await db.article.update({
      where: { id: article.id },
      data: { emailStatus: failed ? "pending" : "sent", updatedAt: article.updatedAt },
    });
    console.log(
      `[pfm] news email "${article.title}": ${failed ? "failed, will retry" : `sent to ${reached} of ${recipients.length} (${article.emailAudience})`}`
    );
    if (!failed) sent += 1;
  }
  return sent;
};
