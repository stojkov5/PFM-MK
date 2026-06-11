// server/routes/auth.js
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { COOKIE_NAME, requireAdmin } from "../middleware/requireAdmin.js";

const cookieOpts = () => ({
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

export const authRouter = (db) => {
  const router = Router();

  router.post("/login", async (req, res) => {
    const { username, password } = req.body ?? {};
    if (typeof username !== "string" || typeof password !== "string") {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const admin = await db.admin.findUnique({ where: { username } });
    const ok = admin && (await bcrypt.compare(password, admin.passwordHash));
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { sub: admin.id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.cookie(COOKIE_NAME, token, cookieOpts());
    res.json({ username: admin.username });
  });

  router.post("/logout", (req, res) => {
    res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: "lax" });
    res.json({ ok: true });
  });

  router.get("/me", requireAdmin, (req, res) => {
    res.json({ username: req.admin.username });
  });

  return router;
};
