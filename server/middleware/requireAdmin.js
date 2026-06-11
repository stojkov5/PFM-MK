// server/middleware/requireAdmin.js
import jwt from "jsonwebtoken";

export const COOKIE_NAME = "pfm_admin";

export const requireAdmin = (req, res, next) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = { id: payload.sub, username: payload.username };
    next();
  } catch {
    return res.status(401).json({ error: "Not authenticated" });
  }
};
