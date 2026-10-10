// server/app.js
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { recordsRouter } from "./routes/records.js";
import { applicationsRouter } from "./routes/applications.js";
import { adminRouter } from "./routes/admin.js";
import { newsRouter } from "./routes/news.js";
import { mediaRouter } from "./routes/media.js";
import { createClerkAuth } from "./auth/clerk.js";

// Comma-separated list of allowed browser origins (the Vercel site URL(s)).
// Empty in local dev — the Vite proxy makes requests same-origin, so CORS is moot.
const allowedOrigins = (process.env.CLIENT_ORIGIN ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// `auth` is injectable so tests can run without real Clerk keys.
export const createApp = (
  db,
  { rateLimit: enableRateLimit = true, auth = createClerkAuth({ authorizedParties: allowedOrigins }) } = {}
) => {
  const app = express();
  app.set("trust proxy", 1);
  app.use(
    cors({
      // Allow requests with no Origin (server-to-server, health checks, tests)
      // and any explicitly allowed origin. Others get no CORS headers, so the
      // browser blocks them. Admin calls authenticate with a Bearer token from
      // Clerk, so no cookies need to cross origins.
      origin(origin, cb) {
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
        return cb(null, false);
      },
    })
  );
  // 1mb: article bodies are HTML and can outgrow the 100kb default.
  app.use(express.json({ limit: "1mb" }));

  const limiter = (windowMs, limit) =>
    enableRateLimit
      ? rateLimit({ windowMs, limit, standardHeaders: true, legacyHeaders: false })
      : (req, res, next) => next();

  app.use("/api/records", recordsRouter(db));
  app.use("/api/news", newsRouter(db));
  app.use("/api/media", mediaRouter(db));
  app.use("/api/applications", limiter(60 * 60 * 1000, 5), applicationsRouter(db));
  app.use("/api/admin", limiter(60 * 1000, 120), adminRouter(db, auth, { allowedOrigins }));

  app.use("/api", (req, res) => res.status(404).json({ error: "Not found" }));

  // Errors as JSON (e.g. an upload over the size limit) so the site can show them.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    const status = err.status ?? err.statusCode ?? 500;
    if (status >= 500) console.error(err);
    const message =
      status === 413 ? "The file is too large" : status >= 500 ? "Server error" : err.message;
    res.status(status).json({ error: message });
  });
  return app;
};
