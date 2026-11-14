import "server-only";
import postgres from "postgres";

declare global {
  var cerimoniariosSql: postgres.Sql | undefined;
}

function connectionString() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const parsed = new URL(url);
  parsed.searchParams.delete("channel_binding");
  return parsed.toString();
}

function createClient() {
  return postgres(connectionString(), {
    max: Number(process.env.DB_POOL_SIZE ?? 5),
    idle_timeout: 20,
    prepare: false,
  });
}

export function db() {
  globalThis.cerimoniariosSql ??= createClient();
  return globalThis.cerimoniariosSql;
}
