// server/tests/helpers.js
import { PrismockClient } from "prismock";
import { createApp } from "../app.js";

export const SEED_RECORDS = [
  { pool: "25", gender: "female", category: "Seniors (17+)", sortOrder: 0, discipline: "50m Freestyle", time: "0:26.34", athlete: "Bogdanovska Anastasija" },
  { pool: "25", gender: "female", category: "Seniors (17+)", sortOrder: 0, discipline: "100m Freestyle", time: "0:56.12", athlete: "Bogdanovska Anastasija" },
  { pool: "25", gender: "female", category: "Juniors (15/16)", sortOrder: 1, discipline: "50m Freestyle", time: "0:26.57", athlete: "Blazevska Eminova Mia" },
  { pool: "50", gender: "male", category: "Seniors (19+)", sortOrder: 0, discipline: "50m Freestyle", time: "0:22.94", athlete: "Jankovski Jovan" },
];

const clerkUser = (id, email, role) => ({
  id,
  firstName: id,
  lastName: null,
  primaryEmailAddress: { emailAddress: email },
  emailAddresses: [{ emailAddress: email }],
  imageUrl: null,
  lastSignInAt: null,
  publicMetadata: role ? { role } : {},
});

// In-memory stand-in for Clerk. Requests pick their user with the
// `x-test-user` header (what the real middleware reads from the Bearer token).
export const createFakeAuth = () => {
  const users = new Map([
    ["user_admin", clerkUser("user_admin", "admin@example.com", "admin")],
    ["user_regular", clerkUser("user_regular", "regular@example.com")],
  ]);
  const invitations = [];
  const notFound = () => Object.assign(new Error("Not found"), { errors: [{ message: "Not found" }] });

  return {
    users,
    invitations,
    middleware: (req, res, next) => next(),
    getUserId: (req) => req.get("x-test-user") ?? null,
    client: {
      users: {
        getUser: async (id) => {
          if (!users.has(id)) throw notFound();
          return users.get(id);
        },
        getUserList: async ({ emailAddress } = {}) => {
          const all = [...users.values()];
          const data = emailAddress
            ? all.filter((u) => emailAddress.includes(u.primaryEmailAddress.emailAddress))
            : all;
          return { data, totalCount: data.length };
        },
        updateUserMetadata: async (id, { publicMetadata }) => {
          if (!users.has(id)) throw notFound();
          const u = users.get(id);
          u.publicMetadata = Object.fromEntries(
            Object.entries({ ...u.publicMetadata, ...publicMetadata }).filter(([, v]) => v !== null)
          );
          return u;
        },
      },
      invitations: {
        getInvitationList: async () => ({ data: invitations, totalCount: invitations.length }),
        createInvitation: async ({ emailAddress, publicMetadata }) => {
          const inv = { id: `inv_${invitations.length + 1}`, emailAddress, publicMetadata, createdAt: Date.now() };
          invitations.push(inv);
          return inv;
        },
        revokeInvitation: async (id) => {
          const i = invitations.findIndex((inv) => inv.id === id);
          if (i < 0) throw notFound();
          return invitations.splice(i, 1)[0];
        },
      },
    },
  };
};

export const createTestApp = async () => {
  const db = new PrismockClient();
  await db.record.createMany({ data: SEED_RECORDS });
  const auth = createFakeAuth();
  const app = createApp(db, { rateLimit: false, auth });
  return { app, db, auth };
};
