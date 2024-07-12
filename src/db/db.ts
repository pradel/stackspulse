import { env } from "@/env";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import postgres from "postgres";
import * as schema from "./schema";

// Patch BigInt to be JSON serializable
// for drizzle-orm to insert BigInts properly
// @ts-expect-error - patching global BigInt
BigInt.prototype.toJSON = function () {
  return this.toString();
};

// class QueryLogger implements Logger {
//   logQuery(query: string, params: unknown[]): void {
//     console.debug("___QUERY___");
//     console.debug(query);
//     console.debug(params);
//     console.debug("___END_QUERY___");
//   }
// }

export const sqlite = createClient({ url: env.DATABASE_PATH });
export const db = drizzle(sqlite, {
  schema,
  // Enable to log all queries for debugging
  // logger: new QueryLogger()
});

// Postgres.js doesn't support the schema public parameter
const databaseUrl = env.DATABASE_URL.replace("?schema=public", "");

export const sql = postgres(databaseUrl);
