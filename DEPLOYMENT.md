# Deploying PFM-MK

Architecture: **frontend on Vercel**, **API + PostgreSQL on Railway**.

- The React site (Vite SPA) is hosted by Vercel.
- The Express API and the Prisma/PostgreSQL database run on Railway.
- Admin login is handled by **Clerk**. The admin panel sends a Clerk session token as
  a `Bearer` header, and the API checks it plus the user's `role: "admin"` metadata.
- They are on different origins, so the API allows the Vercel origin via CORS.

The database is already created and seeded (418 records). The
steps below are about hosting the two apps. **Do them in this order** — each app needs
the other's URL.

---

## Part 1 — API on Railway

You already have a Railway project with PostgreSQL and a service connected to the
GitHub repo. Configure that service as **API-only**:

**Settings → Build & Deploy**
- Build command: `npm install`   (this also runs `prisma generate` via `postinstall`)
- Start command: `npm run start:server`

> Leaving the build as `npm install && npm run build` also works — the API just also
> serves a copy of the site — but API-only is cleaner.

**Variables** (service → Variables)
| Variable | Value |
|---|---|
| `DATABASE_URL` | Add Reference → Postgres `DATABASE_URL` (the internal one is correct here) |
| `CLERK_SECRET_KEY` | Clerk dashboard → API keys (use the **production** instance keys) |
| `CLERK_PUBLISHABLE_KEY` | Clerk dashboard → API keys |
| `NODE_ENV` | `production` |
| `CLIENT_ORIGIN` | *leave empty for now — you'll fill it in Part 3* |

Deploy. Then **Settings → Networking → Generate Domain** to get the public API URL,
e.g. `https://pfm-mk-api.up.railway.app`. Copy it.

Quick check: `https://<your-api>.up.railway.app/api/records?pool=25&gender=female`
should return JSON.

---

## Part 2 — Frontend on Vercel

1. https://vercel.com → **Add New → Project** → import the `PFM-MK` GitHub repo.
2. Vercel auto-detects Vite (Framework: Vite, Build: `npm run build`, Output: `dist`).
   `vercel.json` in the repo already handles SPA routing so deep links like `/admin`
   don't 404.
3. **Environment Variables** → add:
   | Variable | Value |
   |---|---|
   | `VITE_API_URL` | your Railway API URL from Part 1, e.g. `https://pfm-mk-api.up.railway.app` (no trailing slash) |
   | `VITE_CLERK_PUBLISHABLE_KEY` | same value as `CLERK_PUBLISHABLE_KEY` |
4. **Deploy.** Copy the resulting site URL, e.g. `https://pfm-mk.vercel.app`.

> `VITE_*` variables must be set **before/at build time** — Vite inlines it into the bundle.
> If you add it after the first deploy, trigger a redeploy.

---

## Part 3 — Connect them (CORS)

Back in Railway → API service → Variables, set:

| Variable | Value |
|---|---|
| `CLIENT_ORIGIN` | your Vercel URL from Part 2, e.g. `https://pfm-mk.vercel.app` (no trailing slash) |

Railway redeploys. The API now allows the Vercel site to call it, and only accepts
Clerk tokens issued for these origins.

For Vercel **preview** deployments (separate URLs per branch), add those origins too —
`CLIENT_ORIGIN` accepts a comma-separated list:
`https://pfm-mk.vercel.app,https://pfm-mk-git-dev-you.vercel.app`

---

## Done — verify
- Open the Vercel site → Swimming → Records: data loads from Railway.
- `/swimming/record-application`: submit a test application.
- `/admin`: sign in with Clerk, see the application, Approve it, confirm the record
  updates on the Records page.

If you sign in but the panel says "Couldn't reach the server" or you get 401s, the cause
is almost always: `CLIENT_ORIGIN` not exactly matching the Vercel URL (scheme + host, no
trailing slash), or the frontend and API using keys from different Clerk instances.
"No admin access" means the account is missing `{"role": "admin"}` in its public metadata.

---

## Local development
- `npm run dev:server` (API on :3001) + `npm run dev` (site on :5173).
- Locally `VITE_API_URL` and `CLIENT_ORIGIN` are unset: the Vite proxy makes everything
  same-origin, so CORS works without extra config.
- `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY` and `VITE_CLERK_PUBLISHABLE_KEY` are required
  (use the Clerk **development** instance keys locally).
- `DATABASE_URL` is required (use the Railway Postgres `DATABASE_PUBLIC_URL` in `.env`).

## Database commands
| Command | What it does |
|---|---|
| `npm run test:server` | Backend tests (in-memory Prisma mock, no DB needed) |
| `npm run db:push` | Apply `prisma/schema.prisma` to `DATABASE_URL` |
| `npm run db:seed-records` | Import the JSON record files (skips existing rows) |
| `npm run admin:grant -- you@example.com` | Give an existing Clerk user the admin role |
| `npx prisma studio` | Browse/edit the database in a GUI |
