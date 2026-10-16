// server/middleware/requireClub.js
import { clubLinkOf, toAdminDto } from "../auth/clerk.js";
import { findClub } from "../lib/clubs.js";

// Lets through approved club accounts of approved clubs only, and sets
// req.club (the Club row) and req.clubUser (who is signed in). Like
// requireAdmin, the user is looked up on every request so unlinking an
// account takes effect at once.
export const requireClub = (auth, db) => async (req, res, next) => {
  const userId = auth.getUserId(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  let user;
  try {
    user = await auth.client.users.getUser(userId);
  } catch {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const link = clubLinkOf(user);
  const club = link ? await findClub(db, link.clubId) : null;
  if (!club) return res.status(403).json({ error: "Not a club account" });
  if (link.status !== "approved" || club.status !== "approved") {
    return res.status(403).json({ error: "Club account not approved yet" });
  }

  req.club = club;
  req.clubUser = toAdminDto(user);
  next();
};
