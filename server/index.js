// server/index.js
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import express from "express";
import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";
import { createPrisma } from "./db/client.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const missingClerk = ["CLERK_SECRET_KEY", "CLERK_PUBLISHABLE_KEY"].filter((k) => !process.env[k]);
if (missingClerk.length) {
  console.error(
    `[pfm] ${missingClerk.join(" and ")} missing. Copy them from the Clerk dashboard → API keys into .env.`
  );
  process.exit(1);
}

const db = createPrisma();
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

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => console.log(`[pfm] API listening on :${port}`));
