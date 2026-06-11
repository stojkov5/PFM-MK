// server/db/seed-records.js
import "dotenv/config";
import { createPrisma } from "./client.js";
import { loadRecordsFromJson } from "./records-data.js";

const db = createPrisma();
const rows = loadRecordsFromJson();
const result = await db.record.createMany({
  data: rows,
  skipDuplicates: true,
});
console.log(`Seeded ${result.count} of ${rows.length} records (existing rows left untouched).`);
await db.$disconnect();
