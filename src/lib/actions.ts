import { IconMinus, IconPlus } from "@tabler/icons-react";
import type { Protocol } from "./protocols";

export const actions = ["swap", "add-liquidity", "remove-liquidity"] as const;

export type Action = (typeof actions)[number];

export const isAction = (value: string): value is Action =>
  actions.includes(value as Action);

export interface ActionDataSwap {
  inAmount: bigint;
  inToken: string;
  outAmount: bigint;
  outToken: string;
}

export interface ActionDataAddLiquidity {
  tokenX: string;
  tokenY: string;
}

export interface ActionDataRemoveLiquidity {
  tokenX: string;
  tokenY: string;
}

export type ActionData =
  | ActionDataSwap
  | ActionDataAddLiquidity
  | ActionDataRemoveLiquidity;

export const actionInfo: {
  [key in Action]: { label: string; icon?: any };
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
} as const;

export const protocolsActions: {
  [key in Protocol]: Action[];
} = {
  alex: ["swap"],
  arkadiko: ["swap", "add-liquidity", "remove-liquidity"],
  stackswap: ["swap"],
} as const;
