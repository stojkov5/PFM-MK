// server/app.js
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { recordsRouter } from "./routes/records.js";
import { applicationsRouter } from "./routes/applications.js";
import { authRouter } from "./routes/auth.js";
import { adminRouter } from "./routes/admin.js";

// Comma-separated list of allowed browser origins (the Vercel site URL(s)).
// Empty in local dev — the Vite proxy makes requests same-origin, so CORS is moot.
const allowedOrigins = (process.env.CLIENT_ORIGIN ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export const createApp = (db, { rateLimit: enableRateLimit = true } = {}) => {
  const app = express();
  app.set("trust proxy", 1);
  app.use(
    cors({
      // Allow requests with no Origin (server-to-server, health checks, tests)
      // and any explicitly allowed origin. Others get no CORS headers, so the
      // browser blocks them. Credentials are required for the session cookie.
      origin(origin, cb) {
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
        return cb(null, false);
      },
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(cookieParser());

  const limiter = (windowMs, limit) =>
    enableRateLimit
      ? rateLimit({ windowMs, limit, standardHeaders: true, legacyHeaders: false })
      : (req, res, next) => next();

  app.use("/api/records", recordsRouter(db));
  app.use("/api/applications", limiter(60 * 60 * 1000, 5), applicationsRouter(db));
  app.use("/api/auth", limiter(15 * 60 * 1000, 10), authRouter(db));
  app.use("/api/admin", adminRouter(db));

  app.use("/api", (req, res) => res.status(404).json({ error: "Not found" }));
  return app;
};
