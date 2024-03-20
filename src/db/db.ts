import { env } from "@/env";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
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

export const sqlite = new Database(env.DATABASE_PATH);
export const db = drizzle(sqlite, {
  schema,
  // Enable to log all queries for debugging
  // logger: new QueryLogger()
});
