// server/index.js
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import express from "express";
import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";
import { createPrisma } from "./db/client.js";
import { ensureClubs } from "./lib/clubs.js";
import { ensureCriteria } from "./lib/criteria.js";
import { clerkClient } from "@clerk/express";
import { createMailer } from "./lib/mailer.js";
import { sendPendingNewsEmails } from "./lib/newsEmails.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const missingClerk = ["CLERK_SECRET_KEY", "CLERK_PUBLISHABLE_KEY"].filter((k) => !process.env[k]);
if (missingClerk.length) {
  console.error(
    `[pfm] ${missingClerk.join(" and ")} missing. Copy them from the Clerk dashboard → API keys into .env.`
  );
  process.exit(1);
}

const db = createPrisma();
// First start after the clubs table was added: copy in the federation's list.
// A missing table only breaks the club features, so the rest of the API still starts.
try {
  const seeded = await ensureClubs(db);
  if (seeded) console.log(`[pfm] Added ${seeded} clubs to the clubs table.`);
} catch (err) {
  console.error(
    "[pfm] Could not fill the clubs table — run `npm run db:push` (with the Railway " +
      "DATABASE_PUBLIC_URL in .env), then restart this service.",
    err.message
  );
}
// First start after the criteria table was added: import the criteria PDFs.
try {
  const imported = await ensureCriteria(db);
  if (imported) console.log(`[pfm] Imported ${imported} criteria PDFs.`);
} catch (err) {
  console.error(
    "[pfm] Could not import the criteria PDFs — run `npm run db:push`, then restart this service.",
    err.message
  );
}
const app = createApp(db);

// Serve the built SPA only if a build is present. When the frontend is hosted
// separately (Vercel), this Railway service runs API-only and dist won't exist —
// the guard keeps it from crashing on non-API requests.
if (process.env.NODE_ENV === "production") {
  const dist = path.join(__dirname, "..", "dist");
  if (fs.existsSync(path.join(dist, "index.html"))) {
    app.use(express.static(dist));
    app.use((req, res, next) => {
      if (req.method === "GET" && !req.path.startsWith("/api")) {
        return res.sendFile(path.join(dist, "index.html"));
      }
      next();
    });
  }
}

// "New article" emails for articles scheduled for a later date (and any a
// restart interrupted): checked now and every 5 minutes.
const newsSite = (
  process.env.SITE_URL ||
  (process.env.CLIENT_ORIGIN ?? "").split(",")[0].trim() ||
  "https://npf.mk"
).replace(/\/$/, "");
const newsMailer = createMailer();
const sendNewsEmails = () =>
  sendPendingNewsEmails(db, clerkClient, newsMailer, newsSite).catch((err) =>
    console.error(
      "[pfm] news emails failed (if the email_status column is missing, run `npm run db:push`):",
      err.message
    )
  );
sendNewsEmails();
setInterval(sendNewsEmails, 5 * 60 * 1000);

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => console.log(`[pfm] API listening on :${port}`));
