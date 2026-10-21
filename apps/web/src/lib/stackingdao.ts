import type { StackingDAOToken } from "./api";

/** Display name, staked asset and decimals (shared by the token and its asset). */
export const stackingDAOTokens: Record<
  StackingDAOToken,
  { name: string; underlying: string; decimals: number }
> = {
  ststx: { name: "stSTX", underlying: "STX", decimals: 6 },
  ststxbtc: { name: "stSTXbtc", underlying: "STX", decimals: 6 },
  stbtc: { name: "stBTC", underlying: "sBTC", decimals: 8 },
};

/** Converts a base-unit integer string to a number in whole units, for charts. */
export const toUnits = (amount: string, decimals: number) => Number(amount) / 10 ** decimals;

/** `2026-01-01` → `2026-01` for monthly periods. */
export const monthLabel = (period: string) => period.slice(0, 7);
