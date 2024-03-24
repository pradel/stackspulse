import type {
  Action,
  ActionData,
  ActionDataAddLiquidity,
  ActionDataRemoveLiquidity,
  ActionDataStackingDAODeposit,
  ActionDataStackingDAOWithdraw,
  ActionDataSwap,
} from "@/lib/actions";
import type { Protocol } from "@/lib/protocols";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { blob, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const transactionTable = sqliteTable("transaction", {
  /**
   * The transaction ID on the blockchain.
   */
  txId: text("txId").primaryKey(),
  /**
   * The protocol that the transaction belongs to.
   */
  protocol: text("protocol").$type<Protocol>().notNull(),
  /**
   * The action that the transaction is performing.
   */
  action: text("action").$type<Action>().notNull(),
  /**
   * The Stacks height of the block that the transaction is in.
   */
  blockHeight: blob("blockHeight", { mode: "bigint" }).notNull(),
  /**
   * The timestamp of the transaction.
   */
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull(),
  /**
   * Sender address of the transaction.
   */
  sender: text("sender").notNull(),
  /**
   * The JSON normalized transaction data.
   */
  data: blob("json", { mode: "json" }).$type<ActionData>().notNull(),
});

export type InsertTransaction = InferInsertModel<typeof transactionTable>;
export type SelectTransaction = InferSelectModel<typeof transactionTable>;

export type SelectTransactionActionSwapTyped = SelectTransaction & {
  action: "swap";
  data: ActionDataSwap;
};
export type SelectTransactionActionAddLiquidityTyped = SelectTransaction & {
  action: "add-liquidity";
  data: ActionDataAddLiquidity;
};
export type SelectTransactionActionRemoveLiquidityTyped = SelectTransaction & {
  action: "remove-liquidity";
  data: ActionDataRemoveLiquidity;
};

/**
 * StackingDAO
 */
export type SelectTransactionActionStackingDAODeposit = SelectTransaction & {
  action: "stackingdao-deposit";
  data: ActionDataStackingDAODeposit;
};
export type SelectTransactionActionStackingDAOWithdraw = SelectTransaction & {
  action: "stackingdao-withdraw";
  data: ActionDataStackingDAOWithdraw;
};

export type SelectTransactionTyped =
  | SelectTransactionActionSwapTyped
  | SelectTransactionActionAddLiquidityTyped
  | SelectTransactionActionRemoveLiquidityTyped
  | SelectTransactionActionStackingDAODeposit
  | SelectTransactionActionStackingDAOWithdraw;

export const tokenTable = sqliteTable("token", {
  /**
   * The asset class identifier of the token.
   */
  id: text("id").primaryKey(),
  /**
   * The symbol of the token.
   */
  symbol: text("symbol").notNull(),
  /**
   * The number of decimals of the token.
   */
  decimals: integer("decimals", { mode: "number" }).notNull(),
});

export type InsertToken = InferInsertModel<typeof tokenTable>;
export type SelectToken = InferSelectModel<typeof tokenTable>;
