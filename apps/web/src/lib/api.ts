import type { Protocol } from "./protocols";

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
 * `/api/transactions/stats`
 */

export type TransactionStatsRouteResponse = {
  count: number;
  unique_senders: number;
};

export type TransactionStatsRouteQuery = {
  protocol?: Protocol;
};
