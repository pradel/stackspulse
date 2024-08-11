import type { TransactionStatus } from "@stacks/stacks-blockchain-api-types";
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
 * `/api/transactions`
 */

export type TransactionsRouteResponse = {
  protocol: string;
  tx_id: string;
  sender_address: string;
  tx_status: TransactionStatus;
  contract_call_contract_id: string;
  contract_call_function_name: string;
  block_height: number;
  block_time: number;
}[];

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
