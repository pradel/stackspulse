import { type Client, type Config, createClient } from "@libsql/client/web";
import { defineDriver } from "unstorage";

export type TursoDriverOptions =
  | {
      config: Config;
      table?: string;
    }
  | {
      client: Client;
      table?: string;
    };

export const unstorageTursoDriver = defineDriver(
  (options: TursoDriverOptions) => {
    options.table = options.table || "storage";

    const turso =
      "client" in options ? options.client : createClient(options.config);

    return {
      name: "turso-driver",
      options,
      /**
       * ! This function should run only once and not be called every time the server starts
       */
      async init() {
        await turso.execute(
          `CREATE TABLE IF NOT EXISTS ${options.table} (id TEXT NOT NULL PRIMARY KEY, value TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`,
        );
      },
      async hasItem() {
        throw new Error("Method not implemented.");
      },
      async getItem(key) {
        const res = await turso.execute({
          sql: `SELECT value FROM ${options.table} WHERE id=?;`,
          args: [key],
        });
        return res.rows[0]?.value ?? null;
      },
      async setItem(key, value, _opts) {
        await turso.execute({
          sql: `INSERT INTO ${options.table} (id, value) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET value = excluded.value;`,
          args: [key, value],
        });
      },
      async removeItem() {
        throw new Error("Method not implemented.");
      },
      async getKeys() {
        throw new Error("Method not implemented.");
      },
      async clear() {
        throw new Error("Method not implemented.");
      },
      async dispose() {
        throw new Error("Method not implemented.");
      },
      async watch() {
        throw new Error("Method not implemented.");
      },
    };
  },
);
