import { env } from "@/env";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Postgres.js doesn't support the schema public parameter
const databaseUrl = env.DATABASE_URL.replace("?schema=public", "");

export const sql = postgres(databaseUrl);
export const dbPg = drizzle(sql, {
  schema,
});
