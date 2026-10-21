import { pgTable, primaryKey } from "drizzle-orm/pg-core";

/** StackingDAO liquid stacking tokens. stSTX and stSTXbtc stake STX; stBTC stakes sBTC. */
export type LiquidStackingToken = "ststx" | "ststxbtc" | "stbtc";

/**
 * Mints of a liquid stacking token. `underlying_amount` is the STX (stSTX,
 * stSTXbtc) or sBTC (stBTC) deposited, `token_amount` the token minted.
 */
export const depositTable = pgTable(
  "deposit",
  (table) => ({
    txId: table.text("tx_id").notNull(),
    chainId: table.bigint("chain_id", { mode: "bigint" }).notNull(),
    eventIndex: table.integer("event_index").notNull(),
    contractId: table.text("contract_id").notNull(),
    token: table.text("token").$type<LiquidStackingToken>().notNull(),
    stacker: table.text("stacker").notNull(),
    underlyingAmount: table.bigint("underlying_amount", { mode: "bigint" }),
    tokenAmount: table.bigint("token_amount", { mode: "bigint" }).notNull(),
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

/**
 * Withdrawal steps of a liquid stacking token: `init-withdraw` locks
 * `token_amount`, `cancel-withdraw` unlocks it, `withdraw` and
 * `withdraw-idle` burn it. `underlying_amount` is gross, before the fee;
 * `underlying_user_amount` is paid to the user and `fee_amount` to the protocol.
 */
export const withdrawTable = pgTable(
  "withdraw",
  (table) => ({
    txId: table.text("tx_id").notNull(),
    chainId: table.bigint("chain_id", { mode: "bigint" }).notNull(),
    eventIndex: table.integer("event_index").notNull(),
    contractId: table.text("contract_id").notNull(),
    token: table.text("token").$type<LiquidStackingToken>().notNull(),
    action: table.text("action").notNull(),
    stacker: table.text("stacker").notNull(),
    nftId: table.bigint("nft_id", { mode: "bigint" }),
    tokenAmount: table.bigint("token_amount", { mode: "bigint" }).notNull(),
    underlyingAmount: table.bigint("underlying_amount", { mode: "bigint" }),
    underlyingUserAmount: table.bigint("underlying_user_amount", { mode: "bigint" }),
    feeAmount: table.bigint("fee_amount", { mode: "bigint" }),
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

/**
 * stSTX ⇄ stSTXbtc swaps: one token is burned and the other minted.
 * `swap-ststx-for-ststxbtc` burns `ststx_amount` and mints `ststxbtc_amount`;
 * `swap-ststxbtc-for-ststx` the reverse.
 */
export const swapTable = pgTable(
  "swap",
  (table) => ({
    txId: table.text("tx_id").notNull(),
    chainId: table.bigint("chain_id", { mode: "bigint" }).notNull(),
    eventIndex: table.integer("event_index").notNull(),
    contractId: table.text("contract_id").notNull(),
    action: table.text("action").notNull(),
    user: table.text("user").notNull(),
    ststxAmount: table.bigint("ststx_amount", { mode: "bigint" }).notNull(),
    ststxbtcAmount: table.bigint("ststxbtc_amount", { mode: "bigint" }).notNull(),
    blockHeight: table.bigint("block_height", { mode: "bigint" }).notNull(),
    blockTime: table.bigint("block_time", { mode: "bigint" }).notNull(),
  }),
  (table) => [
    primaryKey({
      columns: [table.txId, table.chainId, table.eventIndex],
    }),
  ],
);

export type Swap = typeof swapTable.$inferSelect;
export type InsertSwap = typeof swapTable.$inferInsert;
