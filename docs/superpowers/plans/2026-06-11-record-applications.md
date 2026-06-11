# Record Applications System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Public "Sign for a Record" form + admin review panel + records moved from JSON to PostgreSQL, per spec `docs/superpowers/specs/2026-06-11-record-applications-design.md`.

**Architecture:** New `server/` Express app exposing `/api/*` and serving `dist/` in production; `createApp(pool, opts)` factory so tests inject a pg-mem pool. Frontend gains three pages (form, admin login, admin dashboard) and switches Records to React Query. If `DATABASE_URL` is unset, the server falls back to an in-memory pg-mem database seeded from the JSON files (dev mode) so everything runs without provisioning Postgres.

**Tech Stack:** Express 5, pg, bcryptjs, jsonwebtoken, cookie-parser, express-rate-limit, dotenv; vitest + supertest + pg-mem for tests; existing React 19 + antd + @tanstack/react-query frontend.

**⚠️ NO GIT COMMITS** (standing user instruction). Every commit step is replaced by "do not commit".

**Testing note:** Backend follows TDD with vitest/supertest/pg-mem. The frontend pages have no test harness (consistent with the project); they are verified in the browser in the final task.

---

### Task 1: Dependencies, env scaffolding, npm scripts, Vite proxy

**Files:**
- Modify: `package.json` (scripts), `vite.config.js`, `.gitignore`
- Create: `.env.example`, `.env`

- [ ] **Step 1: Install dependencies**

Run: `npm install express pg bcryptjs jsonwebtoken cookie-parser express-rate-limit dotenv`
Run: `npm install -D vitest supertest pg-mem`
Expected: both succeed without peer errors.

- [ ] **Step 2: Add npm scripts to `package.json`** (inside `"scripts"`)

```json
"dev:server": "node --watch server/index.js",
"start:server": "node server/index.js",
"db:migrate": "node server/db/migrate.js",
"db:seed-records": "node server/db/seed-records.js",
"db:seed-admin": "node server/db/seed-admin.js",
"test:server": "vitest run server/tests"
```

- [ ] **Step 3: Add `/api` proxy to `vite.config.js`**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
```

- [ ] **Step 4: Create `.env.example` and `.env`; gitignore `.env`**

`.env.example`:
```
# Postgres connection string (Railway → Postgres → Connect → DATABASE_URL).
# Leave unset to run the server with a temporary in-memory database (dev only).
DATABASE_URL=
# Long random string used to sign admin session tokens. REQUIRED in production.
JWT_SECRET=
# First admin account, used only by `npm run db:seed-admin`.
ADMIN_USERNAME=
ADMIN_PASSWORD=
# Server port (Railway sets this automatically).
PORT=3001
```

`.env` (local dev — in-memory DB mode):
```
JWT_SECRET=dev-only-secret-change-me
PORT=3001
```

Append to `.gitignore`:
```
.env
```

- [ ] **Step 5: Do NOT commit** (applies to all tasks; not repeated)

---

### Task 2: Database layer — schema, pool (with pg-mem dev fallback), migrate

**Files:**
- Create: `server/db/schema.sql`, `server/db/pool.js`, `server/db/migrate.js`

- [ ] **Step 1: `server/db/schema.sql`**

CHECK constraints use only `=`/`OR` (no nested parens) so the test helper can strip them for pg-mem with a simple regex.

```sql
CREATE TABLE IF NOT EXISTS admins (
  id            SERIAL PRIMARY KEY,
  username      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS records (
  id          SERIAL PRIMARY KEY,
  pool        TEXT NOT NULL CHECK (pool = '25' OR pool = '50'),
  gender      TEXT NOT NULL CHECK (gender = 'male' OR gender = 'female'),
  category    TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  discipline  TEXT NOT NULL,
  time        TEXT NOT NULL,
  athlete     TEXT NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (pool, gender, category, discipline)
);

CREATE TABLE IF NOT EXISTS record_applications (
  id          SERIAL PRIMARY KEY,
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL,
  gender      TEXT NOT NULL CHECK (gender = 'male' OR gender = 'female'),
  pool        TEXT NOT NULL CHECK (pool = '25' OR pool = '50'),
  category    TEXT NOT NULL,
  discipline  TEXT NOT NULL,
  time        TEXT NOT NULL,
  proof_url   TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending'
              CHECK (status = 'pending' OR status = 'approved' OR status = 'denied'),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by INTEGER REFERENCES admins(id)
);
```

- [ ] **Step 2: `server/db/pool.js`** — real Pool when `DATABASE_URL` set; otherwise in-memory pg-mem auto-migrated and seeded (records from JSON + admin `admin`/`admin12345`), with a loud console warning.

```js
// server/db/pool.js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaSql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");

export const stripChecks = (sql) => sql.replace(/,?\s*CHECK \([^)]*\)/g, "");

const loadRecordsFromJson = () => {
  const dataDir = path.join(__dirname, "..", "..", "src", "data", "records");
  const files = [
    { file: "women25.json", pool: "25", gender: "female" },
    { file: "men25.json", pool: "25", gender: "male" },
    { file: "women50.json", pool: "50", gender: "female" },
    { file: "men50.json", pool: "50", gender: "male" },
  ];
  const rows = [];
  for (const f of files) {
    const categories = JSON.parse(
      fs.readFileSync(path.join(dataDir, f.file), "utf8")
    );
    categories.forEach((cat, sortOrder) => {
      for (const r of cat.records) {
        rows.push({
          pool: f.pool,
          gender: f.gender,
          category: cat.name,
          sortOrder,
          discipline: r.discipline,
          time: r.time,
          athlete: r.athlete,
        });
      }
    });
  }
  return rows;
};

export const insertRecords = async (queryable, rows) => {
  for (const r of rows) {
    await queryable.query(
      `INSERT INTO records (pool, gender, category, sort_order, discipline, time, athlete)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (pool, gender, category, discipline) DO NOTHING`,
      [r.pool, r.gender, r.category, r.sortOrder, r.discipline, r.time, r.athlete]
    );
  }
};

const createMemoryPool = async () => {
  const { newDb } = await import("pg-mem");
  const bcrypt = (await import("bcryptjs")).default;
  const mem = newDb();
  const { Pool } = mem.adapters.createPg();
  const memPool = new Pool();
  await memPool.query(stripChecks(schemaSql));
  await insertRecords(memPool, loadRecordsFromJson());
  const hash = bcrypt.hashSync("admin12345", 10);
  await memPool.query(
    "INSERT INTO admins (username, password_hash) VALUES ($1, $2)",
    ["admin", hash]
  );
  console.warn(
    "[pfm] DATABASE_URL not set — using IN-MEMORY database (data is lost on restart).\n" +
      "[pfm] Dev admin login: admin / admin12345"
  );
  return memPool;
};

export const createPool = async () => {
  if (process.env.DATABASE_URL) {
    return new pg.Pool({ connectionString: process.env.DATABASE_URL });
  }
  return createMemoryPool();
};

export { loadRecordsFromJson, schemaSql };
```

- [ ] **Step 3: `server/db/migrate.js`**

```js
// server/db/migrate.js
import "dotenv/config";
import pg from "pg";
import { schemaSql } from "./pool.js";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required to run migrations.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
await pool.query(schemaSql);
console.log("Schema applied.");
await pool.end();
```

- [ ] **Step 4: Verify lint passes** — `npm run lint`, expected clean (eslint config may need `server/**` excluded from react rules; if eslint errors on node globals, add an ignore for `server/**` in `eslint.config.js` `globalIgnores` — server code is plain Node, frontend lint rules don't apply).

---

### Task 3: Validation helpers (TDD)

**Files:**
- Create: `server/lib/validate.js`
- Test: `server/tests/validate.test.js`

- [ ] **Step 1: Write the failing tests**

```js
// server/tests/validate.test.js
import { describe, it, expect } from "vitest";
import { isValidTime, isValidProofUrl, validateApplication } from "../lib/validate.js";

describe("isValidTime", () => {
  it("accepts m:ss.xx and mm:ss.xx", () => {
    expect(isValidTime("0:26.34")).toBe(true);
    expect(isValidTime("17:06.42")).toBe(true);
  });
  it("rejects bad shapes", () => {
    expect(isValidTime("26.34")).toBe(false);
    expect(isValidTime("0:26")).toBe(false);
    expect(isValidTime("0:266.34")).toBe(false);
    expect(isValidTime("abc")).toBe(false);
    expect(isValidTime("")).toBe(false);
  });
});

describe("isValidProofUrl", () => {
  it("accepts http(s) URLs", () => {
    expect(isValidProofUrl("https://results.swim.mk/meet/1")).toBe(true);
    expect(isValidProofUrl("http://example.com")).toBe(true);
  });
  it("rejects other schemes and garbage", () => {
    expect(isValidProofUrl("javascript:alert(1)")).toBe(false);
    expect(isValidProofUrl("ftp://x")).toBe(false);
    expect(isValidProofUrl("not a url")).toBe(false);
  });
});

describe("validateApplication", () => {
  const good = {
    firstName: "Ana",
    lastName: "Stojanova",
    gender: "female",
    pool: "25",
    category: "Seniors (17+)",
    discipline: "50m Freestyle",
    time: "0:25.99",
    proofUrl: "https://results.example.com/1",
  };
  it("passes a valid application", () => {
    const r = validateApplication(good);
    expect(r.ok).toBe(true);
    expect(r.data.firstName).toBe("Ana");
  });
  it("trims whitespace", () => {
    const r = validateApplication({ ...good, firstName: "  Ana  " });
    expect(r.data.firstName).toBe("Ana");
  });
  it("rejects missing fields, bad gender/pool, long names, bad time/url", () => {
    expect(validateApplication({ ...good, firstName: "" }).ok).toBe(false);
    expect(validateApplication({ ...good, gender: "other" }).ok).toBe(false);
    expect(validateApplication({ ...good, pool: "33" }).ok).toBe(false);
    expect(validateApplication({ ...good, firstName: "x".repeat(101) }).ok).toBe(false);
    expect(validateApplication({ ...good, time: "fast" }).ok).toBe(false);
    expect(validateApplication({ ...good, proofUrl: "nope" }).ok).toBe(false);
  });
});
```

- [ ] **Step 2: Run to verify failure** — `npm run test:server` → FAIL (module not found).

- [ ] **Step 3: Implement `server/lib/validate.js`**

```js
// server/lib/validate.js
const TIME_RE = /^\d{1,2}:\d{2}\.\d{2}$/;

export const isValidTime = (v) => typeof v === "string" && TIME_RE.test(v);

export const isValidProofUrl = (v) => {
  if (typeof v !== "string" || v.length > 500) return false;
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

const text = (v, max = 100) =>
  typeof v === "string" && v.trim().length > 0 && v.trim().length <= max
    ? v.trim()
    : null;

export const validateApplication = (body = {}) => {
  const errors = [];
  const firstName = text(body.firstName);
  const lastName = text(body.lastName);
  const category = text(body.category, 200);
  const discipline = text(body.discipline, 200);
  if (!firstName) errors.push("firstName");
  if (!lastName) errors.push("lastName");
  if (body.gender !== "male" && body.gender !== "female") errors.push("gender");
  if (body.pool !== "25" && body.pool !== "50") errors.push("pool");
  if (!category) errors.push("category");
  if (!discipline) errors.push("discipline");
  if (!isValidTime(body.time)) errors.push("time");
  if (!isValidProofUrl(body.proofUrl)) errors.push("proofUrl");
  if (errors.length > 0) return { ok: false, errors };
  return {
    ok: true,
    data: {
      firstName,
      lastName,
      gender: body.gender,
      pool: body.pool,
      category,
      discipline,
      time: body.time,
      proofUrl: body.proofUrl,
    },
  };
};
```

- [ ] **Step 4: Run tests** — `npm run test:server` → validate tests PASS.

---

### Task 4: App factory + public records endpoints (TDD)

**Files:**
- Create: `server/app.js`, `server/routes/records.js`
- Test: `server/tests/helpers.js`, `server/tests/records.test.js`

- [ ] **Step 1: `server/tests/helpers.js`** — pg-mem app with seeded records + one admin

```js
// server/tests/helpers.js
import { newDb } from "pg-mem";
import bcrypt from "bcryptjs";
import { createApp } from "../app.js";
import { schemaSql, stripChecks } from "../db/pool.js";

export const TEST_ADMIN = { username: "boss", password: "secret-pass-123" };

export const SEED_RECORDS = [
  ["25", "female", "Seniors (17+)", 0, "50m Freestyle", "0:26.34", "Bogdanovska Anastasija"],
  ["25", "female", "Seniors (17+)", 0, "100m Freestyle", "0:56.12", "Bogdanovska Anastasija"],
  ["25", "female", "Juniors (15/16)", 1, "50m Freestyle", "0:26.57", "Blazevska Eminova Mia"],
  ["50", "male", "Seniors (19+)", 0, "50m Freestyle", "0:22.94", "Jankovski Jovan"],
];

export const createTestApp = async () => {
  const mem = newDb();
  const { Pool } = mem.adapters.createPg();
  const pool = new Pool();
  await pool.query(stripChecks(schemaSql));
  for (const r of SEED_RECORDS) {
    await pool.query(
      `INSERT INTO records (pool, gender, category, sort_order, discipline, time, athlete)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      r
    );
  }
  const hash = bcrypt.hashSync(TEST_ADMIN.password, 10);
  await pool.query(
    "INSERT INTO admins (username, password_hash) VALUES ($1, $2)",
    [TEST_ADMIN.username, hash]
  );
  process.env.JWT_SECRET = "test-secret";
  const app = createApp(pool, { rateLimit: false });
  return { app, pool };
};
```

- [ ] **Step 2: Failing tests `server/tests/records.test.js`**

```js
// server/tests/records.test.js
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createTestApp } from "./helpers.js";

let app;
beforeAll(async () => {
  ({ app } = await createTestApp());
});

describe("GET /api/records", () => {
  it("returns grouped categories for pool+gender, ordered", async () => {
    const res = await request(app).get("/api/records?pool=25&gender=female");
    expect(res.status).toBe(200);
    expect(res.body.map((c) => c.name)).toEqual(["Seniors (17+)", "Juniors (15/16)"]);
    expect(res.body[0].records[0]).toEqual({
      discipline: "50m Freestyle",
      time: "0:26.34",
      athlete: "Bogdanovska Anastasija",
    });
  });
  it("rejects bad params", async () => {
    expect((await request(app).get("/api/records?pool=33&gender=female")).status).toBe(400);
    expect((await request(app).get("/api/records?pool=25&gender=x")).status).toBe(400);
  });
});

describe("GET /api/records/options", () => {
  it("returns categories and per-category disciplines", async () => {
    const res = await request(app).get("/api/records/options?pool=25&gender=female");
    expect(res.status).toBe(200);
    expect(res.body.categories).toEqual(["Seniors (17+)", "Juniors (15/16)"]);
    expect(res.body.disciplines["Seniors (17+)"]).toContain("100m Freestyle");
    expect(res.body.disciplines["Juniors (15/16)"]).toEqual(["50m Freestyle"]);
  });
});
```

- [ ] **Step 3: Run to verify failure** — `npm run test:server` → FAIL (createApp not found).

- [ ] **Step 4: Implement `server/app.js`**

```js
// server/app.js
import express from "express";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { recordsRouter } from "./routes/records.js";
import { applicationsRouter } from "./routes/applications.js";
import { authRouter } from "./routes/auth.js";
import { adminRouter } from "./routes/admin.js";

export const createApp = (pool, { rateLimit: enableRateLimit = true } = {}) => {
  const app = express();
  app.set("trust proxy", 1);
  app.use(express.json());
  app.use(cookieParser());

  const limiter = (windowMs, limit) =>
    enableRateLimit
      ? rateLimit({ windowMs, limit, standardHeaders: true, legacyHeaders: false })
      : (req, res, next) => next();

  app.use("/api/records", recordsRouter(pool));
  app.use("/api/applications", limiter(60 * 60 * 1000, 5), applicationsRouter(pool));
  app.use("/api/auth", limiter(15 * 60 * 1000, 10), authRouter(pool));
  app.use("/api/admin", adminRouter(pool));

  app.use("/api", (req, res) => res.status(404).json({ error: "Not found" }));
  return app;
};
```

- [ ] **Step 5: Implement `server/routes/records.js`**

```js
// server/routes/records.js
import { Router } from "express";

const validParams = (q) =>
  (q.pool === "25" || q.pool === "50") &&
  (q.gender === "male" || q.gender === "female");

const fetchRows = async (pool, q) => {
  const { rows } = await pool.query(
    `SELECT category, sort_order, discipline, time, athlete
     FROM records WHERE pool = $1 AND gender = $2
     ORDER BY sort_order, id`,
    [q.pool, q.gender]
  );
  return rows;
};

export const recordsRouter = (pool) => {
  const router = Router();

  router.get("/", async (req, res) => {
    if (!validParams(req.query)) return res.status(400).json({ error: "Invalid pool or gender" });
    const rows = await fetchRows(pool, req.query);
    const byCategory = new Map();
    for (const r of rows) {
      if (!byCategory.has(r.category)) byCategory.set(r.category, []);
      byCategory.get(r.category).push({ discipline: r.discipline, time: r.time, athlete: r.athlete });
    }
    res.json([...byCategory.entries()].map(([name, records]) => ({ name, records })));
  });

  router.get("/options", async (req, res) => {
    if (!validParams(req.query)) return res.status(400).json({ error: "Invalid pool or gender" });
    const rows = await fetchRows(pool, req.query);
    const categories = [];
    const disciplines = {};
    for (const r of rows) {
      if (!disciplines[r.category]) {
        categories.push(r.category);
        disciplines[r.category] = [];
      }
      disciplines[r.category].push(r.discipline);
    }
    res.json({ categories, disciplines });
  });

  return router;
};
```

(Temporarily stub `applications.js`, `auth.js`, `admin.js` as empty routers so `app.js` imports resolve — each becomes real in its own task:)

```js
// server/routes/applications.js  (stub — replaced in Task 5)
import { Router } from "express";
export const applicationsRouter = () => Router();
```
```js
// server/routes/auth.js  (stub — replaced in Task 6)
import { Router } from "express";
export const authRouter = () => Router();
```
```js
// server/routes/admin.js  (stub — replaced in Task 7)
import { Router } from "express";
export const adminRouter = () => Router();
```

- [ ] **Step 6: Run tests** — `npm run test:server` → records tests PASS.

---

### Task 5: Application submission endpoint (TDD)

**Files:**
- Replace stub: `server/routes/applications.js`
- Test: `server/tests/applications.test.js`

- [ ] **Step 1: Failing tests**

```js
// server/tests/applications.test.js
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createTestApp } from "./helpers.js";

let app, pool;
beforeAll(async () => {
  ({ app, pool } = await createTestApp());
});

const good = {
  firstName: "Ana",
  lastName: "Stojanova",
  gender: "female",
  pool: "25",
  category: "Seniors (17+)",
  discipline: "50m Freestyle",
  time: "0:25.99",
  proofUrl: "https://results.example.com/1",
};

describe("POST /api/applications", () => {
  it("creates a pending application", async () => {
    const res = await request(app).post("/api/applications").send(good);
    expect(res.status).toBe(201);
    expect(res.body.id).toBeTruthy();
    const { rows } = await pool.query(
      "SELECT * FROM record_applications WHERE id = $1", [res.body.id]
    );
    expect(rows[0].status).toBe("pending");
    expect(rows[0].first_name).toBe("Ana");
  });
  it("rejects invalid payloads", async () => {
    const res = await request(app).post("/api/applications").send({ ...good, time: "fast" });
    expect(res.status).toBe(400);
    expect(res.body.errors).toContain("time");
  });
  it("rejects category/discipline that has no record slot", async () => {
    const res = await request(app)
      .post("/api/applications")
      .send({ ...good, discipline: "999m Doggy Paddle" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/discipline/i);
  });
});
```

- [ ] **Step 2: Run to verify failure** — `npm run test:server` → applications tests FAIL (stub router).

- [ ] **Step 3: Implement `server/routes/applications.js`**

```js
// server/routes/applications.js
import { Router } from "express";
import { validateApplication } from "../lib/validate.js";

export const applicationsRouter = (pool) => {
  const router = Router();

  router.post("/", async (req, res) => {
    const v = validateApplication(req.body);
    if (!v.ok) return res.status(400).json({ error: "Invalid fields", errors: v.errors });
    const d = v.data;

    const slot = await pool.query(
      `SELECT 1 FROM records
       WHERE pool = $1 AND gender = $2 AND category = $3 AND discipline = $4`,
      [d.pool, d.gender, d.category, d.discipline]
    );
    if (slot.rows.length === 0) {
      return res.status(400).json({
        error: "Unknown category/discipline for the selected pool and sex",
      });
    }

    const { rows } = await pool.query(
      `INSERT INTO record_applications
         (first_name, last_name, gender, pool, category, discipline, time, proof_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING id`,
      [d.firstName, d.lastName, d.gender, d.pool, d.category, d.discipline, d.time, d.proofUrl]
    );
    res.status(201).json({ id: rows[0].id });
  });

  return router;
};
```

- [ ] **Step 4: Run tests** — `npm run test:server` → PASS.

---

### Task 6: Auth — login/logout/me + requireAdmin middleware (TDD)

**Files:**
- Replace stub: `server/routes/auth.js`
- Create: `server/middleware/requireAdmin.js`
- Test: `server/tests/auth.test.js`

- [ ] **Step 1: Failing tests**

```js
// server/tests/auth.test.js
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createTestApp, TEST_ADMIN } from "./helpers.js";

let app;
beforeAll(async () => {
  ({ app } = await createTestApp());
});

describe("auth", () => {
  it("login with valid credentials sets cookie and returns username", async () => {
    const agent = request.agent(app);
    const res = await agent.post("/api/auth/login").send(TEST_ADMIN);
    expect(res.status).toBe(200);
    expect(res.body.username).toBe(TEST_ADMIN.username);
    expect(res.headers["set-cookie"][0]).toMatch(/pfm_admin=/);
    const me = await agent.get("/api/auth/me");
    expect(me.status).toBe(200);
    expect(me.body.username).toBe(TEST_ADMIN.username);
  });
  it("login with bad credentials returns generic 401", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: TEST_ADMIN.username, password: "wrong" });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid credentials");
  });
  it("me without cookie is 401; logout clears session", async () => {
    expect((await request(app).get("/api/auth/me")).status).toBe(401);
    const agent = request.agent(app);
    await agent.post("/api/auth/login").send(TEST_ADMIN);
    await agent.post("/api/auth/logout");
    expect((await agent.get("/api/auth/me")).status).toBe(401);
  });
});
```

- [ ] **Step 2: Run to verify failure** — FAIL (stub).

- [ ] **Step 3: Implement `server/middleware/requireAdmin.js`**

```js
// server/middleware/requireAdmin.js
import jwt from "jsonwebtoken";

export const COOKIE_NAME = "pfm_admin";

export const requireAdmin = (req, res, next) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = { id: payload.sub, username: payload.username };
    next();
  } catch {
    return res.status(401).json({ error: "Not authenticated" });
  }
};
```

- [ ] **Step 4: Implement `server/routes/auth.js`**

```js
// server/routes/auth.js
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { COOKIE_NAME, requireAdmin } from "../middleware/requireAdmin.js";

const cookieOpts = () => ({
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

export const authRouter = (pool) => {
  const router = Router();

  router.post("/login", async (req, res) => {
    const { username, password } = req.body ?? {};
    if (typeof username !== "string" || typeof password !== "string") {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const { rows } = await pool.query(
      "SELECT id, username, password_hash FROM admins WHERE username = $1",
      [username]
    );
    const admin = rows[0];
    const ok = admin && (await bcrypt.compare(password, admin.password_hash));
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { sub: admin.id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.cookie(COOKIE_NAME, token, cookieOpts());
    res.json({ username: admin.username });
  });

  router.post("/logout", (req, res) => {
    res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: "lax" });
    res.json({ ok: true });
  });

  router.get("/me", requireAdmin, (req, res) => {
    res.json({ username: req.admin.username });
  });

  return router;
};
```

- [ ] **Step 5: Run tests** — PASS.

---

### Task 7: Admin endpoints — list, approve, deny, create admin (TDD)

**Files:**
- Replace stub: `server/routes/admin.js`
- Test: `server/tests/admin.test.js`

- [ ] **Step 1: Failing tests**

```js
// server/tests/admin.test.js
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createTestApp, TEST_ADMIN } from "./helpers.js";

let app, pool, agent;

const application = {
  firstName: "Ana",
  lastName: "Stojanova",
  gender: "female",
  pool: "25",
  category: "Seniors (17+)",
  discipline: "50m Freestyle",
  time: "0:25.99",
  proofUrl: "https://results.example.com/1",
};

const submit = async (over = {}) => {
  const res = await request(app).post("/api/applications").send({ ...application, ...over });
  return res.body.id;
};

beforeAll(async () => {
  ({ app, pool } = await createTestApp());
  agent = request.agent(app);
  await agent.post("/api/auth/login").send(TEST_ADMIN);
});

describe("admin guard", () => {
  it("rejects unauthenticated access", async () => {
    expect((await request(app).get("/api/admin/applications")).status).toBe(401);
  });
});

describe("GET /api/admin/applications", () => {
  it("lists pending applications with the current record attached", async () => {
    await submit();
    const res = await agent.get("/api/admin/applications?status=pending");
    expect(res.status).toBe(200);
    const item = res.body.find((a) => a.first_name === "Ana");
    expect(item.currentRecord).toEqual({
      time: "0:26.34",
      athlete: "Bogdanovska Anastasija",
    });
  });
});

describe("approve / deny", () => {
  it("approve replaces the record and marks the application", async () => {
    const id = await submit({ time: "0:25.50" });
    const res = await agent.post(`/api/admin/applications/${id}/approve`);
    expect(res.status).toBe(200);
    const rec = await pool.query(
      `SELECT time, athlete FROM records
       WHERE pool='25' AND gender='female' AND category='Seniors (17+)' AND discipline='50m Freestyle'`
    );
    expect(rec.rows[0]).toEqual({ time: "0:25.50", athlete: "Stojanova Ana" });
    const appRow = await pool.query(
      "SELECT status, reviewed_by FROM record_applications WHERE id=$1", [id]
    );
    expect(appRow.rows[0].status).toBe("approved");
    expect(appRow.rows[0].reviewed_by).not.toBeNull();
  });
  it("deny marks the application and leaves the record alone", async () => {
    const id = await submit({ discipline: "100m Freestyle", time: "0:55.00" });
    const res = await agent.post(`/api/admin/applications/${id}/deny`);
    expect(res.status).toBe(200);
    const rec = await pool.query(
      `SELECT time FROM records
       WHERE pool='25' AND gender='female' AND category='Seniors (17+)' AND discipline='100m Freestyle'`
    );
    expect(rec.rows[0].time).toBe("0:56.12");
  });
  it("acting on a non-pending application returns 409", async () => {
    const id = await submit({ time: "0:25.40" });
    await agent.post(`/api/admin/applications/${id}/approve`);
    expect((await agent.post(`/api/admin/applications/${id}/approve`)).status).toBe(409);
    expect((await agent.post(`/api/admin/applications/${id}/deny`)).status).toBe(409);
  });
});

describe("POST /api/admin/admins", () => {
  it("creates a new admin who can log in", async () => {
    const res = await agent
      .post("/api/admin/admins")
      .send({ username: "second", password: "long-enough-pw" });
    expect(res.status).toBe(201);
    const login = await request(app)
      .post("/api/auth/login")
      .send({ username: "second", password: "long-enough-pw" });
    expect(login.status).toBe(200);
  });
  it("rejects short passwords and duplicates", async () => {
    expect(
      (await agent.post("/api/admin/admins").send({ username: "x", password: "short" })).status
    ).toBe(400);
    expect(
      (await agent.post("/api/admin/admins").send({ username: "second", password: "long-enough-pw" })).status
    ).toBe(409);
  });
});
```

- [ ] **Step 2: Run to verify failure** — FAIL (stub).

- [ ] **Step 3: Implement `server/routes/admin.js`**

```js
// server/routes/admin.js
import { Router } from "express";
import bcrypt from "bcryptjs";
import { requireAdmin } from "../middleware/requireAdmin.js";

export const adminRouter = (pool) => {
  const router = Router();
  router.use(requireAdmin);

  router.get("/applications", async (req, res) => {
    const status = ["pending", "approved", "denied"].includes(req.query.status)
      ? req.query.status
      : "pending";
    const { rows } = await pool.query(
      `SELECT a.*, r.time AS current_time_val, r.athlete AS current_athlete
       FROM record_applications a
       LEFT JOIN records r
         ON r.pool = a.pool AND r.gender = a.gender
        AND r.category = a.category AND r.discipline = a.discipline
       WHERE a.status = $1
       ORDER BY a.created_at DESC, a.id DESC`,
      [status]
    );
    res.json(
      rows.map(({ current_time_val, current_athlete, ...a }) => ({
        ...a,
        currentRecord: current_time_val
          ? { time: current_time_val, athlete: current_athlete }
          : null,
      }))
    );
  });

  const loadPending = async (client, id) => {
    const { rows } = await client.query(
      "SELECT * FROM record_applications WHERE id = $1",
      [id]
    );
    if (rows.length === 0) return { error: 404 };
    if (rows[0].status !== "pending") return { error: 409 };
    return { app: rows[0] };
  };

  router.post("/applications/:id/approve", async (req, res) => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const { app, error } = await loadPending(client, req.params.id);
      if (error) {
        await client.query("ROLLBACK");
        return res.status(error).json({ error: error === 404 ? "Not found" : "Already reviewed" });
      }
      const sortRes = await client.query(
        `SELECT sort_order FROM records
         WHERE pool=$1 AND gender=$2 AND category=$3 LIMIT 1`,
        [app.pool, app.gender, app.category]
      );
      const sortOrder = sortRes.rows[0]?.sort_order ?? 0;
      await client.query(
        `INSERT INTO records (pool, gender, category, sort_order, discipline, time, athlete)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (pool, gender, category, discipline)
         DO UPDATE SET time = EXCLUDED.time, athlete = EXCLUDED.athlete, updated_at = now()`,
        [app.pool, app.gender, app.category, sortOrder, app.discipline, app.time,
         `${app.last_name} ${app.first_name}`]
      );
      await client.query(
        `UPDATE record_applications
         SET status='approved', reviewed_at=now(), reviewed_by=$2 WHERE id=$1`,
        [app.id, req.admin.id]
      );
      await client.query("COMMIT");
      res.json({ ok: true });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  });

  router.post("/applications/:id/deny", async (req, res) => {
    const { rows } = await pool.query(
      "SELECT id, status FROM record_applications WHERE id = $1",
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    if (rows[0].status !== "pending") return res.status(409).json({ error: "Already reviewed" });
    await pool.query(
      `UPDATE record_applications
       SET status='denied', reviewed_at=now(), reviewed_by=$2 WHERE id=$1`,
      [req.params.id, req.admin.id]
    );
    res.json({ ok: true });
  });

  router.post("/admins", async (req, res) => {
    const { username, password } = req.body ?? {};
    if (
      typeof username !== "string" || username.trim().length < 3 || username.length > 50 ||
      typeof password !== "string" || password.length < 10
    ) {
      return res.status(400).json({ error: "Username min 3 chars, password min 10 chars" });
    }
    const existing = await pool.query("SELECT 1 FROM admins WHERE username = $1", [username.trim()]);
    if (existing.rows.length > 0) return res.status(409).json({ error: "Username already exists" });
    const hash = await bcrypt.hash(password, 12);
    await pool.query(
      "INSERT INTO admins (username, password_hash) VALUES ($1, $2)",
      [username.trim(), hash]
    );
    res.status(201).json({ ok: true });
  });

  return router;
};
```

- [ ] **Step 4: Run all server tests** — `npm run test:server` → all PASS.

---

### Task 8: Server entrypoint + seed scripts

**Files:**
- Create: `server/index.js`, `server/db/seed-records.js`, `server/db/seed-admin.js`

- [ ] **Step 1: `server/index.js`** — boot, JWT secret guard, static serving in production

```js
// server/index.js
import "dotenv/config";
import path from "node:path";
import express from "express";
import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";
import { createPool } from "./db/pool.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === "production") {
    console.error("JWT_SECRET is required in production.");
    process.exit(1);
  }
  process.env.JWT_SECRET = "dev-only-secret";
  console.warn("[pfm] JWT_SECRET not set — using an insecure dev secret.");
}

const pool = await createPool();
const app = createApp(pool);

if (process.env.NODE_ENV === "production") {
  const dist = path.join(__dirname, "..", "dist");
  app.use(express.static(dist));
  app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api")) {
      return res.sendFile(path.join(dist, "index.html"));
    }
    next();
  });
}

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => console.log(`[pfm] API listening on :${port}`));
```

- [ ] **Step 2: `server/db/seed-records.js`**

```js
// server/db/seed-records.js
import "dotenv/config";
import pg from "pg";
import { loadRecordsFromJson, insertRecords } from "./pool.js";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required to seed records.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const rows = loadRecordsFromJson();
await insertRecords(pool, rows);
console.log(`Seeded ${rows.length} records (existing rows left untouched).`);
await pool.end();
```

- [ ] **Step 3: `server/db/seed-admin.js`**

```js
// server/db/seed-admin.js
import "dotenv/config";
import pg from "pg";
import bcrypt from "bcryptjs";

const { DATABASE_URL, ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;
if (!DATABASE_URL || !ADMIN_USERNAME || !ADMIN_PASSWORD) {
  console.error("DATABASE_URL, ADMIN_USERNAME and ADMIN_PASSWORD are required.");
  process.exit(1);
}
if (ADMIN_PASSWORD.length < 10) {
  console.error("ADMIN_PASSWORD must be at least 10 characters.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: DATABASE_URL });
const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
await pool.query(
  `INSERT INTO admins (username, password_hash) VALUES ($1, $2)
   ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
  [ADMIN_USERNAME, hash]
);
console.log(`Admin '${ADMIN_USERNAME}' created/updated.`);
await pool.end();
```

- [ ] **Step 4: Smoke-test dev mode** — run `npm run dev:server` (background), then:
`curl http://localhost:3001/api/records?pool=25&gender=female` → JSON categories.
`curl -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d '{"username":"admin","password":"admin12345"}'` → `{"username":"admin"}`.
Stop server.

---

### Task 9: Frontend API helper + Records page on React Query

**Files:**
- Create: `src/lib/api.js`
- Modify: `src/pages/Swimming/Records.jsx` (imports + data source), `public/locales/en/translation.json`, `public/locales/mk/translation.json` (records.loadError / records.retry keys)

- [ ] **Step 1: `src/lib/api.js`**

```js
// src/lib/api.js
const json = async (res) => {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
};

export const apiGet = (url) => fetch(url, { credentials: "include" }).then(json);

export const apiPost = (url, data) =>
  fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: data === undefined ? undefined : JSON.stringify(data),
  }).then(json);
```

- [ ] **Step 2: Switch `Records.jsx` to the API**

Remove the four JSON imports and `DATA_MAP`. Replace:

```js
const rawData = DATA_MAP?.[pool]?.[gender];
const categories = useMemo(() => normalizeData(rawData, t), [rawData, t]);
```

with:

```js
const { data: rawData, isLoading, isError, refetch } = useQuery({
  queryKey: ["records", pool, gender],
  queryFn: () => apiGet(`/api/records?pool=${pool}&gender=${gender}`),
});
const categories = useMemo(() => normalizeData(rawData, t), [rawData, t]);
```

New imports: `import { useQuery } from "@tanstack/react-query";` and `import { apiGet } from "../../lib/api.js";`, plus `Skeleton`/`Alert` from antd.

In the JSX, before the existing `<Row>` content area, render:
- `isLoading` → `<Skeleton active paragraph={{ rows: 8 }} />`
- `isError` → `<Alert type="error" showIcon message={t("records.loadError", "Could not load records.")} action={<Button size="small" onClick={() => refetch()}>{t("records.retry", "Retry")}</Button>} />`
- otherwise the existing `<Row>` block unchanged.

- [ ] **Step 3: Add i18n keys** — in both locale files under `records`:
EN: `"loadError": "Could not load records.", "retry": "Retry"`
MK: `"loadError": "Рекордите не може да се вчитаат.", "retry": "Обиди се повторно"`

- [ ] **Step 4: Verify** — `npm run lint` clean; with `npm run dev:server` + `npm run dev` running, `/swimming/records` shows the same records as before (now via API; check the Network tab for `/api/records`).

---

### Task 10: "Sign for a Record" page + Swimming card + route + i18n

**Files:**
- Create: `src/pages/Swimming/RecordApplication.jsx`, `src/pages/Swimming/RecordApplication.css`
- Modify: `src/routes.jsx`, `src/pages/Swimming/SwimmingLayout.jsx`, both locale files

- [ ] **Step 1: `src/pages/Swimming/RecordApplication.jsx`**

```jsx
import React, { useState } from "react";
import { Form, Input, Radio, Select, Button, Alert, Result } from "antd";
import { FiSend } from "react-icons/fi";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { apiGet, apiPost } from "../../lib/api.js";
import Reveal from "../../components/fx/Reveal.jsx";
import "./RecordApplication.css";

const TIME_RE = /^\d{1,2}:\d{2}\.\d{2}$/;

const RecordApplication = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [submitted, setSubmitted] = useState(false);

  const gender = Form.useWatch("gender", form) ?? "female";
  const pool = Form.useWatch("pool", form) ?? "25";
  const category = Form.useWatch("category", form);

  const { data: options } = useQuery({
    queryKey: ["record-options", pool, gender],
    queryFn: () => apiGet(`/api/records/options?pool=${pool}&gender=${gender}`),
  });

  const mutation = useMutation({
    mutationFn: (values) =>
      apiPost("/api/applications", {
        firstName: values.firstName,
        lastName: values.lastName,
        gender: values.gender,
        pool: values.pool,
        category: values.category,
        discipline: values.discipline,
        time: values.time,
        proofUrl: values.proofUrl,
      }),
    onSuccess: () => setSubmitted(true),
  });

  if (submitted) {
    return (
      <div className="pfm-recapp pt-24">
        <div className="pfm-landing-inner max-w-3xl mx-auto px-4 md:px-6">
          <Result
            status="success"
            title={t("recordApplication.success.title")}
            subTitle={t("recordApplication.success.text")}
            extra={
              <Button
                onClick={() => {
                  form.resetFields();
                  mutation.reset();
                  setSubmitted(false);
                }}
              >
                {t("recordApplication.success.another")}
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="pfm-recapp pt-24">
      <div className="pfm-landing-inner max-w-3xl mx-auto px-4 md:px-6">
        <Reveal>
          <div className="pfm-recapp-head">
            <div className="pfm-recapp-kicker">{t("recordApplication.kicker")}</div>
            <h1 className="pfm-recapp-title pfm-lane-underline pfm-lane-underline-left">
              {t("recordApplication.title")}
            </h1>
            <p className="pfm-recapp-sub">{t("recordApplication.subtitle")}</p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="pfm-recapp-card">
            <Form
              form={form}
              layout="vertical"
              requiredMark={false}
              initialValues={{ gender: "female", pool: "25" }}
              onValuesChange={(changed) => {
                if (changed.gender || changed.pool) {
                  form.setFieldsValue({ category: undefined, discipline: undefined });
                }
                if (changed.category) {
                  form.setFieldsValue({ discipline: undefined });
                }
              }}
              onFinish={(values) => mutation.mutate(values)}
            >
              <div className="pfm-recapp-grid">
                <Form.Item
                  name="firstName"
                  label={t("recordApplication.fields.firstName")}
                  rules={[{ required: true, message: t("recordApplication.errors.required") }, { max: 100 }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="lastName"
                  label={t("recordApplication.fields.lastName")}
                  rules={[{ required: true, message: t("recordApplication.errors.required") }, { max: 100 }]}
                >
                  <Input />
                </Form.Item>
              </div>

              <div className="pfm-recapp-grid">
                <Form.Item name="gender" label={t("recordApplication.fields.sex")}>
                  <Radio.Group
                    options={[
                      { label: t("recordApplication.fields.female"), value: "female" },
                      { label: t("recordApplication.fields.male"), value: "male" },
                    ]}
                    optionType="button"
                  />
                </Form.Item>
                <Form.Item name="pool" label={t("recordApplication.fields.pool")}>
                  <Radio.Group
                    options={[
                      { label: "25m", value: "25" },
                      { label: "50m", value: "50" },
                    ]}
                    optionType="button"
                  />
                </Form.Item>
              </div>

              <div className="pfm-recapp-grid">
                <Form.Item
                  name="category"
                  label={t("recordApplication.fields.category")}
                  rules={[{ required: true, message: t("recordApplication.errors.required") }]}
                >
                  <Select
                    options={(options?.categories ?? []).map((c) => ({ label: c, value: c }))}
                    placeholder={t("recordApplication.fields.categoryPlaceholder")}
                  />
                </Form.Item>
                <Form.Item
                  name="discipline"
                  label={t("recordApplication.fields.discipline")}
                  rules={[{ required: true, message: t("recordApplication.errors.required") }]}
                >
                  <Select
                    disabled={!category}
                    options={(options?.disciplines?.[category] ?? []).map((d) => ({ label: d, value: d }))}
                    placeholder={t("recordApplication.fields.disciplinePlaceholder")}
                  />
                </Form.Item>
              </div>

              <div className="pfm-recapp-grid">
                <Form.Item
                  name="time"
                  label={t("recordApplication.fields.time")}
                  extra={t("recordApplication.fields.timeHint")}
                  rules={[
                    { required: true, message: t("recordApplication.errors.required") },
                    {
                      pattern: TIME_RE,
                      message: t("recordApplication.errors.timeFormat"),
                    },
                  ]}
                >
                  <Input placeholder="0:26.34" />
                </Form.Item>
                <Form.Item
                  name="proofUrl"
                  label={t("recordApplication.fields.proofUrl")}
                  rules={[
                    { required: true, message: t("recordApplication.errors.required") },
                    { type: "url", message: t("recordApplication.errors.urlFormat") },
                  ]}
                >
                  <Input placeholder="https://..." />
                </Form.Item>
              </div>

              {mutation.isError && (
                <Alert
                  className="pfm-recapp-error"
                  type="error"
                  showIcon
                  message={mutation.error?.message || t("recordApplication.errors.submitFailed")}
                />
              )}

              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={mutation.isPending}
                className="pfm-recapp-submit"
              >
                {t("recordApplication.submit")} <FiSend />
              </Button>
            </Form>
          </div>
        </Reveal>
      </div>
    </div>
  );
};

export default RecordApplication;
```

- [ ] **Step 2: `src/pages/Swimming/RecordApplication.css`**

```css
/* src/pages/Swimming/RecordApplication.css */
.pfm-recapp {
  min-height: 70vh;
  padding-bottom: 60px;
}

.pfm-recapp-head { margin-bottom: 22px; }

.pfm-recapp-kicker {
  font-size: 0.78rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(56, 189, 248, 0.85);
}

.pfm-recapp-title {
  margin-top: 8px;
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  font-weight: 800;
  color: rgba(255, 255, 255, 0.94);
}

.pfm-recapp-sub {
  margin-top: 14px;
  color: rgba(255, 255, 255, 0.72);
  max-width: 60ch;
}

.pfm-recapp-card {
  border-radius: 22px;
  padding: 22px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(14px);
}

.pfm-recapp-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 16px;
}

@media (max-width: 640px) {
  .pfm-recapp-grid { grid-template-columns: 1fr; }
}

.pfm-recapp-error { margin-bottom: 16px; }

.pfm-recapp-submit {
  border-radius: 9999px !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: 10px !important;
}
```

- [ ] **Step 3: Route + Swimming card**

`src/routes.jsx`: add import `import RecordApplication from "./pages/Swimming/RecordApplication.jsx";` and child route `{ path: "swimming/record-application", element: <RecordApplication /> }` next to the other swimming routes.

`src/pages/Swimming/SwimmingLayout.jsx`: add `FiEdit3` to the react-icons import and a sixth entry in `cards`:

```js
{
  to: "/swimming/record-application",
  label: t("swimming.cards.recordApplication.title"),
  desc: t("swimming.cards.recordApplication.desc"),
  icon: <FiEdit3 />,
},
```

- [ ] **Step 4: i18n keys** — add to `public/locales/en/translation.json`:

Under `swimming.cards`:
```json
"recordApplication": {
  "title": "Sign for a Record",
  "desc": "Apply for a new national record."
}
```

Top-level:
```json
"recordApplication": {
  "kicker": "National records",
  "title": "Sign for a Record",
  "subtitle": "Broke a national record at an official competition? Fill in the form below — the federation reviews every application and updates the official record list once it is approved.",
  "fields": {
    "firstName": "First name",
    "lastName": "Last name",
    "sex": "Sex",
    "female": "Women",
    "male": "Men",
    "pool": "Pool",
    "category": "Category",
    "categoryPlaceholder": "Select category",
    "discipline": "Discipline",
    "disciplinePlaceholder": "Select discipline",
    "time": "New record (time)",
    "timeHint": "Format: minutes:seconds.hundredths, e.g. 0:26.34",
    "proofUrl": "Link to competition results"
  },
  "submit": "Submit application",
  "success": {
    "title": "Application submitted",
    "text": "The federation will review your application. If approved, the record list is updated.",
    "another": "Submit another"
  },
  "errors": {
    "required": "This field is required",
    "timeFormat": "Use the format 0:26.34",
    "urlFormat": "Enter a valid link (https://...)",
    "submitFailed": "Submission failed. Please try again."
  }
}
```

And the Macedonian equivalents in `public/locales/mk/translation.json`:

Under `swimming.cards`:
```json
"recordApplication": {
  "title": "Пријави рекорд",
  "desc": "Пријава за нов државен рекорд."
}
```

Top-level:
```json
"recordApplication": {
  "kicker": "Државни рекорди",
  "title": "Пријави рекорд",
  "subtitle": "Соборивте државен рекорд на официјален натпревар? Пополнете го формуларот — федерацијата ја разгледува секоја пријава и по одобрување ја ажурира официјалната листа на рекорди.",
  "fields": {
    "firstName": "Име",
    "lastName": "Презиме",
    "sex": "Пол",
    "female": "Жени",
    "male": "Мажи",
    "pool": "Базен",
    "category": "Категорија",
    "categoryPlaceholder": "Изберете категорија",
    "discipline": "Дисциплина",
    "disciplinePlaceholder": "Изберете дисциплина",
    "time": "Нов рекорд (време)",
    "timeHint": "Формат: минути:секунди.стотинки, пр. 0:26.34",
    "proofUrl": "Линк до резултатите од натпреварот"
  },
  "submit": "Испрати пријава",
  "success": {
    "title": "Пријавата е испратена",
    "text": "Федерацијата ќе ја разгледа вашата пријава. По одобрување, листата на рекорди се ажурира.",
    "another": "Нова пријава"
  },
  "errors": {
    "required": "Ова поле е задолжително",
    "timeFormat": "Користете формат 0:26.34",
    "urlFormat": "Внесете валиден линк (https://...)",
    "submitFailed": "Пријавата не успеа. Обидете се повторно."
  }
}
```

- [ ] **Step 5: Verify** — lint clean; in the browser, `/swimming` shows the sixth card; the form loads categories/disciplines from the API, validates time/URL, submits successfully, and shows the success state.

---

### Task 11: Admin panel — login + dashboard

**Files:**
- Create: `src/pages/Admin/AdminLogin.jsx`, `src/pages/Admin/AdminApplications.jsx`, `src/pages/Admin/admin.css`
- Modify: `src/routes.jsx`

- [ ] **Step 1: `src/pages/Admin/AdminLogin.jsx`**

```jsx
import React from "react";
import { Form, Input, Button, Alert } from "antd";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { apiPost } from "../../lib/api.js";
import "./admin.css";

const AdminLogin = () => {
  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: (values) => apiPost("/api/auth/login", values),
    onSuccess: () => navigate("/admin/applications"),
  });

  return (
    <div className="pfm-admin pt-24">
      <div className="pfm-admin-login-wrap">
        <div className="pfm-admin-card">
          <h1 className="pfm-admin-title">Admin login</h1>
          <Form layout="vertical" requiredMark={false} onFinish={(v) => mutation.mutate(v)}>
            <Form.Item name="username" label="Username" rules={[{ required: true }]}>
              <Input autoComplete="username" />
            </Form.Item>
            <Form.Item name="password" label="Password" rules={[{ required: true }]}>
              <Input.Password autoComplete="current-password" />
            </Form.Item>
            {mutation.isError && (
              <Alert className="pfm-admin-error" type="error" showIcon message="Invalid credentials" />
            )}
            <Button type="primary" htmlType="submit" block loading={mutation.isPending}>
              Log in
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
```

- [ ] **Step 2: `src/pages/Admin/AdminApplications.jsx`**

```jsx
import React, { useEffect, useState } from "react";
import {
  Tabs, Table, Button, Popconfirm, Tag, Modal, Form, Input, Alert, message,
} from "antd";
import { FiExternalLink, FiLogOut, FiUserPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "../../lib/api.js";
import "./admin.css";

const STATUS_TABS = ["pending", "approved", "denied"];

const AdminApplications = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("pending");
  const [addOpen, setAddOpen] = useState(false);
  const [addForm] = Form.useForm();

  const me = useQuery({
    queryKey: ["admin-me"],
    queryFn: () => apiGet("/api/auth/me"),
    retry: false,
  });

  useEffect(() => {
    if (me.isError) navigate("/admin");
  }, [me.isError, navigate]);

  const apps = useQuery({
    queryKey: ["admin-applications", status],
    queryFn: () => apiGet(`/api/admin/applications?status=${status}`),
    enabled: me.isSuccess,
  });

  const act = useMutation({
    mutationFn: ({ id, action }) => apiPost(`/api/admin/applications/${id}/${action}`),
    onSuccess: (_, { action }) => {
      message.success(action === "approve" ? "Record updated." : "Application denied.");
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      queryClient.invalidateQueries({ queryKey: ["records"] });
    },
    onError: (err) => message.error(err.message),
  });

  const addAdmin = useMutation({
    mutationFn: (values) => apiPost("/api/admin/admins", values),
    onSuccess: () => {
      message.success("Admin created.");
      setAddOpen(false);
      addForm.resetFields();
    },
  });

  const logout = useMutation({
    mutationFn: () => apiPost("/api/auth/logout"),
    onSuccess: () => navigate("/admin"),
  });

  const columns = [
    {
      title: "Applicant",
      key: "applicant",
      render: (_, a) => (
        <span className="pfm-admin-strong">{a.last_name} {a.first_name}</span>
      ),
    },
    {
      title: "Target record",
      key: "target",
      render: (_, a) => (
        <div>
          <div className="pfm-admin-strong">{a.discipline}</div>
          <div className="pfm-admin-dim">
            {a.pool}m · {a.gender === "female" ? "Women" : "Men"} · {a.category}
          </div>
        </div>
      ),
    },
    {
      title: "Claimed time",
      dataIndex: "time",
      key: "time",
      render: (v) => <Tag color="green">{v}</Tag>,
    },
    {
      title: "Current record",
      key: "current",
      render: (_, a) =>
        a.currentRecord ? (
          <div>
            <Tag>{a.currentRecord.time}</Tag>
            <div className="pfm-admin-dim">{a.currentRecord.athlete}</div>
          </div>
        ) : (
          <Tag color="gold">none</Tag>
        ),
    },
    {
      title: "Proof",
      key: "proof",
      render: (_, a) => (
        <a href={a.proof_url} target="_blank" rel="noopener noreferrer">
          Results <FiExternalLink />
        </a>
      ),
    },
    {
      title: "Submitted",
      dataIndex: "created_at",
      key: "created_at",
      render: (v) => new Date(v).toLocaleDateString(),
    },
    ...(status === "pending"
      ? [
          {
            title: "Actions",
            key: "actions",
            render: (_, a) => (
              <div className="pfm-admin-actions">
                <Popconfirm
                  title="Approve and replace the current record?"
                  onConfirm={() => act.mutate({ id: a.id, action: "approve" })}
                >
                  <Button type="primary" size="small">Approve</Button>
                </Popconfirm>
                <Popconfirm
                  title="Deny this application?"
                  onConfirm={() => act.mutate({ id: a.id, action: "deny" })}
                >
                  <Button danger size="small">Deny</Button>
                </Popconfirm>
              </div>
            ),
          },
        ]
      : []),
  ];

  if (me.isLoading) return null;

  return (
    <div className="pfm-admin pt-24">
      <div className="pfm-admin-inner max-w-6xl mx-auto px-4 md:px-6">
        <div className="pfm-admin-head">
          <h1 className="pfm-admin-title">Record applications</h1>
          <div className="pfm-admin-head-actions">
            <Button icon={<FiUserPlus />} onClick={() => setAddOpen(true)}>Add admin</Button>
            <Button icon={<FiLogOut />} onClick={() => logout.mutate()}>Log out</Button>
          </div>
        </div>

        <Tabs
          activeKey={status}
          onChange={setStatus}
          items={STATUS_TABS.map((s) => ({ key: s, label: s[0].toUpperCase() + s.slice(1) }))}
        />

        <Table
          rowKey="id"
          columns={columns}
          dataSource={apps.data ?? []}
          loading={apps.isLoading}
          pagination={{ pageSize: 10 }}
          className="pfm-admin-table"
        />

        <Modal
          title="Add admin"
          open={addOpen}
          onCancel={() => setAddOpen(false)}
          onOk={() => addForm.submit()}
          confirmLoading={addAdmin.isPending}
        >
          <Form form={addForm} layout="vertical" onFinish={(v) => addAdmin.mutate(v)}>
            <Form.Item name="username" label="Username" rules={[{ required: true, min: 3 }]}>
              <Input />
            </Form.Item>
            <Form.Item name="password" label="Password (min 10 chars)" rules={[{ required: true, min: 10 }]}>
              <Input.Password />
            </Form.Item>
            {addAdmin.isError && (
              <Alert type="error" showIcon message={addAdmin.error?.message} />
            )}
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default AdminApplications;
```

- [ ] **Step 3: `src/pages/Admin/admin.css`**

```css
/* src/pages/Admin/admin.css */
.pfm-admin {
  min-height: 80vh;
  padding-bottom: 60px;
}

.pfm-admin-login-wrap {
  max-width: 380px;
  margin: 8vh auto 0;
  padding: 0 16px;
}

.pfm-admin-card {
  border-radius: 22px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(14px);
}

.pfm-admin-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.94);
  margin-bottom: 16px;
}

.pfm-admin-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 8px;
}

.pfm-admin-head-actions { display: flex; gap: 10px; }

.pfm-admin-strong { color: rgba(255, 255, 255, 0.92); font-weight: 600; }
.pfm-admin-dim { color: rgba(255, 255, 255, 0.6); font-size: 0.85rem; }
.pfm-admin-actions { display: flex; gap: 8px; }
.pfm-admin-error { margin-bottom: 14px; }
```

- [ ] **Step 4: Routes** — in `src/routes.jsx` add imports and children:

```js
import AdminLogin from "./pages/Admin/AdminLogin.jsx";
import AdminApplications from "./pages/Admin/AdminApplications.jsx";
```
```js
// ADMIN (not linked from navigation)
{ path: "admin", element: <AdminLogin /> },
{ path: "admin/applications", element: <AdminApplications /> },
```

- [ ] **Step 5: Verify** — lint clean. In the browser: `/admin` logs in with dev credentials (`admin` / `admin12345` in memory mode); `/admin/applications` redirects to `/admin` when logged out; pending application from Task 10 appears with current-record comparison; Approve updates `/swimming/records`; Deny works; Add admin works; Log out redirects.

---

### Task 12: DEPLOYMENT.md + final verification

**Files:**
- Create: `DEPLOYMENT.md`

- [ ] **Step 1: Write `DEPLOYMENT.md`** — Railway guide:

```markdown
# Deploying PFM-MK to Railway

The app is one Node service (API + static site) plus a PostgreSQL database.

## 1. Create the project
1. https://railway.app → New Project → **Deploy from GitHub repo** (or `railway init` with the CLI).
2. In the project: **+ New → Database → PostgreSQL**.

## 2. Configure the service
Settings → Build & Deploy:
- Build command: `npm install && npm run build`
- Start command: `npm run start:server`

Variables (service → Variables):
- `DATABASE_URL` → click "Add reference" and pick the Postgres `DATABASE_URL`
- `JWT_SECRET` → long random string (e.g. `openssl rand -hex 32`)
- `NODE_ENV` → `production`
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` → first admin account (password ≥ 10 chars)

## 3. Initialize the database (one time)
With the Railway CLI (`npm i -g @railway/cli`, `railway login`, `railway link`):
```
railway run npm run db:migrate
railway run npm run db:seed-records
railway run npm run db:seed-admin
```

## 4. Done
- Site: the service's public URL
- Admin panel: `<url>/admin`
- Re-deploys run automatically on push; the database persists.

## Local development
- `npm run dev:server` (API on :3001) + `npm run dev` (site on :5173).
- Without `DATABASE_URL` in `.env`, the API uses a TEMPORARY in-memory database
  (dev login: admin / admin12345). Data disappears on restart.
- To develop against the real database, paste the Railway `DATABASE_URL` into `.env`.
```

- [ ] **Step 2: Full verification**
- `npm run test:server` → all green.
- `npm run lint` → clean.
- `npm run build` → succeeds.
- Manual flow in browser (dev mode): submit application → admin login → approve → `/swimming/records` shows the new record + holder; deny flow; auth guard redirect.
- `git status` → changes uncommitted; `git log -1` unchanged.
