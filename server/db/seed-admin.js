// server/db/seed-admin.js
import "dotenv/config";
import bcrypt from "bcryptjs";
import { createPrisma } from "./client.js";

const { ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;
if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
  console.error("ADMIN_USERNAME and ADMIN_PASSWORD are required.");
  process.exit(1);
}
if (ADMIN_PASSWORD.length < 10) {
  console.error("ADMIN_PASSWORD must be at least 10 characters.");
  process.exit(1);
}

const db = createPrisma();
const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
await db.admin.upsert({
  where: { username: ADMIN_USERNAME },
  update: { passwordHash },
  create: { username: ADMIN_USERNAME, passwordHash },
});
console.log(`Admin '${ADMIN_USERNAME}' created/updated.`);
await db.$disconnect();
