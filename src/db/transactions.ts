import type { Action } from "@/lib/actions";
import type { Protocol } from "@/lib/protocols";
import {
  and,
  asc,
  count,
  countDistinct,
  desc,
  eq,
  inArray,
  sql,
} from "drizzle-orm";
import { db } from "./db";
import {
  type SelectTokenDrizzle,
  tokenTable,
  transactionTable,
} from "./schema";
import type {
  SelectTransaction,
  SelectTransactionActionAddLiquidity,
  SelectTransactionActionRemoveLiquidity,
  SelectTransactionActionStackingDAODeposit,
  SelectTransactionActionStackingDAOWithdraw,
  SelectTransactionActionSwap,
} from "./schema-types";

export type SelectTransactionActionSwapWithTokens =
  SelectTransactionActionSwap & {
    inToken: SelectTokenDrizzle;
    outToken: SelectTokenDrizzle;
  };

export type SelectTransactionActionAddLiquidityWithTokens =
  SelectTransactionActionAddLiquidity & {
    tokenX: SelectTokenDrizzle;
    tokenY: SelectTokenDrizzle;
  };

export type SelectTransactionActionRemoveLiquidityWithTokens =
  SelectTransactionActionRemoveLiquidity & {
    tokenX: SelectTokenDrizzle;
    tokenY: SelectTokenDrizzle;
  };

export type SelectTransactionActionStackingDAODepositWithTokens =
  SelectTransactionActionStackingDAODeposit & {
    inToken: SelectTokenDrizzle;
    outToken: SelectTokenDrizzle;
  };

export type SelectTransactionActionStackingDAOWithdrawWithTokens =
  SelectTransactionActionStackingDAOWithdraw & {
    inToken: SelectTokenDrizzle;
    outToken: SelectTokenDrizzle;
  };

export type SelectTransactionAction =
  | SelectTransactionActionSwapWithTokens
  | SelectTransactionActionAddLiquidityWithTokens
  | SelectTransactionActionRemoveLiquidityWithTokens
  | SelectTransactionActionStackingDAODepositWithTokens
  | SelectTransactionActionStackingDAOWithdrawWithTokens;

export const getTransactions = async ({
  protocol,
  action,
}: { protocol?: Protocol; action?: Action } = {}): Promise<
  SelectTransactionAction[]
> => {
  const query = db
    .select()
    .from(transactionTable)
    .orderBy(desc(transactionTable.timestamp))
    .limit(50);

  if (protocol) {
    query.where(
      and(
        eq(transactionTable.protocol, protocol),
        action ? eq(transactionTable.action, action) : undefined,
      ),
    );
  }
  const transactions = (await query) as SelectTransaction[];

  // Extract unique token ids from transactions
  const tokenIds: string[] = [];
  for (const transaction of transactions) {
    if (transaction.action === "swap") {
      tokenIds.push(transaction.data.inToken, transaction.data.outToken);
    } else if (transaction.action === "add-liquidity") {
      tokenIds.push(transaction.data.tokenX, transaction.data.tokenY);
    } else if (transaction.action === "remove-liquidity") {
      tokenIds.push(transaction.data.tokenX, transaction.data.tokenY);
    } else if (transaction.action === "stackingdao-deposit") {
      tokenIds.push(transaction.data.inToken, transaction.data.outToken);
    } else if (transaction.action === "stackingdao-withdraw") {
      tokenIds.push(transaction.data.inToken, transaction.data.outToken);
    }
  }
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
    [id: string]: SelectTokenDrizzle;
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
    } else if (transaction.action === "stackingdao-deposit") {
      return {
        ...transaction,
        inToken: tokenMap[transaction.data.inToken],
        outToken: tokenMap[transaction.data.outToken],
      };
    } else if (transaction.action === "stackingdao-withdraw") {
      return {
        ...transaction,
        inToken: tokenMap[transaction.data.inToken],
        outToken: tokenMap[transaction.data.outToken],
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

export const getTransactionsUniqueSendersByMonth = async ({
  protocol,
}: {
  protocol: Protocol;
}) => {
  const query = db
    .select({
      protocol: transactionTable.protocol,
      month: sql<string>`strftime('%Y-%m', timestamp, 'unixepoch') as month`,
      uniqueSenders: countDistinct(transactionTable.sender),
    })
    .from(transactionTable)
    .where(eq(transactionTable.protocol, protocol))
    .groupBy(sql`month`)
    .orderBy(asc(transactionTable.timestamp));

  const stats = await query;
  return stats;
};
