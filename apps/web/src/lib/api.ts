import { env } from "@/env";
import type { ContractCallTransaction } from "@stacks/stacks-blockchain-api-types";
import type { Protocol } from "@stackspulse/protocols";

/**
 * GETs a route of the stackspulse API, failing on a non-2xx response so
 * error boundaries catch it instead of rendering an error body.
 */
export const fetchApi = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`);
  if (!response.ok) {
    throw new Error(`GET ${path} failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
};

/**
 * `/api/protocols/users`
 */

export type ProtocolUsersRouteResponse = {
  protocol_name: Protocol;
  unique_senders: number;
}[];

export type ProtocolUsersRouteQuery = {
  mode?: "direct" | "nested";
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
 * StackingDAO routes. Amounts are integer strings in base units: STX and the
 * liquid tokens have 6 decimals, sBTC and stBTC 8. Periods are the UTC start
 * date (`YYYY-MM-DD`) of the interval. `asOfBlock` is the block through which
 * every event is indexed.
 */

export type StackingDAOToken = "ststx" | "ststxbtc" | "stbtc";

export type StackingDAOInterval = "day" | "week" | "month";

/** `/stackingdao/stats` */
export type StackingDAOStatsResponse = {
  asOfBlock: number | null;
  tokens: {
    token: StackingDAOToken;
    deposits: number;
    stakers: number;
    deposited: string;
    withdrawn: string;
    minted: string;
    burned: string;
  }[];
};

/** `/stackingdao/flows` */
export type StackingDAOFlowsResponse = {
  asOfBlock: number | null;
  interval: StackingDAOInterval;
  points: {
    period: string;
    token: StackingDAOToken;
    deposited: string;
    withdrawn: string;
    minted: string;
    burned: string;
  }[];
};

/** `/stackingdao/stakers` */
export type StackingDAOStakersResponse = {
  asOfBlock: number | null;
  interval: StackingDAOInterval;
  points: { period: string; stakers: number; newStakers: number }[];
};

/** `/stackingdao/yield` */
export type StackingDAOYieldResponse = {
  asOfBlock: number | null;
  token: "ststx" | "stbtc";
  interval: StackingDAOInterval;
  apy: number | null;
  points: { period: string; rate: number }[];
};

/** `/stackingdao/withdrawals` */
export type StackingDAOWithdrawalsResponse = {
  asOfBlock: number | null;
  interval: StackingDAOInterval;
  points: {
    period: string;
    token: StackingDAOToken;
    instantCount: number;
    instantAmount: string;
    standardCount: number;
    standardAmount: string;
    feeAmount: string;
  }[];
};

export type StackingDAOSwapAction = "swap-ststx-for-ststxbtc" | "swap-ststxbtc-for-ststx";

/** `/stackingdao/swaps` */
export type StackingDAOSwapsResponse = {
  asOfBlock: number | null;
  interval: StackingDAOInterval;
  points: {
    period: string;
    action: StackingDAOSwapAction;
    count: number;
    ststxAmount: string;
    ststxbtcAmount: string;
  }[];
};

type StackingDAOActivityBase = {
  txId: string;
  eventIndex: number;
  blockHeight: number;
  blockTime: number;
  address: string;
};

export type StackingDAOActivityItem =
  | (StackingDAOActivityBase & {
      kind: "deposit";
      token: StackingDAOToken;
      tokenAmount: string;
      underlyingAmount: string | null;
    })
  | (StackingDAOActivityBase & {
      kind: "withdraw";
      action: "init-withdraw" | "cancel-withdraw" | "withdraw" | "withdraw-idle";
      token: StackingDAOToken;
      tokenAmount: string;
      underlyingAmount: string | null;
    })
  | (StackingDAOActivityBase & {
      kind: "swap";
      action: StackingDAOSwapAction;
      ststxAmount: string;
      ststxbtcAmount: string;
    });

/** `/stackingdao/activity` */
export type StackingDAOActivityResponse = {
  asOfBlock: number | null;
  items: StackingDAOActivityItem[];
  nextCursor: string | null;
};

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
