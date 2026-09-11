import { z } from "zod";

// --- Deposit Schemas ---

const depositV1Schema = z
  .object({
    action: z.literal("deposit"),
    data: z.object({
      stacker: z.string(),
      amount: z.bigint(),
      referrer: z.string().nullable().optional(),
      "block-height": z.bigint().optional(),
    }),
  })
  .transform((val) => ({
    kind: "deposit" as const,
    stacker: val.data.stacker,
    stxAmount: null,
    ststxAmount: val.data.amount,
    referrer: val.data.referrer ?? null,
    pool: null,
  }));

const depositV2Schema = z
  .object({
    action: z.literal("deposit"),
    data: z.object({
      stacker: z.string(),
      "stx-amount": z.bigint(),
      "stxstx-amount": z.bigint().optional(),
      "ststx-amount": z.bigint().optional(),
      referrer: z.string().nullable().optional(),
      pool: z.string().nullable().optional(),
      "block-height": z.bigint().optional(),
    }),
  })
  .transform((val) => {
    const ststxAmount = val.data["stxstx-amount"] ?? val.data["ststx-amount"];
    if (ststxAmount === undefined) {
      throw new Error("Missing ststx-amount or stxstx-amount in deposit event");
    }
    return {
      kind: "deposit" as const,
      stacker: val.data.stacker,
      stxAmount: val.data["stx-amount"],
      ststxAmount,
      referrer: val.data.referrer ?? null,
      pool: val.data.pool ?? null,
    };
  });

export const depositLogSchema = z.union([depositV2Schema, depositV1Schema]);

export type NormalizedDepositLog = z.infer<typeof depositLogSchema>;

// --- Withdraw Schemas ---

const withdrawV1Schema = z
  .object({
    action: z.literal("withdraw"),
    data: z.object({
      stacker: z.string(),
      amount: z.bigint(),
      "block-height": z.bigint().optional(),
    }),
  })
  .transform((val) => ({
    kind: "withdraw" as const,
    action: "withdraw",
    stacker: val.data.stacker,
    nftId: null,
    ststxAmount: val.data.amount,
    stxAmount: null,
  }));

const withdrawV2ActionSchema = z.union([
  z.literal("withdraw"),
  z.literal("init-withdraw"),
  z.literal("cancel-withdraw"),
  z.literal("withdraw-idle"),
]);

const withdrawV2Schema = z
  .object({
    action: withdrawV2ActionSchema,
    data: z.object({
      stacker: z.string(),
      "nft-id": z.bigint().nullable().optional(),
      "ststx-amount": z.bigint(),
      "stx-amount": z.bigint().nullable().optional(),
      "block-height": z.bigint().optional(),
    }),
  })
  .transform((val) => ({
    kind: "withdraw" as const,
    action: val.action,
    stacker: val.data.stacker,
    nftId: val.data["nft-id"] ?? null,
    ststxAmount: val.data["ststx-amount"],
    stxAmount: val.data["stx-amount"] ?? null,
  }));

export const withdrawLogSchema = z.union([withdrawV2Schema, withdrawV1Schema]);

export type NormalizedWithdrawLog = z.infer<typeof withdrawLogSchema>;

export const stackingDaoLogSchema = z.union([depositLogSchema, withdrawLogSchema]);

export type StackingDaoLog = z.infer<typeof stackingDaoLogSchema>;
