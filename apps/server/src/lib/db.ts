import { env } from "@/env";
import postgres from "postgres";

// Postgres.js doesn't support the schema public parameter
const databaseUrl = env.DATABASE_URL.replace("?schema=public", "");

export const sql = postgres(databaseUrl);
