import { Schema, SchemaGetter } from "effect";

// --- Deposit Schemas ---

const blockHeightField = Schema.optional(Schema.BigInt);

const depositNormalizedSchema = Schema.Struct({
  kind: Schema.Literal("deposit"),
  stacker: Schema.String,
  stxAmount: Schema.NullOr(Schema.BigInt),
  ststxAmount: Schema.BigInt,
  referrer: Schema.NullOr(Schema.String),
  pool: Schema.NullOr(Schema.String),
});

const depositV2CommonFields = {
  stacker: Schema.String,
  "stx-amount": Schema.BigInt,
  referrer: Schema.optional(Schema.NullOr(Schema.String)),
  pool: Schema.optional(Schema.NullOr(Schema.String)),
  "block-height": blockHeightField,
};

const depositV2RawSchema = Schema.Struct({
  action: Schema.Literal("deposit"),
  data: Schema.Union([
    Schema.Struct({ ...depositV2CommonFields, "stxstx-amount": Schema.BigInt }),
    Schema.Struct({ ...depositV2CommonFields, "ststx-amount": Schema.BigInt }),
  ]),
});

const depositV2Schema = depositV2RawSchema.pipe(
  Schema.decodeTo(depositNormalizedSchema, {
    decode: SchemaGetter.transform((raw) => ({
      kind: "deposit" as const,
      stacker: raw.data.stacker,
      stxAmount: raw.data["stx-amount"],
      ststxAmount:
        "stxstx-amount" in raw.data ? raw.data["stxstx-amount"] : raw.data["ststx-amount"],
      referrer: raw.data.referrer ?? null,
      pool: raw.data.pool ?? null,
    })),
    encode: SchemaGetter.transform((log) => ({
      action: "deposit" as const,
      data: {
        stacker: log.stacker,
        "stx-amount": log.stxAmount ?? 0n,
        "ststx-amount": log.ststxAmount,
        referrer: log.referrer,
        pool: log.pool,
      },
    })),
  }),
);

const depositV1RawSchema = Schema.Struct({
  action: Schema.Literal("deposit"),
  data: Schema.Struct({
    stacker: Schema.String,
    amount: Schema.BigInt,
    referrer: Schema.optional(Schema.NullOr(Schema.String)),
    "block-height": blockHeightField,
  }),
});

const depositV1Schema = depositV1RawSchema.pipe(
  Schema.decodeTo(depositNormalizedSchema, {
    decode: SchemaGetter.transform((raw) => ({
      kind: "deposit" as const,
      stacker: raw.data.stacker,
      stxAmount: null,
      ststxAmount: raw.data.amount,
      referrer: raw.data.referrer ?? null,
      pool: null,
    })),
    encode: SchemaGetter.transform((log) => ({
      action: "deposit" as const,
      data: {
        stacker: log.stacker,
        amount: log.ststxAmount,
        referrer: log.referrer,
      },
    })),
  }),
);

export const depositLogSchema = Schema.Union([depositV2Schema, depositV1Schema]);

export type NormalizedDepositLog = typeof depositLogSchema.Type;

// --- Withdraw Schemas ---

const withdrawNormalizedSchema = Schema.Struct({
  kind: Schema.Literal("withdraw"),
  action: Schema.Union([
    Schema.Literal("withdraw"),
    Schema.Literal("init-withdraw"),
    Schema.Literal("cancel-withdraw"),
    Schema.Literal("withdraw-idle"),
  ]),
  stacker: Schema.String,
  nftId: Schema.NullOr(Schema.BigInt),
  ststxAmount: Schema.BigInt,
  stxAmount: Schema.NullOr(Schema.BigInt),
});

const withdrawV2RawSchema = Schema.Struct({
  action: Schema.Union([
    Schema.Literal("withdraw"),
    Schema.Literal("init-withdraw"),
    Schema.Literal("cancel-withdraw"),
    Schema.Literal("withdraw-idle"),
  ]),
  data: Schema.Struct({
    stacker: Schema.String,
    "nft-id": Schema.optional(Schema.NullOr(Schema.BigInt)),
    "ststx-amount": Schema.BigInt,
    "stx-amount": Schema.optional(Schema.NullOr(Schema.BigInt)),
    "block-height": blockHeightField,
  }),
});

const withdrawV2Schema = withdrawV2RawSchema.pipe(
  Schema.decodeTo(withdrawNormalizedSchema, {
    decode: SchemaGetter.transform((raw) => ({
      kind: "withdraw" as const,
      action: raw.action,
      stacker: raw.data.stacker,
      nftId: raw.data["nft-id"] ?? null,
      ststxAmount: raw.data["ststx-amount"],
      stxAmount: raw.data["stx-amount"] ?? null,
    })),
    encode: SchemaGetter.transform((log) => ({
      action: log.action,
      data: {
        stacker: log.stacker,
        "nft-id": log.nftId,
        "ststx-amount": log.ststxAmount,
        "stx-amount": log.stxAmount,
      },
    })),
  }),
);

const withdrawV1RawSchema = Schema.Struct({
  action: Schema.Literal("withdraw"),
  data: Schema.Struct({
    stacker: Schema.String,
    amount: Schema.BigInt,
    "block-height": blockHeightField,
  }),
});

const withdrawV1Schema = withdrawV1RawSchema.pipe(
  Schema.decodeTo(withdrawNormalizedSchema, {
    decode: SchemaGetter.transform((raw) => ({
      kind: "withdraw" as const,
      action: "withdraw" as const,
      stacker: raw.data.stacker,
      nftId: null,
      ststxAmount: raw.data.amount,
      stxAmount: null,
    })),
    encode: SchemaGetter.transform((log) => ({
      action: "withdraw" as const,
      data: {
        stacker: log.stacker,
        amount: log.ststxAmount,
      },
    })),
  }),
);

export const withdrawLogSchema = Schema.Union([withdrawV2Schema, withdrawV1Schema]);

export type NormalizedWithdrawLog = typeof withdrawLogSchema.Type;

export const stackingDaoLogSchema = Schema.Union([depositLogSchema, withdrawLogSchema]);

export type StackingDaoLog = typeof stackingDaoLogSchema.Type;
