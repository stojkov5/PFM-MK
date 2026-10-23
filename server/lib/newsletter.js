// server/lib/newsletter.js
// Newsletter subscribers (the newsletter_subscribers table). Subscribing needs
// no account; every subscriber gets a random token for their unsubscribe link.
import { randomBytes } from "node:crypto";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The address to store, or null when it isn't a plausible email.
export const normalizeEmail = (value) => {
  const email = typeof value === "string" ? value.trim().toLowerCase() : "";
  return email.length <= 200 && EMAIL_RE.test(email) ? email : null;
};

// Subscribing twice is fine: the address keeps its first subscription.
export const subscribe = (db, email) =>
  db.newsletterSubscriber.upsert({
    where: { email },
    update: {},
    create: { email, token: randomBytes(24).toString("hex") },
  });

// Resolves to the removed subscriber, or null for an unknown token.
export const unsubscribe = async (db, token) => {
  if (typeof token !== "string" || !token) return null;
  const subscriber = await db.newsletterSubscriber.findUnique({ where: { token } });
  if (!subscriber) return null;
  await db.newsletterSubscriber.delete({ where: { id: subscriber.id } });
  return subscriber;
};

export const unsubscribeUrl = (site, token) =>
  `${site}/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;
