// server/lib/newsEmails.js
// When an article is published for the first time, every registered account
// (club accounts and athletes alike) gets an email about it. Written in
// Macedonian, like the other emails.
//
// The route only marks the article emailStatus "pending"; sendPendingNewsEmails
// sends it once the article is live. It runs right after a save and on a timer
// (server/index.js), so articles scheduled for a later date go out on that date.
import { compose } from "./competitionEmails.js";

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

export const newArticleEmail = (article, site, api = apiBase()) => {
  const label = CATEGORY_LABELS[article.category] ?? CATEGORY_LABELS.other;
  return compose(`Нова вест: ${article.title}`, [
    "Почитувани,",
    `На страницата на федерацијата е објавена нова вест во категоријата „${label}“.`,
    ...(article.coverImage && api ? [{ image: `${api}${article.coverImage}`, alt: article.title }] : []),
    article.title,
    ...(article.excerpt ? [{ quote: article.excerpt }] : []),
    { link: `${site}/news/${article.slug}`, label: "Прочитај ја веста" },
    "Оваа порака ја добивате затоа што имате регистрирана сметка на страницата на федерацијата.",
  ]);
};

// The email address of every Clerk account that isn't banned or locked.
export const registeredEmails = async (clerk) => {
  const emails = new Set();
  const limit = 500;
  for (let offset = 0; ; offset += limit) {
    const { data } = await clerk.users.getUserList({ limit, offset });
    for (const user of data) {
      if (user.banned || user.locked) continue;
      const email =
        user.primaryEmailAddress?.emailAddress ?? user.emailAddresses?.[0]?.emailAddress;
      if (email) emails.add(email.toLowerCase());
    }
    if (data.length < limit) break;
  }
  return [...emails];
};

/**
 * Emails every registered account about each article that is waiting
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

  const recipients = await registeredEmails(clerk);
  let sent = 0;
  for (const article of due) {
    // updatedAt is passed back unchanged: sending isn't an edit of the article.
    const claimed = await db.article.updateMany({
      where: { id: article.id, emailStatus: "pending" },
      data: { emailStatus: "sending", updatedAt: article.updatedAt },
    });
    if (claimed.count !== 1) continue;

    const reached = await mailer.sendEach(recipients, newArticleEmail(article, site));
    // Nothing went out at all (e.g. the email service is down): try again on
    // the next run. A partial send counts as sent, so nobody gets it twice.
    const failed = recipients.length > 0 && reached === 0;
    await db.article.update({
      where: { id: article.id },
      data: { emailStatus: failed ? "pending" : "sent", updatedAt: article.updatedAt },
    });
    console.log(
      `[pfm] news email "${article.title}": ${failed ? "failed, will retry" : `sent to ${reached} of ${recipients.length} accounts`}`
    );
    if (!failed) sent += 1;
  }
  return sent;
};
