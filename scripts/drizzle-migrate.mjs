import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

const client = createClient({
  url: process.env.DATABASE_PATH,
});

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
