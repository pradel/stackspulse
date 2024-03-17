import type { Protocol } from "@/lib/protocols";
import { count, countDistinct, desc, eq, inArray } from "drizzle-orm";
import { db } from "./db";
import {
  type SelectToken,
  type SelectTransactionActionAddLiquidityTyped,
  type SelectTransactionActionRemoveLiquidityTyped,
  type SelectTransactionActionSwapTyped,
  type SelectTransactionTyped,
  tokenTable,
  transactionTable,
} from "./schema";

export type SelectTransactionActionSwap = SelectTransactionActionSwapTyped & {
  inToken: SelectToken;
  outToken: SelectToken;
};

export type SelectTransactionActionAddLiquidity =
  SelectTransactionActionAddLiquidityTyped & {
    tokenX: SelectToken;
    tokenY: SelectToken;
  };

export type SelectTransactionActionRemoveLiquidity =
  SelectTransactionActionRemoveLiquidityTyped & {
    tokenX: SelectToken;
    tokenY: SelectToken;
  };

export type SelectTransactionAction =
  | SelectTransactionActionSwap
  | SelectTransactionActionAddLiquidity
  | SelectTransactionActionRemoveLiquidity;

export const getTransactions = async ({
  protocol,
}: { protocol?: Protocol } = {}): Promise<SelectTransactionAction[]> => {
  const query = db
    .select()
    .from(transactionTable)
    .orderBy(desc(transactionTable.timestamp))
    .limit(100);
  if (protocol) {
    query.where(eq(transactionTable.protocol, protocol));
  }
  const transactions = (await query) as SelectTransactionTyped[];

  // Extract unique token ids from transactions
  const tokenIds: string[] = [];
  transactions.forEach((transaction) => {
    if (transaction.action === "swap") {
      tokenIds.push(transaction.data.inToken, transaction.data.outToken);
    } else if (transaction.action === "add-liquidity") {
      tokenIds.push(transaction.data.tokenX, transaction.data.tokenY);
    } else if (transaction.action === "remove-liquidity") {
      tokenIds.push(transaction.data.tokenX, transaction.data.tokenY);
    }
  });
  const uniqueTokenIds = Array.from(new Set([...tokenIds]));
  const tokens =
    uniqueTokenIds.length > 0
      ? await db
          .select()
          .from(tokenTable)
          .where(inArray(tokenTable.id, uniqueTokenIds))
      : [];

  // Map token ids to token objects for quick lookup
  const tokenMap = tokens.reduce<{
    [id: string]: SelectToken;
  }>((acc, token) => {
    acc[token.id] = token;
    return acc;
  }, {});

  // Assign token information to transactions
  const transactionsWithTokens = transactions.map((transaction) => {
    if (transaction.action === "swap") {
      return {
        ...transaction,
        inToken: tokenMap[transaction.data.inToken],
        outToken: tokenMap[transaction.data.outToken],
      };
    } else if (transaction.action === "add-liquidity") {
      return {
        ...transaction,
        tokenX: tokenMap[transaction.data.tokenX],
        tokenY: tokenMap[transaction.data.tokenY],
      };
    } else if (transaction.action === "remove-liquidity") {
      return {
        ...transaction,
        tokenX: tokenMap[transaction.data.tokenX],
        tokenY: tokenMap[transaction.data.tokenY],
      };
    }
    return transaction;
  });

  return transactionsWithTokens;
};

export const getTransactionsStats = async ({
  protocol,
}: { protocol?: Protocol } = {}): Promise<{
  count: number;
  uniqueSenders: number;
}> => {
  const query = db
    .select({
      count: count(transactionTable.txId),
      uniqueSenders: countDistinct(transactionTable.sender),
    })
    .from(transactionTable);
  if (protocol) {
    query.where(eq(transactionTable.protocol, protocol));
  }

  const transactions = await query;
  const stats = transactions[0];
  return stats;
};
