// server/routes/clubs.js
// Public list of clubs for the Clubs page and the admin's organizer picker:
// approved clubs only, never the test club.
import { Router } from "express";
import { toPublicClub } from "../lib/clubs.js";

export const clubsRouter = (db) => {
  const router = Router();

  router.get("/", async (req, res) => {
    const clubs = await db.club.findMany({
      where: { status: "approved", test: false },
      orderBy: { id: "asc" },
    });
    res.json(clubs.map(toPublicClub));
  });

  return router;
};
