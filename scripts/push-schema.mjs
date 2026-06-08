// Applies the Prisma migration SQL to your Turso database without the Turso CLI.
//
// Usage (from the project root):
//   TURSO_DATABASE_URL="libsql://..." TURSO_AUTH_TOKEN="..." node scripts/push-schema.mjs
//
// Safe to re-run: the CREATE statements use IF NOT EXISTS where possible, but a
// fresh database is the expected case.
import { createClient } from "@libsql/client";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error("Missing TURSO_DATABASE_URL env var.");
  process.exit(1);
}

const migrationsDir = "prisma/migrations";
const dirs = readdirSync(migrationsDir)
  .filter((d) => /^\d/.test(d))
  .sort();

if (dirs.length === 0) {
  console.error("No migrations found in prisma/migrations.");
  process.exit(1);
}

const client = createClient({ url, authToken });

for (const dir of dirs) {
  const sql = readFileSync(path.join(migrationsDir, dir, "migration.sql"), "utf8");
  console.log(`Applying migration: ${dir}`);
  await client.executeMultiple(sql);
}

const tables = await client.execute(
  "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_litestream%' ORDER BY name"
);
console.log("\n✓ Done. Tables now in Turso:");
for (const row of tables.rows) console.log("  -", row.name);
