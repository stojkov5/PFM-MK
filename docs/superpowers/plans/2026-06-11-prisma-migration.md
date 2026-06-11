# Prisma Migration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. NO GIT COMMITS (standing user instruction).

**Goal:** Replace the plain `pg`/SQL data layer with Prisma ORM (PostgreSQL on Railway), per explicit user request. Same API behavior, same DB column names (existing data stays compatible).

**Architecture:** `prisma/schema.prisma` defines Admin / Record / RecordApplication models with `@map`/`@@map` to the existing snake_case tables. Routes receive a PrismaClient (or prismock in tests) via the existing `createApp(db)` factory. `prisma db push` replaces migrate.js; seeds rewritten on Prisma. The in-memory pg-mem dev fallback is removed — `DATABASE_URL` is now required to run the server (tests still need no DB thanks to prismock).

**Tech stack changes:** + `prisma` (dev), `@prisma/client`, `prismock` (dev, in-memory PrismaClient for vitest). − `pg`, `pg-mem`.

## Tasks

### 1. Dependencies + schema
- `npm i @prisma/client && npm i -D prisma prismock`; `npm uninstall pg pg-mem`
- Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Admin {
  id           Int                 @id @default(autoincrement())
  username     String              @unique
  passwordHash String              @map("password_hash")
  createdAt    DateTime            @default(now()) @map("created_at") @db.Timestamptz()
  reviewed     RecordApplication[]

  @@map("admins")
}

model Record {
  id         Int      @id @default(autoincrement())
  pool       String
  gender     String
  category   String
  sortOrder  Int      @default(0) @map("sort_order")
  discipline String
  time       String
  athlete    String
  updatedAt  DateTime @default(now()) @updatedAt @map("updated_at") @db.Timestamptz()

  @@unique([pool, gender, category, discipline], name: "recordKey")
  @@map("records")
}

model RecordApplication {
  id         Int       @id @default(autoincrement())
  firstName  String    @map("first_name")
  lastName   String    @map("last_name")
  gender     String
  pool       String
  category   String
  discipline String
  time       String
  proofUrl   String    @map("proof_url")
  status     String    @default("pending")
  createdAt  DateTime  @default(now()) @map("created_at") @db.Timestamptz()
  reviewedAt DateTime? @map("reviewed_at") @db.Timestamptz()
  reviewedBy Int?      @map("reviewed_by")
  reviewer   Admin?    @relation(fields: [reviewedBy], references: [id])

  @@map("record_applications")
}
```

- `npx prisma generate`
- npm scripts: `db:push` = `prisma db push`; `db:migrate` removed in favor of push; `postinstall` = `prisma generate` (needed for Railway builds).

### 2. Server refactor (same endpoints, same JSON shapes except admin list goes camelCase)
- Delete `server/db/pool.js`, `server/db/schema.sql`, `server/db/migrate.js`.
- New `server/db/client.js`: exports `createPrisma()` (PrismaClient singleton) — requires `DATABASE_URL`.
- New `server/db/records-data.js`: `loadRecordsFromJson()` (moved from pool.js).
- `server/app.js`: unchanged signature — `createApp(db, opts)` where `db` is a PrismaClient.
- Routes rewritten on Prisma queries:
  - records: `db.record.findMany({ where, orderBy: [{sortOrder:"asc"},{id:"asc"}] })` + grouping (unchanged output).
  - applications: `db.record.findFirst` slot check; `db.recordApplication.create`.
  - auth: `db.admin.findUnique({ where: { username } })`.
  - admin list: `db.recordApplication.findMany` + per-row `db.record.findUnique({ where: { recordKey } })` for `currentRecord`. Response objects are now **camelCase** (`firstName`, `proofUrl`, `createdAt`, …).
  - approve: `db.$transaction(async (tx) => { load+check, sortOrder lookup, record.upsert(recordKey), application.update })`.
  - deny / create admin: straightforward Prisma equivalents (`P2002`-safe duplicate check via pre-query).
- `server/index.js`: require `DATABASE_URL` (exit with clear message if missing); drop memory mode.
- Seeds: `seed-records.js` uses `createMany({ skipDuplicates: true })`; `seed-admin.js` uses `admin.upsert`.

### 3. Tests on prismock
- `server/tests/helpers.js`: `createTestApp()` builds a `PrismockClient`, seeds records + admin via the client, returns `createApp(client, { rateLimit: false })`.
- Update direct-DB assertions from `pool.query(...)` to Prisma calls; snake_case fields → camelCase.
- All 23 tests must pass (`npm run test:server`). If prismock is incompatible with the installed Prisma major, pin `prisma`/`@prisma/client` to the latest major prismock supports.

### 4. Frontend touch-up
- `src/pages/Admin/AdminApplications.jsx`: `a.first_name`→`a.firstName`, `a.last_name`→`a.lastName`, `a.proof_url`→`a.proofUrl`, `a.created_at`→`a.createdAt`.

### 5. Docs + env
- `DEPLOYMENT.md`: init commands become `db:push` + seeds; remove in-memory mode section; note `postinstall` runs `prisma generate`.
- `.env.example`: DATABASE_URL marked required.

### 6. Verification
- `npm run test:server` green, `npm run lint` clean, `npm run build` ok.
- When the user adds `DATABASE_URL` (public Railway URL) to `.env`: `npm run db:push`, `npm run db:seed-records`, `npm run db:seed-admin`, then browser E2E against the real database and confirm tables visible in Railway.
- No commits.
