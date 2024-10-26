import type { ContractCallTransaction } from "@stacks/stacks-blockchain-api-types";
import type { Protocol } from "@stackspulse/protocols";

/**
 * `/api/protocols/users`
 */

export type ProtocolUsersRouteResponse = {
  protocol_name: Protocol;
  unique_senders: number;
}[];

export type ProtocolUsersRouteQuery = {
  /**
   * Date range to query
   */
  date: "7d" | "30d" | "all";
  /**
   * Limit the number of results returned, defaults to 10
   * Minimum: 1
   * Maximum: 100
   */
  limit?: number;
};

/**
 * `/api/transactions`
 */

export type TransactionsRouteResponse = (ContractCallTransaction & {
  protocol: Protocol;
})[];

/**
 * `/api/transactions/stats`
 */

export type TransactionStatsRouteResponse = {
  count: number;
  unique_senders: number;
};

export type TransactionStatsRouteQuery = {
  protocol?: Protocol;
};

/**
 * `/api/protocols/stackingdao`
 */

export type StackingDAOProtocolStatsResponse = {
  month: string;
  deposits: number;
  withdrawals: number;
}[];

/**
 * `/api/tokens/holders`
 */

export type TokensHoldersRouteResponse = {
  total_supply: string;
  total: number;
  results: {
    address: string;
    balance: string;
  }[];
};

/**
 * `/api/tokens/transaction-volume`
 */

export type TokensTransactionVolumeRouteResponse = {
  date: string;
  daily_volume: string;
}[];

/**
 * `/api/tokens/markets`
 */

type CoingeckoCoinsMarketsResponse = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price?: number;
  market_cap?: number;
  price_change_percentage_24h?: number;
}[];

export type TokensMarketsRouteResponse = CoingeckoCoinsMarketsResponse;

/**
 * `/api/tokens/resolve`
 */

type CoingeckoCoinsIdResponse = {
  id: string;
  symbol: string;
  name: string;
  contract_address: string;
};

export type TokensResolveRouteResponse = CoingeckoCoinsIdResponse;
