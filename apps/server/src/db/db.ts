import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "~/env";
import * as schema from "./schema";

// Postgres.js doesn't support the schema public parameter
const databaseUrl = env.DATABASE_URL.replace("?schema=public", "");

export const sql = postgres(databaseUrl);
export const db = drizzle(sql, {
  schema,
});
