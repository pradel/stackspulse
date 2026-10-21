import { Schema, SchemaGetter } from "effect";

/*
 * StackingDAO prints, decoded into one shape per kind of flow.
 *
 * "Underlying" is the asset staked: STX for stSTX and stSTXbtc, sBTC for
 * stBTC. On withdrawals `underlyingAmount` is the gross amount, before the
 * protocol fee; `underlyingUserAmount` is what the user receives and
 * `feeAmount` the protocol fee (`null` when the contract does not print them).
 * Deposits mint `tokenAmount`; `withdraw` and `withdraw-idle` burn it, while
 * `init-withdraw` and `cancel-withdraw` only lock and unlock it.
 */

const DepositLog = Schema.Struct({
  kind: Schema.Literal("deposit"),
  stacker: Schema.String,
  underlyingAmount: Schema.NullOr(Schema.BigInt),
  tokenAmount: Schema.BigInt,
  referrer: Schema.NullOr(Schema.String),
  pool: Schema.NullOr(Schema.String),
});

export type DepositLog = typeof DepositLog.Type;

const WithdrawAction = Schema.Literals([
  "init-withdraw",
  "cancel-withdraw",
  "withdraw",
  "withdraw-idle",
]);

const WithdrawLog = Schema.Struct({
  kind: Schema.Literal("withdraw"),
  action: WithdrawAction,
  stacker: Schema.String,
  nftId: Schema.NullOr(Schema.BigInt),
  tokenAmount: Schema.BigInt,
  underlyingAmount: Schema.NullOr(Schema.BigInt),
  underlyingUserAmount: Schema.NullOr(Schema.BigInt),
  feeAmount: Schema.NullOr(Schema.BigInt),
});

export type WithdrawLog = typeof WithdrawLog.Type;

/** A deposit or withdrawal of a liquid stacking token. */
export type LstLog = DepositLog | WithdrawLog;

const SwapLog = Schema.Struct({
  kind: Schema.Literal("swap"),
  action: Schema.Literals(["swap-ststx-for-ststxbtc", "swap-ststxbtc-for-ststx"]),
  user: Schema.String,
  ststxAmount: Schema.BigInt,
  ststxbtcAmount: Schema.BigInt,
});

export type SwapLog = typeof SwapLog.Type;

/** Decode-only: prints are never encoded back. */
const decodeInto =
  <To extends Schema.Top>(to: To) =>
  <From extends Schema.Top>(from: From, decode: (raw: From["Type"]) => To["Encoded"]) =>
    from.pipe(
      Schema.decodeTo(to, {
        decode: SchemaGetter.transform(decode),
        encode: SchemaGetter.forbiddenEncoding,
      }),
    );

const toDeposit = decodeInto(DepositLog);
const toWithdraw = decodeInto(WithdrawLog);

const withdrawLog = (
  log: Pick<WithdrawLog, "action" | "stacker" | "tokenAmount"> &
    Partial<Pick<WithdrawLog, "nftId" | "underlyingAmount" | "underlyingUserAmount" | "feeAmount">>,
): WithdrawLog => ({
  kind: "withdraw",
  nftId: null,
  underlyingAmount: null,
  underlyingUserAmount: null,
  feeAmount: null,
  ...log,
});

const OptionalPrincipal = Schema.optional(Schema.NullOr(Schema.String));

// --- stSTX: stacking-dao-core-v1 … v6, stacking-dao-core-stx-v1 / v2, ststx-nft-helper-v1 ---

/** `core-v1` prints the stSTX minted as `amount`, without the STX deposited. */
const ststxDepositV1 = toDeposit(
  Schema.Struct({
    action: Schema.Literal("deposit"),
    data: Schema.Struct({
      stacker: Schema.String,
      amount: Schema.BigInt,
      referrer: OptionalPrincipal,
    }),
  }),
  ({ data }) => ({
    kind: "deposit",
    stacker: data.stacker,
    underlyingAmount: null,
    tokenAmount: data.amount,
    referrer: data.referrer ?? null,
    pool: null,
  }),
);

const ststxDepositCommon = {
  stacker: Schema.String,
  "stx-amount": Schema.BigInt,
  referrer: OptionalPrincipal,
  pool: OptionalPrincipal,
};

/** `core-v2` … `core-v4` misspell the stSTX amount as `stxstx-amount`. */
const ststxDepositV2 = toDeposit(
  Schema.Struct({
    action: Schema.Literal("deposit"),
    data: Schema.Union([
      Schema.Struct({ ...ststxDepositCommon, "stxstx-amount": Schema.BigInt }),
      Schema.Struct({ ...ststxDepositCommon, "ststx-amount": Schema.BigInt }),
    ]),
  }),
  ({ data }) => ({
    kind: "deposit",
    stacker: data.stacker,
    underlyingAmount: data["stx-amount"],
    tokenAmount: "stxstx-amount" in data ? data["stxstx-amount"] : data["ststx-amount"],
    referrer: data.referrer ?? null,
    pool: data.pool ?? null,
  }),
);

/** `core-v1` and `ststx-nft-helper-v1` print the stSTX burned as `amount`. */
const ststxWithdrawV1 = toWithdraw(
  Schema.Struct({
    action: Schema.Literal("withdraw"),
    data: Schema.Struct({ stacker: Schema.String, amount: Schema.BigInt }),
  }),
  ({ data }) =>
    withdrawLog({ action: "withdraw", stacker: data.stacker, tokenAmount: data.amount }),
);

/** `stx-user` and `stx-fee` are only printed by the `core-stx` contracts. */
const ststxWithdrawV2 = toWithdraw(
  Schema.Struct({
    action: WithdrawAction,
    data: Schema.Struct({
      stacker: Schema.String,
      "nft-id": Schema.optional(Schema.BigInt),
      "ststx-amount": Schema.BigInt,
      "stx-amount": Schema.BigInt,
      "stx-user": Schema.optional(Schema.BigInt),
      "stx-fee": Schema.optional(Schema.BigInt),
    }),
  }),
  ({ action, data }) =>
    withdrawLog({
      action,
      stacker: data.stacker,
      nftId: data["nft-id"] ?? null,
      tokenAmount: data["ststx-amount"],
      underlyingAmount: data["stx-amount"],
      underlyingUserAmount: data["stx-user"] ?? null,
      feeAmount: data["stx-fee"] ?? null,
    }),
);

export const ststxPrintSchema = Schema.Union([
  ststxDepositV2,
  ststxDepositV1,
  ststxWithdrawV2,
  ststxWithdrawV1,
]);

// --- stSTXbtc: stacking-dao-core-btc-v1 … v3 (1 stSTXbtc = 1 STX) ---

const coreBtcDeposit = toDeposit(
  Schema.Struct({
    action: Schema.Literal("deposit"),
    data: Schema.Struct({
      stacker: Schema.String,
      "stx-amount": Schema.BigInt,
      "stx-user-amount": Schema.BigInt,
      referrer: OptionalPrincipal,
      pool: OptionalPrincipal,
    }),
  }),
  ({ data }) => ({
    kind: "deposit",
    stacker: data.stacker,
    underlyingAmount: data["stx-amount"],
    // The deposit fee is taken in STX; the rest is minted 1:1.
    tokenAmount: data["stx-user-amount"],
    referrer: data.referrer ?? null,
    pool: data.pool ?? null,
  }),
);

/** The contract records the withdrawal's STX as the locked stSTXbtc, 1:1. */
const coreBtcInitWithdraw = toWithdraw(
  Schema.Struct({
    action: Schema.Literal("init-withdraw"),
    data: Schema.Struct({
      stacker: Schema.String,
      "nft-id": Schema.BigInt,
      "ststxbtc-amount": Schema.BigInt,
    }),
  }),
  ({ data }) =>
    withdrawLog({
      action: "init-withdraw",
      stacker: data.stacker,
      nftId: data["nft-id"],
      tokenAmount: data["ststxbtc-amount"],
      underlyingAmount: data["ststxbtc-amount"],
    }),
);

/** Burns `stx-amount` stSTXbtc; the fee is the part of it the user does not receive. */
const coreBtcWithdraw = toWithdraw(
  Schema.Struct({
    action: Schema.Literal("withdraw"),
    data: Schema.Struct({
      stacker: Schema.String,
      "stx-amount": Schema.BigInt,
      "stx-user-amount": Schema.BigInt,
    }),
  }),
  ({ data }) =>
    withdrawLog({
      action: "withdraw",
      stacker: data.stacker,
      tokenAmount: data["stx-amount"],
      underlyingAmount: data["stx-amount"],
      underlyingUserAmount: data["stx-user-amount"],
      feeAmount: data["stx-amount"] - data["stx-user-amount"],
    }),
);

const coreBtcWithdrawIdle = toWithdraw(
  Schema.Struct({
    action: Schema.Literal("withdraw-idle"),
    data: Schema.Struct({ stacker: Schema.String, "stx-amount": Schema.BigInt }),
  }),
  ({ data }) =>
    withdrawLog({
      action: "withdraw-idle",
      stacker: data.stacker,
      tokenAmount: data["stx-amount"],
      underlyingAmount: data["stx-amount"],
    }),
);

export const coreBtcPrintSchema = Schema.Union([
  coreBtcDeposit,
  coreBtcInitWithdraw,
  coreBtcWithdraw,
  coreBtcWithdrawIdle,
]);

// --- stSTXbtc: stacking-dao-core-ststxbtc-v1 / v2 ---

const coreStstxbtcDeposit = toDeposit(
  Schema.Struct({
    action: Schema.Literal("deposit"),
    data: Schema.Struct({
      stacker: Schema.String,
      "stx-amount": Schema.BigInt,
      "ststxbtc-amount": Schema.BigInt,
    }),
  }),
  ({ data }) => ({
    kind: "deposit",
    stacker: data.stacker,
    underlyingAmount: data["stx-amount"],
    tokenAmount: data["ststxbtc-amount"],
    referrer: null,
    pool: null,
  }),
);

const coreStstxbtcInitWithdraw = toWithdraw(
  Schema.Struct({
    action: Schema.Literal("init-withdraw"),
    data: Schema.Struct({
      stacker: Schema.String,
      "nft-id": Schema.BigInt,
      "stx-amount": Schema.BigInt,
      "ststxbtc-amount": Schema.BigInt,
    }),
  }),
  ({ data }) =>
    withdrawLog({
      action: "init-withdraw",
      stacker: data.stacker,
      nftId: data["nft-id"],
      tokenAmount: data["ststxbtc-amount"],
      underlyingAmount: data["stx-amount"],
    }),
);

const coreStstxbtcWithdraw = toWithdraw(
  Schema.Struct({
    action: Schema.Literals(["withdraw", "withdraw-idle"]),
    data: Schema.Struct({
      stacker: Schema.String,
      "nft-id": Schema.optional(Schema.BigInt),
      "stx-user": Schema.BigInt,
      "stx-fee": Schema.BigInt,
      "ststxbtc-amount": Schema.BigInt,
    }),
  }),
  ({ action, data }) =>
    withdrawLog({
      action,
      stacker: data.stacker,
      nftId: data["nft-id"] ?? null,
      tokenAmount: data["ststxbtc-amount"],
      underlyingAmount: data["stx-user"] + data["stx-fee"],
      underlyingUserAmount: data["stx-user"],
      feeAmount: data["stx-fee"],
    }),
);

export const coreStstxbtcPrintSchema = Schema.Union([
  coreStstxbtcDeposit,
  coreStstxbtcInitWithdraw,
  coreStstxbtcWithdraw,
]);

// --- stBTC: stacking-dao-core-stbtc-v1 ---

const coreStbtcDeposit = toDeposit(
  Schema.Struct({
    action: Schema.Literal("deposit"),
    data: Schema.Struct({
      stacker: Schema.String,
      "sbtc-amount": Schema.BigInt,
      "stbtc-amount": Schema.BigInt,
    }),
  }),
  ({ data }) => ({
    kind: "deposit",
    stacker: data.stacker,
    underlyingAmount: data["sbtc-amount"],
    tokenAmount: data["stbtc-amount"],
    referrer: null,
    pool: null,
  }),
);

const coreStbtcWithdraw = toWithdraw(
  Schema.Struct({
    action: Schema.Literals(["init-withdraw", "withdraw", "withdraw-idle"]),
    data: Schema.Struct({
      stacker: Schema.String,
      "nft-id": Schema.optional(Schema.BigInt),
      "sbtc-amount": Schema.BigInt,
      "sbtc-user": Schema.BigInt,
      "sbtc-fee": Schema.BigInt,
      "stbtc-amount": Schema.BigInt,
    }),
  }),
  ({ action, data }) =>
    withdrawLog({
      action,
      stacker: data.stacker,
      nftId: data["nft-id"] ?? null,
      tokenAmount: data["stbtc-amount"],
      underlyingAmount: data["sbtc-amount"],
      underlyingUserAmount: data["sbtc-user"],
      feeAmount: data["sbtc-fee"],
    }),
);

export const coreStbtcPrintSchema = Schema.Union([coreStbtcDeposit, coreStbtcWithdraw]);

// --- stSTX ⇄ stSTXbtc swaps: swap-ststx-ststxbtc-v4 / v5 ---

const swapStstxForStstxbtc = decodeInto(SwapLog)(
  Schema.Struct({
    action: Schema.Literal("swap-ststx-for-ststxbtc"),
    data: Schema.Struct({
      user: Schema.String,
      "ststx-in": Schema.BigInt,
      // The STX value of the stSTX burned, minted 1:1 as stSTXbtc.
      "value-v": Schema.BigInt,
    }),
  }),
  ({ data }) => ({
    kind: "swap",
    action: "swap-ststx-for-ststxbtc",
    user: data.user,
    ststxAmount: data["ststx-in"],
    ststxbtcAmount: data["value-v"],
  }),
);

const swapStstxbtcForStstx = decodeInto(SwapLog)(
  Schema.Struct({
    action: Schema.Literal("swap-ststxbtc-for-ststx"),
    data: Schema.Struct({
      user: Schema.String,
      "ststxbtc-in": Schema.BigInt,
      "ststx-out": Schema.BigInt,
    }),
  }),
  ({ data }) => ({
    kind: "swap",
    action: "swap-ststxbtc-for-ststx",
    user: data.user,
    ststxAmount: data["ststx-out"],
    ststxbtcAmount: data["ststxbtc-in"],
  }),
);

export const swapPrintSchema = Schema.Union([swapStstxForStstxbtc, swapStstxbtcForStstx]);
