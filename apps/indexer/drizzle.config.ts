import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/schema.ts",
  dialect: "postgresql",
  driver: "pglite",
  dbCredentials: {
    url: "./data/app.db",
  },
});
