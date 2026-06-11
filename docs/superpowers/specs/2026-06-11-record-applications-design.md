# Design: Record Applications System (form + admin panel + Postgres)

**Date:** 2026-06-11
**Project:** PFM-MK — Swimming Federation of North Macedonia website
**Status:** Approved by user (not committed — standing user instruction: no git commits)

## Goal

Let swimmers apply for a national record through a public form, let federation admins
review and approve/deny applications, and move the swimming records from static JSON
files into PostgreSQL on Railway. This adds the site's first backend.

## Decisions made with user

1. **Hosting:** everything on Railway — one project containing a Postgres database and a
   single Node service that serves both the API and the built React app.
2. **Admin auth:** an `admins` table (multiple reviewer accounts), not a single shared
   password. First admin seeded from env vars; existing admins can create more.
3. **Approval semantics:** approving an application **replaces** the existing record row
   for that (pool, gender, category, discipline). No record history kept (the
   application rows themselves remain as an audit trail).
4. **Backend stack:** Express + `pg` (node-postgres) with a plain SQL schema. No ORM.
5. **Form fields:** the user's original list (first name, last name, sex, category,
   time, proof link) is extended with **pool (25m/50m)** and **discipline** — without
   them a record cannot be identified.
6. **No git commits** at any point (standing instruction from this session).

## Current state

- Pure static Vite + React 19 SPA; no backend of any kind.
- Records live in `src/data/records/{women25,men25,women50,men50}.json`, shape:
  `[ { name: "Seniors (17+)", records: [ { discipline, time, athlete } ] } ]`.
- `src/pages/Swimming/Records.jsx` imports these JSON files directly and normalizes them.
- `@tanstack/react-query` is already a dependency but unused — this project adopts it.
- Category names differ per gender (e.g. men "Seniors (19+)", women "Seniors (17+)"),
  so categories are always scoped to (pool, gender).
- Time display format in data: `m:ss.xx` (e.g. `0:26.34`, `17:06.42`).

## Architecture

```
Browser ── /api/* ──► Express (server/) ──► Postgres (Railway)
        └─ static ──► dist/ (production) or Vite dev server (development)
```

- **Development:** `vite` on 5173 (as today) + `node --watch server/index.js` on 3001.
  Vite config gains a proxy: `/api` → `http://localhost:3001`. `DATABASE_URL` points at
  Railway Postgres (or any local Postgres).
- **Production (Railway):** one service runs `node server/index.js`, which serves
  `/api/*` and the static `dist/` build with an SPA fallback. `PORT` from Railway.

### New top-level layout

```
server/
  index.js            # Express bootstrap: middleware, routes, static serving
  db/
    pool.js           # pg Pool from DATABASE_URL
    schema.sql        # CREATE TABLE statements (idempotent)
    migrate.js        # runs schema.sql
    seed-records.js   # one-time import of the four JSON files
    seed-admin.js     # creates first admin from ADMIN_USERNAME / ADMIN_PASSWORD env
  routes/
    records.js        # public records + form-options endpoints
    applications.js   # public submission endpoint
    auth.js           # login / logout / me
    admin.js          # protected review + admin-management endpoints
  middleware/
    requireAdmin.js   # JWT cookie verification
  lib/
    validate.js       # input validation helpers (pure functions)
server/tests/         # vitest + supertest + pg-mem
```

## Database schema

```sql
CREATE TABLE IF NOT EXISTS admins (
  id            SERIAL PRIMARY KEY,
  username      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS records (
  id          SERIAL PRIMARY KEY,
  pool        TEXT NOT NULL CHECK (pool IN ('25', '50')),
  gender      TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  category    TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,   -- category display order from JSON
  discipline  TEXT NOT NULL,
  time        TEXT NOT NULL,                -- display format m:ss.xx
  athlete     TEXT NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (pool, gender, category, discipline)
);

CREATE TABLE IF NOT EXISTS record_applications (
  id          SERIAL PRIMARY KEY,
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL,
  gender      TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  pool        TEXT NOT NULL CHECK (pool IN ('25', '50')),
  category    TEXT NOT NULL,
  discipline  TEXT NOT NULL,
  time        TEXT NOT NULL,
  proof_url   TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'approved', 'denied')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by INTEGER REFERENCES admins(id)
);
```

Times stay TEXT in display format — the server validates the shape
(`^\d{1,2}:\d{2}\.\d{2}$`) but does not rank times; the admin judges validity. The admin
UI shows the current record next to the claimed time for comparison.

## API

### Public
- `GET /api/records?pool=25|50&gender=male|female` → `[ { name, records: [ { discipline, time, athlete } ] } ]`
  (same shape the Records page normalizer already handles; ordered by `sort_order`).
- `GET /api/records/options?pool=&gender=` → `{ categories: [...], disciplines: { [category]: [...] } }`
  for the form dropdowns — applicants can only select keys that exist in the DB.
- `POST /api/applications` → body `{ firstName, lastName, gender, pool, category, discipline, time, proofUrl }`.
  Server-side validation: all fields required; gender/pool from allowed sets;
  category+discipline must exist in `records` for that pool+gender; time matches format;
  proofUrl parses as http(s) URL; name lengths ≤ 100. Rate-limited (5/hour per IP).
  Returns `201 { id }` or `400 { error }`.

### Auth
- `POST /api/auth/login` `{ username, password }` → on success sets httpOnly
  `SameSite=Lax` JWT cookie (7-day expiry), returns `{ username }`. Rate-limited
  (10/15min per IP). Generic error message on failure (no user enumeration).
- `POST /api/auth/logout` → clears cookie.
- `GET /api/auth/me` → `{ username }` or 401. Used by the frontend route guard.

### Admin (all behind `requireAdmin` JWT middleware)
- `GET /api/admin/applications?status=pending|approved|denied` → applications, each
  including `currentRecord: { time, athlete } | null` for the targeted key.
- `POST /api/admin/applications/:id/approve` → in one transaction: UPSERT into `records`
  (athlete = "LastName FirstName" to match existing data style, time = claimed time,
  `updated_at = now()`), set application status/reviewed_at/reviewed_by. 409 if the
  application is not pending.
- `POST /api/admin/applications/:id/deny` → set status denied + reviewed fields. 409 if
  not pending.
- `POST /api/admin/admins` `{ username, password }` → create another admin
  (password min 10 chars, bcrypt cost 12).

## Frontend

### "Sign for a Record" page — `/swimming/record-application`
- Added as a sixth card in the SwimmingLayout nav grid (icon: FiEdit / similar).
- antd Form: first name, last name, sex (radio), pool (radio 25m/50m), category
  (select), discipline (select), time (input with format hint), proof link (input).
- Category/discipline options come from `GET /api/records/options` via React Query and
  reload when sex/pool changes; discipline resets when category changes.
- Success state replaces the form with a confirmation message; errors show inline.
- All labels/messages added to both `public/locales/mk/translation.json` and `en`.
- Styled with the existing `pfm-*` design system + `Reveal` animations.

### Records page
- `Records.jsx` switches from JSON imports to React Query fetch of `/api/records`.
  The existing `normalizeData` keeps working on the response. Adds loading (antd
  Skeleton) and error (antd Alert + retry) states. JSON files stay in the repo as seed
  input only.
- `QueryClientProvider` added at the app root (`main.jsx`).

### Admin panel — `/admin`
- `/admin` → login form (no navbar link anywhere; private URL).
- `/admin/applications` → guarded by a route component that calls `/api/auth/me`
  (redirects to `/admin` on 401).
- Dashboard: antd Tabs (Pending / Approved / Denied) + Table. Pending rows show:
  applicant, sex/pool/category/discipline, claimed time **vs current record time and
  holder**, proof link (opens in new tab), Approve / Deny buttons with antd Popconfirm.
  Actions invalidate the React Query cache for applications and records.
- "Add admin" button → modal with username/password form (calls `POST /api/admin/admins`).
- Logout button. Same dark `pfm-*` styling.

## Security

- bcrypt (cost 12) password hashing; JWT signed with `JWT_SECRET` env var, httpOnly +
  SameSite=Lax cookie, `Secure` flag in production.
- `express-rate-limit` on login and application submission.
- All input validated server-side regardless of client validation.
- Proof URLs are stored and displayed as links only, never fetched or embedded.
- Parameterized queries everywhere (no string-built SQL).

## Environment variables

| Var | Used by | Notes |
|---|---|---|
| `DATABASE_URL` | server | Railway Postgres connection string |
| `JWT_SECRET` | server | long random string |
| `PORT` | server | provided by Railway; default 3001 locally |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | seed-admin.js | first admin account |
| `NODE_ENV` | server | `production` on Railway |

`.env` (gitignored) for local dev; `.env.example` documents the variables.

## Testing

- vitest + supertest with `pg-mem` (in-memory Postgres) wired into the same Express app:
  - validation unit tests (`lib/validate.js`)
  - `POST /api/applications` happy path + rejection cases
  - auth: login sets cookie, `requireAdmin` rejects without/with-bad cookie
  - approve flow: record upserted (new key inserted, existing key replaced), application
    status updated, non-pending application → 409
- Manual browser verification of the full flow (submit → review → approve → records page
  shows new record) at the end.

## Deployment (guided, needs user's Railway account)

- `DEPLOYMENT.md` with step-by-step: create Railway project → add Postgres → set env
  vars → deploy service (build `npm run build`, start `npm run start:server`) → run
  `migrate`, `seed-records`, `seed-admin` once via `railway run`.
- npm scripts: `dev:server`, `start:server`, `db:migrate`, `db:seed-records`,
  `db:seed-admin`, `test:server`.

## Out of scope

- Record history / superseded records
- Email notifications on application status
- File-upload proof (PDF/screenshot) — link only for now
- Waterpolo / distance-swimming records (JSON-less pages already say "no data")
- Editing records directly in the admin panel (only via approved applications)
