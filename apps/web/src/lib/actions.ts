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
  // Zest
  "withdraw",
  "supply",
  "repay",
  "borrow",
  "set-user-use-reserve-as-collateral",
  "borrow-call",
  "repay-call",
  "supply-call",
  "withdraw-call",
  "set-user-use-reserve-as-collateral-call",
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
  /**
   * Zest
   */
  withdraw: {
    label: "Withdraw",
  },
  supply: {
    label: "Supply",
  },
  repay: {
    label: "Repay",
  },
  borrow: {
    label: "Borrow",
  },
  "set-user-use-reserve-as-collateral": {
    label: "Flag Collateral",
  },
  "borrow-call": {
    label: "Borrow",
  },
  "repay-call": {
    label: "Repay",
  },
  "supply-call": {
    label: "Supply",
  },
  "withdraw-call": {
    label: "Withdraw",
  },
  "set-user-use-reserve-as-collateral-call": {
    label: "Flag Collateral",
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
  zest: [
    "withdraw",
    "supply",
    "repay",
    "borrow",
    "set-user-use-reserve-as-collateral",
    "borrow-call",
    "repay-call",
    "supply-call",
    "withdraw-call",
    "set-user-use-reserve-as-collateral-call",
  ],
} as const;
