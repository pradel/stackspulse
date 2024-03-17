import sqlite from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

const client = sqlite(process.env.DATABASE_PATH);

// use sqlite pragma. recommended from https://cj.rs/blog/sqlite-pragma-cheatsheet-for-performance-and-consistency/
client.pragma("journal_mode=WAL"); // see https://github.com/WiseLibs/better-sqlite3/blob/master/docs/performance.md
client.pragma("synchronous=normal");

const db = drizzle(client);

async function main() {
  migrate(db, { migrationsFolder: "./drizzle" });
  console.info("Migrated successfully");
  process.exit(0);
}

main().catch((e) => {
  console.error("Migration failed");
  console.error(e);
  process.exit(1);
});
