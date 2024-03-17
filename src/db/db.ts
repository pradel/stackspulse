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

export const sqlite = new Database(env.DATABASE_PATH);
export const db = drizzle(sqlite, { schema });
