import { readFileSync } from "node:fs";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}
const parsed = new URL(url);
parsed.searchParams.delete("channel_binding");
const sql = postgres(parsed.toString(), { max: 1, prepare: false, onnotice: () => {} });
await sql.unsafe(readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8"));
await sql.end();
console.log("Database schema is up to date");
