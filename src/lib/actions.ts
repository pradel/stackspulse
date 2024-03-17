export const actions = ["swap", "add-liquidity", "remove-liquidity"] as const;

export type Action = (typeof actions)[number];

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
