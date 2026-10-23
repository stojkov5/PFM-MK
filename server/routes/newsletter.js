// server/routes/newsletter.js
// Public newsletter sign-up (footer) and unsubscribe (link in every email).
import { Router } from "express";
import { normalizeEmail, subscribe, unsubscribe } from "../lib/newsletter.js";

const noLimit = (req, res, next) => next();

export const newsletterRouter = (db, { writeLimit = noLimit } = {}) => {
  const router = Router();

  // { email } → { ok: true }, also when the address was already subscribed.
  router.post("/", writeLimit, async (req, res) => {
    const email = normalizeEmail(req.body?.email);
    if (!email) return res.status(400).json({ error: "Invalid email", errors: ["email"] });
    await subscribe(db, email);
    res.json({ ok: true });
  });

  // { token } → { ok: true, email }, or 404 when it's already gone.
  router.post("/unsubscribe", async (req, res) => {
    const removed = await unsubscribe(db, req.body?.token);
    if (!removed) return res.status(404).json({ error: "Not subscribed" });
    res.json({ ok: true, email: removed.email });
  });

  return router;
};
