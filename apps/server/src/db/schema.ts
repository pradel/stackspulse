import { pgTable, text } from "drizzle-orm/pg-core";

export const dapps = pgTable("dapps", {
  id: text("id").primaryKey(),
  contracts: text("contracts").array().notNull(),
});
