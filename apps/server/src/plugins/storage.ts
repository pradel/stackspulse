import { createDatabase } from "db0";
import sqlite from "db0/connectors/better-sqlite3";
import dbDriver from "unstorage/drivers/db0";
import { env } from "~/env";

export default defineNitroPlugin(async () => {
  const storage = useStorage();

  const database = createDatabase(
    sqlite({
      path: env.TURSO_DATABASE_URL,
    }),
  );

  const driver = dbDriver({
    database,
  });

  storage.mount("api", driver);
});
