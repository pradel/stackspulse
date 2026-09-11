import { pgTable, primaryKey } from "drizzle-orm/pg-core";

export const depositTable = pgTable(
  "deposit",
  (table) => ({
    txId: table.text("tx_id").notNull(),
    chainId: table.bigint("chain_id", { mode: "bigint" }).notNull(),
    eventIndex: table.integer("event_index").notNull(),
    contractId: table.text("contract_id").notNull(),
    stacker: table.text("stacker").notNull(),
    stxAmount: table.bigint("stx_amount", { mode: "bigint" }),
    ststxAmount: table.bigint("ststx_amount", { mode: "bigint" }).notNull(),
    referrer: table.text("referrer"),
    pool: table.text("pool"),
    blockHeight: table.bigint("block_height", { mode: "bigint" }).notNull(),
    blockTime: table.bigint("block_time", { mode: "bigint" }).notNull(),
  }),
  (table) => [
    primaryKey({
      columns: [table.txId, table.chainId, table.eventIndex],
    }),
  ],
);

export type Deposit = typeof depositTable.$inferSelect;
export type InsertDeposit = typeof depositTable.$inferInsert;

export const withdrawTable = pgTable(
  "withdraw",
  (table) => ({
    txId: table.text("tx_id").notNull(),
    chainId: table.bigint("chain_id", { mode: "bigint" }).notNull(),
    eventIndex: table.integer("event_index").notNull(),
    contractId: table.text("contract_id").notNull(),
    action: table.text("action").notNull(),
    stacker: table.text("stacker").notNull(),
    nftId: table.bigint("nft_id", { mode: "bigint" }),
    ststxAmount: table.bigint("ststx_amount", { mode: "bigint" }).notNull(),
    stxAmount: table.bigint("stx_amount", { mode: "bigint" }),
    blockHeight: table.bigint("block_height", { mode: "bigint" }).notNull(),
    blockTime: table.bigint("block_time", { mode: "bigint" }).notNull(),
  }),
  (table) => [
    primaryKey({
      columns: [table.txId, table.chainId, table.eventIndex],
    }),
  ],
);

export type Withdraw = typeof withdrawTable.$inferSelect;
export type InsertWithdraw = typeof withdrawTable.$inferInsert;
