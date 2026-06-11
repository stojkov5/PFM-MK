// server/index.js
import "dotenv/config";
import path from "node:path";
import express from "express";
import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";
import { createPrisma } from "./db/client.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === "production") {
    console.error("JWT_SECRET is required in production.");
    process.exit(1);
  }
  process.env.JWT_SECRET = "dev-only-secret";
  console.warn("[pfm] JWT_SECRET not set — using an insecure dev secret.");
}

const db = createPrisma();
const app = createApp(db);

if (process.env.NODE_ENV === "production") {
  const dist = path.join(__dirname, "..", "dist");
  app.use(express.static(dist));
  app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api")) {
      return res.sendFile(path.join(dist, "index.html"));
    }
    next();
  });
}

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => console.log(`[pfm] API listening on :${port}`));
