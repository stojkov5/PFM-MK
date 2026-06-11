// server/db/records-data.js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const loadRecordsFromJson = () => {
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
