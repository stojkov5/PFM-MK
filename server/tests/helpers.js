// server/tests/helpers.js
import { PrismockClient } from "prismock";
import bcrypt from "bcryptjs";
import { createApp } from "../app.js";

export const TEST_ADMIN = { username: "boss", password: "secret-pass-123" };

export const SEED_RECORDS = [
  { pool: "25", gender: "female", category: "Seniors (17+)", sortOrder: 0, discipline: "50m Freestyle", time: "0:26.34", athlete: "Bogdanovska Anastasija" },
  { pool: "25", gender: "female", category: "Seniors (17+)", sortOrder: 0, discipline: "100m Freestyle", time: "0:56.12", athlete: "Bogdanovska Anastasija" },
  { pool: "25", gender: "female", category: "Juniors (15/16)", sortOrder: 1, discipline: "50m Freestyle", time: "0:26.57", athlete: "Blazevska Eminova Mia" },
  { pool: "50", gender: "male", category: "Seniors (19+)", sortOrder: 0, discipline: "50m Freestyle", time: "0:22.94", athlete: "Jankovski Jovan" },
];

export const createTestApp = async () => {
  const db = new PrismockClient();
  await db.record.createMany({ data: SEED_RECORDS });
  const passwordHash = bcrypt.hashSync(TEST_ADMIN.password, 10);
  await db.admin.create({
    data: { username: TEST_ADMIN.username, passwordHash },
  });
  process.env.JWT_SECRET = "test-secret";
  const app = createApp(db, { rateLimit: false });
  return { app, db };
};
