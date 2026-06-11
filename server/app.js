// server/app.js
import express from "express";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { recordsRouter } from "./routes/records.js";
import { applicationsRouter } from "./routes/applications.js";
import { authRouter } from "./routes/auth.js";
import { adminRouter } from "./routes/admin.js";

export const createApp = (db, { rateLimit: enableRateLimit = true } = {}) => {
  const app = express();
  app.set("trust proxy", 1);
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
