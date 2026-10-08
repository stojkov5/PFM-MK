// server/scripts/grant-admin.js
// Usage: npm run admin:grant -- you@example.com
// Gives an existing Clerk user the admin role. Use it once to make yourself the
// first admin; after that, add people from the admin panel's "Admins" tab.
import "dotenv/config";
import { clerkClient } from "@clerk/express";
import { ADMIN_ROLE } from "../auth/clerk.js";

const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
  console.error("Usage: npm run admin:grant -- you@example.com");
  process.exit(1);
}
if (!process.env.CLERK_SECRET_KEY) {
  console.error("CLERK_SECRET_KEY is missing from .env");
  process.exit(1);
}

const { data } = await clerkClient.users.getUserList({ emailAddress: [email], limit: 1 });
if (!data[0]) {
  console.error(
    `No Clerk user with email ${email}.\n` +
      "Create it first: Clerk dashboard → Users → Create user (or sign up once at /admin)."
  );
  process.exit(1);
}

await clerkClient.users.updateUserMetadata(data[0].id, { publicMetadata: { role: ADMIN_ROLE } });
console.log(`✔ ${email} is now an admin.`);
