# Deploying PFM-MK to Railway

The app is one Node service (API + static site) plus a PostgreSQL database.
The database layer uses **Prisma** — the schema lives in `prisma/schema.prisma`.

## 1. Create the project
1. https://railway.app → New Project → **Deploy from GitHub repo** (or `railway init` with the CLI).
2. In the project: **+ New → Database → PostgreSQL**.

## 2. Configure the service
Settings → Build & Deploy:
- Build command: `npm install && npm run build`
  (`npm install` also runs `prisma generate` automatically via the `postinstall` script)
- Start command: `npm run start:server`

Variables (service → Variables):
- `DATABASE_URL` → click "Add reference" and pick the Postgres `DATABASE_URL`
- `JWT_SECRET` → long random string (e.g. `openssl rand -hex 32`)
- `NODE_ENV` → `production`
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` → first admin account (password ≥ 10 chars)

## 3. Initialize the database (one time)

Either with the Railway CLI (`npm i -g @railway/cli`, then `railway login`, `railway link`):

```
railway run npm run db:push
railway run npm run db:seed-records
railway run npm run db:seed-admin
```

Or from your own machine: put the Postgres service's **`DATABASE_PUBLIC_URL`** into
your local `.env` as `DATABASE_URL` (the internal URL only works inside Railway), set
`ADMIN_USERNAME`/`ADMIN_PASSWORD` there too, then run the same three commands locally:

```
npm run db:push
npm run db:seed-records
npm run db:seed-admin
```

`db:push` creates/updates the tables from `prisma/schema.prisma`. The seeds are
idempotent — running them again does not duplicate data.

## 4. Done
- Site: the service's public URL
- Admin panel: `<url>/admin`
- Re-deploys run automatically on push; the database persists.

## Local development
- `npm run dev:server` (API on :3001) + `npm run dev` (site on :5173).
- `DATABASE_URL` is **required** — the server refuses to start without it. Use the
  Railway `DATABASE_PUBLIC_URL` in `.env`.

## Useful commands
| Command | What it does |
|---|---|
| `npm run test:server` | Backend test suite (in-memory Prisma mock, no DB needed) |
| `npm run db:push` | Apply `prisma/schema.prisma` to `DATABASE_URL` |
| `npm run db:seed-records` | Import the JSON record files (skips existing rows) |
| `npm run db:seed-admin` | Create/update the admin from `ADMIN_USERNAME`/`ADMIN_PASSWORD` |
| `npx prisma studio` | Browse/edit the database in a local GUI |
