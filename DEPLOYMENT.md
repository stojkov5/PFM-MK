# Deploying PFM-MK

Architecture: **frontend on Vercel**, **API + PostgreSQL on Railway**.

- The React site (Vite SPA) is hosted by Vercel.
- The Express API and the Prisma/PostgreSQL database run on Railway.
- They are on different origins, so the API allows the Vercel origin via CORS and
  issues a `SameSite=None; Secure` session cookie (only works when `NODE_ENV=production`).

The database is already created and seeded (418 records + your admin account). The
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
| `JWT_SECRET` | a long random string (e.g. `openssl rand -hex 32`) |
| `NODE_ENV` | `production`  ← **required**, or the cross-site login cookie won't work |
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
4. **Deploy.** Copy the resulting site URL, e.g. `https://pfm-mk.vercel.app`.

> `VITE_API_URL` must be set **before/at build time** — Vite inlines it into the bundle.
> If you add it after the first deploy, trigger a redeploy.

---

## Part 3 — Connect them (CORS)

Back in Railway → API service → Variables, set:

| Variable | Value |
|---|---|
| `CLIENT_ORIGIN` | your Vercel URL from Part 2, e.g. `https://pfm-mk.vercel.app` (no trailing slash) |

Railway redeploys. The API now allows the Vercel site to call it with credentials.

For Vercel **preview** deployments (separate URLs per branch), add those origins too —
`CLIENT_ORIGIN` accepts a comma-separated list:
`https://pfm-mk.vercel.app,https://pfm-mk-git-dev-you.vercel.app`

---

## Done — verify
- Open the Vercel site → Swimming → Records: data loads from Railway.
- `/swimming/record-application`: submit a test application.
- `/admin`: log in with your admin account, see the application, Approve it, confirm the
  record updates on the Records page.

If login "succeeds" but you stay logged out, the cause is almost always: `NODE_ENV` not
set to `production` on Railway (cookie not `Secure`), or `CLIENT_ORIGIN` not exactly
matching the Vercel URL (scheme + host, no trailing slash).

---

## Local development
- `npm run dev:server` (API on :3001) + `npm run dev` (site on :5173).
- Locally `VITE_API_URL` and `CLIENT_ORIGIN` are unset: the Vite proxy makes everything
  same-origin, so CORS and the cookie work without extra config.
- `DATABASE_URL` is required (use the Railway Postgres `DATABASE_PUBLIC_URL` in `.env`).

## Database commands
| Command | What it does |
|---|---|
| `npm run test:server` | Backend tests (in-memory Prisma mock, no DB needed) |
| `npm run db:push` | Apply `prisma/schema.prisma` to `DATABASE_URL` |
| `npm run db:seed-records` | Import the JSON record files (skips existing rows) |
| `npm run db:seed-admin` | Create/update admin from `ADMIN_USERNAME`/`ADMIN_PASSWORD` |
| `npx prisma studio` | Browse/edit the database in a GUI |
