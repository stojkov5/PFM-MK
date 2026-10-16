// Usage:
//   npm run clubs:create                 → an account for every approved club in the database
//   npm run clubs:create -- --only 4,7   → only these club ids
//   npm run clubs:create -- --dry-run    → show what would happen, change nothing
//   npm run clubs:create -- --only 4 --email you+test@gmail.com
//                                        → test account for one club on an email you
//                                          can read (Clerk may email a sign-in code)
//   npm run clubs:create -- --only 31 --new-password
//                                        → give these clubs' existing accounts a new password
//
// Creates a Clerk login for each club, using the club's email from the clubs
// table and a generated password. The accounts are approved right away (no admin
// review) because the federation creates them itself. Clerk sends no email —
// hand the passwords to the clubs yourself; they can change them under
// "Manage account → Security".
//
// Safe to run again: a club whose email already has an account keeps its
// password (unless --new-password); the account is only linked to the club.
//
// Every run writes a CSV to club-accounts/ in the project folder (git-ignored),
// with the passwords it set. Delete it once the passwords are handed over.
import "dotenv/config";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { randomInt } from "node:crypto";
import { clerkClient } from "@clerk/express";
import { clubLinkOf, clubMetadata, isAdmin } from "../auth/clerk.js";
import { createPrisma } from "../db/client.js";
import { ensureClubs } from "../lib/clubs.js";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const onlyArg = args[args.indexOf("--only") + 1];
const only = args.includes("--only")
  ? new Set(String(onlyArg ?? "").split(",").map(Number).filter(Boolean))
  : null;
const resetPassword = args.includes("--new-password");
const emailArg = args.includes("--email")
  ? String(args[args.indexOf("--email") + 1] ?? "").trim().toLowerCase()
  : null;

if (emailArg !== null && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailArg) || only?.size !== 1)) {
  console.error("--email needs a valid address and exactly one club: --only <id> --email <address>");
  process.exit(1);
}

// Resetting passwords is only allowed for clubs named explicitly.
if (resetPassword && !only) {
  console.error("--new-password needs --only <club ids>, e.g. --only 31 --new-password");
  process.exit(1);
}

if (!process.env.CLERK_SECRET_KEY) {
  console.error("CLERK_SECRET_KEY is missing from .env");
  process.exit(1);
}

// Easy to read out and type: no 0/O, 1/l/I. E.g. "kfmr-4829-tqwz-Hnpd"
// (19 characters — the Clerk instance requires at least 15).
const LETTERS = "abcdefghjkmnpqrstuvwxyz";
const pick = (set, n) => Array.from({ length: n }, () => set[randomInt(set.length)]).join("");
const newPassword = () => {
  const last = pick(LETTERS, 4);
  return [
    pick(LETTERS, 4),
    pick("23456789", 4),
    pick(LETTERS, 4),
    `${last[0].toUpperCase()}${last.slice(1)}`,
  ].join("-");
};

// The clubs table is filled from server/db/clubs-seed.json on first use.
const db = createPrisma();
await ensureClubs(db);
const clubs = (
  await db.club.findMany({ where: { status: "approved" }, orderBy: { id: "asc" } })
).filter((c) => !only || only.has(c.id));
await db.$disconnect();
if (clubs.length === 0) {
  console.error("No clubs match --only. Club ids are the \"id\" column of the clubs table (npx prisma studio).");
  process.exit(1);
}

const instance = process.env.CLERK_SECRET_KEY.startsWith("sk_live") ? "PRODUCTION" : "DEVELOPMENT";
console.log(`Clerk instance: ${instance}${dryRun ? "  (dry run — nothing will change)" : ""}\n`);

const rows = [];
for (const club of clubs) {
  const email = emailArg ?? club.email?.trim().toLowerCase();
  const row = { id: club.id, club: club.name, email: email ?? "", password: "", result: "" };
  rows.push(row);

  if (!email) {
    row.result = "skipped: the club has no email";
    console.log(`– ${club.id} ${club.name}: ${row.result}`);
    continue;
  }

  try {
    const { data } = await clerkClient.users.getUserList({ emailAddress: [email], limit: 1 });
    const existing = data[0];

    if (existing) {
      const link = clubLinkOf(existing);
      if (link && link.clubId !== club.id) {
        row.result = `skipped: this email is already linked to club ${link.clubId}`;
      } else if (resetPassword && isAdmin(existing)) {
        row.result = "skipped: this is an admin account — change its password in the Clerk dashboard";
      } else {
        const linked = link?.clubId === club.id && link.status === "approved";
        if (!linked && !dryRun) {
          await clerkClient.users.updateUserMetadata(existing.id, {
            publicMetadata: clubMetadata(club.id),
          });
        }
        if (resetPassword) {
          row.password = newPassword();
          if (!dryRun) await clerkClient.users.updateUser(existing.id, { password: row.password });
        }
        row.result = [
          linked ? "account already existed" : "existing account linked to the club",
          resetPassword ? "NEW PASSWORD set" : "password unchanged (add --new-password to set one)",
        ].join(", ");
      }
    } else {
      row.password = newPassword();
      if (!dryRun) {
        await clerkClient.users.createUser({
          emailAddress: [email],
          password: row.password,
          firstName: club.name,
          publicMetadata: clubMetadata(club.id),
        });
      }
      row.result = "created";
    }
  } catch (err) {
    const detail = err?.errors?.map((e) => e.longMessage ?? e.message).join("; ") || err.message;
    row.result = `ERROR: ${detail}`;
    row.password = "";
  }
  console.log(`${row.result.startsWith("ERROR") ? "✘" : "✔"} ${club.id} ${club.name} <${email}>: ${row.result}`);
}

if (!dryRun) {
  const dir = new URL("../../club-accounts/", import.meta.url);
  mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  const file = new URL(`club-accounts-${stamp}.csv`, dir);
  const cell = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [
    ["Club id", "Club", "Email (login)", "Password", "Result"],
    ...rows.map((r) => [r.id, r.club, r.email, r.password, r.result]),
  ]
    .map((r) => r.map(cell).join(","))
    .join("\r\n");
  // The BOM makes Excel read the Cyrillic club names correctly.
  writeFileSync(file, `\uFEFF${csv}\r\n`);
  console.log(`\nResults saved to ${fileURLToPath(file)}`);
  if (rows.some((r) => r.password)) {
    console.log("It contains passwords: keep it private and delete it once the clubs have them.");
  }
}

const count = (test) => rows.filter((r) => test(r.result)).length;
const failed = count((r) => r.startsWith("ERROR"));
const created = count((r) => r === "created");
const newPasswords = count((r) => r.includes("NEW PASSWORD"));
console.log(
  `\nDone: ${created} created, ${newPasswords} new passwords, ` +
    `${rows.length - created - newPasswords - failed} unchanged/linked/skipped, ${failed} failed.`
);
