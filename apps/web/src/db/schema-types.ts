import type {
  InsertTransactionDrizzle,
  SelectTransactionDrizzle,
} from "./schema";

export type ActionData =
  | ActionDataSwap
  | ActionDataAddLiquidity
  | ActionDataRemoveLiquidity
  | ActionDataStackingDAODeposit
  | ActionDataStackingDAOWithdraw;

/**
 * Swap
 */

export interface ActionDataSwap {
  inAmount: bigint;
  inToken: string;
  outAmount: bigint;
  outToken: string;
}

export type InsertTransactionActionSwap = InsertTransactionDrizzle & {
  action: "swap";
  data: ActionDataSwap;
};
export type SelectTransactionActionSwap = SelectTransactionDrizzle & {
  action: "swap";
  data: ActionDataSwap;
};

/**
 * Add Liquidity
 */

export interface ActionDataAddLiquidity {
  tokenX: string;
  tokenY: string;
}

export type InsertTransactionActionAddLiquidity = InsertTransactionDrizzle & {
  action: "add-liquidity";
  data: ActionDataAddLiquidity;
};

export type SelectTransactionActionAddLiquidity = SelectTransactionDrizzle & {
  action: "add-liquidity";
  data: ActionDataAddLiquidity;
};

/**
 * Remove Liquidity
 */

export interface ActionDataRemoveLiquidity {
  tokenX: string;
  tokenY: string;
}

export type InsertTransactionActionRemoveLiquidity =
  InsertTransactionDrizzle & {
    action: "remove-liquidity";
    data: ActionDataRemoveLiquidity;
  };

export type SelectTransactionActionRemoveLiquidity =
  SelectTransactionDrizzle & {
    action: "remove-liquidity";
    data: ActionDataRemoveLiquidity;
  };

/**
 * StackingDAO Deposit
 */

export interface ActionDataStackingDAODeposit {
  // in always STX
  outAmount: bigint;
  outToken: string;
  // out always stSTX
  inAmount: bigint;
  inToken: string;
}

export type InsertTransactionActionStackingDAODeposit =
  InsertTransactionDrizzle & {
    action: "stackingdao-deposit";
    data: ActionDataStackingDAODeposit;
  };

export type SelectTransactionActionStackingDAODeposit =
  SelectTransactionDrizzle & {
    action: "stackingdao-deposit";
    data: ActionDataStackingDAODeposit;
  };

/**
 * StackingDAO Withdraw
 */

export interface ActionDataStackingDAOWithdraw {
  // out always stSTX
  outAmount: bigint;
  outToken: string;
  // in always STX
  inAmount: bigint;
  inToken: string;
}

export type InsertTransactionActionStackingDAOWithdraw =
  InsertTransactionDrizzle & {
    action: "stackingdao-withdraw";
    data: ActionDataStackingDAOWithdraw;
  };

export type SelectTransactionActionStackingDAOWithdraw =
  SelectTransactionDrizzle & {
    action: "stackingdao-withdraw";
    data: ActionDataStackingDAOWithdraw;
  };

export type InsertTransaction =
  | InsertTransactionActionSwap
  | InsertTransactionActionAddLiquidity
  | InsertTransactionActionRemoveLiquidity
  | InsertTransactionActionStackingDAODeposit
  | InsertTransactionActionStackingDAOWithdraw;

export type SelectTransaction =
  | SelectTransactionActionSwap
  | SelectTransactionActionAddLiquidity
  | SelectTransactionActionRemoveLiquidity
  | SelectTransactionActionStackingDAODeposit
  | SelectTransactionActionStackingDAOWithdraw;

export type SelectTransactionActionRemoveLiquidityTyped =
  SelectTransactionDrizzle & {
    action: "remove-liquidity";
    data: ActionDataRemoveLiquidity;
  };

/**
 * StackingDAO
 */
export type SelectTransactionActionStackingDAODepositTyped =
  SelectTransactionDrizzle & {
    action: "stackingdao-deposit";
    data: ActionDataStackingDAODeposit;
  };
export type SelectTransactionActionStackingDAOWithdrawTyped =
  SelectTransactionDrizzle & {
    action: "stackingdao-withdraw";
    data: ActionDataStackingDAOWithdraw;
  };
