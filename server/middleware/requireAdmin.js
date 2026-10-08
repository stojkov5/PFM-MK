// server/middleware/requireAdmin.js
import { isAdmin, toAdminDto } from "../auth/clerk.js";

// Looks the user up on every request (instead of trusting token claims) so that
// removing someone's admin role takes effect immediately.
export const requireAdmin = (auth) => async (req, res, next) => {
  const userId = auth.getUserId(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  let user;
  try {
    user = await auth.client.users.getUser(userId);
  } catch {
    return res.status(401).json({ error: "Not authenticated" });
  }
  if (!isAdmin(user)) return res.status(403).json({ error: "Not an admin" });

  req.admin = toAdminDto(user);
  next();
};
