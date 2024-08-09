import { type Icon, IconMinus, IconPlus } from "@tabler/icons-react";
import type { Protocol } from "./protocols";

export const actions = [
  // common
  "swap",
  "add-liquidity",
  "remove-liquidity",
  // StackingDAO
  "stackingdao-deposit",
  "stackingdao-withdraw",
] as const;

export type Action = (typeof actions)[number];

export const isAction = (value: string): value is Action =>
  actions.includes(value as Action);

export const actionInfo: {
  [key in Action]: { label: string; icon?: Icon };
} = {
  swap: {
    label: "Swap",
  },
  "add-liquidity": {
    label: "Liquidity",
    icon: IconPlus,
  },
  "remove-liquidity": {
    label: "Liquidity",
    icon: IconMinus,
  },
  /**
   * StackingDAO
   */
  "stackingdao-deposit": {
    label: "Deposit",
  },
  "stackingdao-withdraw": {
    label: "Withdraw",
  },
} as const;

export const protocolsActions: {
  [key in Protocol]: Action[];
} = {
  alex: ["swap"],
  arkadiko: ["swap", "add-liquidity", "remove-liquidity"],
  bitflow: ["swap"],
  stackingdao: ["stackingdao-deposit", "stackingdao-withdraw"],
  stackswap: ["swap"],
  velar: ["swap"],
  zest: [],
} as const;
