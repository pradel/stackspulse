import type { Protocol } from "./protocols";

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
