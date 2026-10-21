import { fileURLToPath } from "node:url";

import { Effect, Option, Schema } from "effect";
import { decodeHex } from "stacksindex/clarity";
import { pglite, type PrintEvent } from "stacksindex/effect";
import { describe, expect, it } from "vitest";

import { indexer } from "../../indexer.ts";
import { depositTable, swapTable, withdrawTable } from "../../schema.ts";
import { STACKINGDAO_CONTRACTS } from "./contracts.ts";
import {
  coreBtcPrintSchema,
  coreStbtcPrintSchema,
  coreStstxbtcPrintSchema,
  ststxPrintSchema,
  swapPrintSchema,
} from "./event-schemas.ts";
import { STACKINGDAO_HANDLERS } from "./handler.ts";

const STACKER = "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7";

const noWithdrawDetails = {
  nftId: null,
  underlyingAmount: null,
  underlyingUserAmount: null,
  feeAmount: null,
};

describe("stSTX prints", () => {
  const decode = Schema.decodeUnknownSync(ststxPrintSchema);

  it("reads core-v1 deposits as stSTX minted without the STX deposited", () => {
    expect(
      decode({ action: "deposit", data: { stacker: STACKER, amount: 5000n, referrer: null } }),
    ).toEqual({
      kind: "deposit",
      stacker: STACKER,
      underlyingAmount: null,
      tokenAmount: 5000n,
      referrer: null,
      pool: null,
    });
  });

  it("reads the stSTX minted from the misspelled stxstx-amount of core-v2 … v4", () => {
    expect(
      decode({
        action: "deposit",
        data: {
          stacker: STACKER,
          "stx-amount": 1000n,
          "stxstx-amount": 920n,
          referrer: "SP3VCX5NFQ8VCHFS9M6N40ZJNVTRT4HZ62WFH5C4Q",
          pool: null,
        },
      }),
    ).toMatchObject({
      underlyingAmount: 1000n,
      tokenAmount: 920n,
      referrer: "SP3VCX5NFQ8VCHFS9M6N40ZJNVTRT4HZ62WFH5C4Q",
    });
  });

  it("rejects deposits printing neither stSTX amount", () => {
    const parsed = Schema.decodeUnknownOption(ststxPrintSchema)({
      action: "deposit",
      data: { stacker: STACKER, "stx-amount": 1000n },
    });
    expect(Option.isNone(parsed)).toBe(true);
  });

  it("reads core-v1 withdrawals as stSTX burned", () => {
    expect(decode({ action: "withdraw", data: { stacker: STACKER, amount: 2500n } })).toEqual({
      kind: "withdraw",
      action: "withdraw",
      stacker: STACKER,
      tokenAmount: 2500n,
      ...noWithdrawDetails,
    });
  });

  it("reads the payout and fee printed by the core-stx contracts", () => {
    expect(
      decode({
        action: "withdraw",
        data: {
          stacker: STACKER,
          "nft-id": 170n,
          "stx-amount": 20058343814n,
          "stx-user": 20048314642n,
          "stx-fee": 10029172n,
          "ststx-amount": 16878047147n,
        },
      }),
    ).toEqual({
      kind: "withdraw",
      action: "withdraw",
      stacker: STACKER,
      nftId: 170n,
      tokenAmount: 16878047147n,
      underlyingAmount: 20058343814n,
      underlyingUserAmount: 20048314642n,
      feeAmount: 10029172n,
    });
  });

  it("leaves the payout and fee empty when core-v2 … v6 do not print them", () => {
    expect(
      decode({
        action: "withdraw-idle",
        data: { stacker: STACKER, "ststx-amount": 1000n, "stx-amount": 1050n },
      }),
    ).toMatchObject({
      tokenAmount: 1000n,
      underlyingAmount: 1050n,
      underlyingUserAmount: null,
      feeAmount: null,
    });
  });
});

describe("stSTXbtc prints", () => {
  it("reads core-btc deposits as STX paid and stSTXbtc minted after the fee", () => {
    expect(
      Schema.decodeUnknownSync(coreBtcPrintSchema)({
        action: "deposit",
        data: {
          stacker: STACKER,
          "stx-amount": 1000n,
          "stx-user-amount": 990n,
          referrer: null,
          pool: null,
        },
      }),
    ).toMatchObject({ kind: "deposit", underlyingAmount: 1000n, tokenAmount: 990n });
  });

  it("derives the fee of core-btc withdrawals, which print no nft-id", () => {
    expect(
      Schema.decodeUnknownSync(coreBtcPrintSchema)({
        action: "withdraw",
        data: { stacker: STACKER, "stx-user-amount": 995n, "stx-amount": 1000n },
      }),
    ).toEqual({
      kind: "withdraw",
      action: "withdraw",
      stacker: STACKER,
      nftId: null,
      tokenAmount: 1000n,
      underlyingAmount: 1000n,
      underlyingUserAmount: 995n,
      feeAmount: 5n,
    });
  });

  it("reads core-btc withdraw-idle as stSTXbtc burned without payout details", () => {
    expect(
      Schema.decodeUnknownSync(coreBtcPrintSchema)({
        action: "withdraw-idle",
        data: { stacker: STACKER, "stx-amount": 700n },
      }),
    ).toMatchObject({
      action: "withdraw-idle",
      tokenAmount: 700n,
      underlyingUserAmount: null,
      feeAmount: null,
    });
  });

  it("sums the payout and fee of core-ststxbtc withdrawals into the gross STX amount", () => {
    expect(
      Schema.decodeUnknownSync(coreStstxbtcPrintSchema)({
        action: "withdraw",
        data: {
          stacker: STACKER,
          "nft-id": 7n,
          "stx-user": 995n,
          "stx-fee": 5n,
          "ststxbtc-amount": 1000n,
        },
      }),
    ).toEqual({
      kind: "withdraw",
      action: "withdraw",
      stacker: STACKER,
      nftId: 7n,
      tokenAmount: 1000n,
      underlyingAmount: 1000n,
      underlyingUserAmount: 995n,
      feeAmount: 5n,
    });
  });
});

describe("stBTC prints", () => {
  it("reads core-stbtc withdrawals in sBTC and stBTC", () => {
    expect(
      Schema.decodeUnknownSync(coreStbtcPrintSchema)({
        action: "init-withdraw",
        data: {
          stacker: STACKER,
          "nft-id": 3n,
          "sbtc-amount": 100000n,
          "sbtc-user": 99900n,
          "sbtc-fee": 100n,
          "stbtc-amount": 98000n,
          "unlock-burn-height": 900000n,
        },
      }),
    ).toEqual({
      kind: "withdraw",
      action: "init-withdraw",
      stacker: STACKER,
      nftId: 3n,
      tokenAmount: 98000n,
      underlyingAmount: 100000n,
      underlyingUserAmount: 99900n,
      feeAmount: 100n,
    });
  });
});

describe("stSTX ⇄ stSTXbtc swap prints", () => {
  const decode = Schema.decodeUnknownSync(swapPrintSchema);

  it("reads both swap directions as stSTX and stSTXbtc amounts", () => {
    expect(
      decode({
        action: "swap-ststx-for-ststxbtc",
        data: { user: STACKER, "ststx-in": 1000n, "value-v": 1080n },
      }),
    ).toEqual({
      kind: "swap",
      action: "swap-ststx-for-ststxbtc",
      user: STACKER,
      ststxAmount: 1000n,
      ststxbtcAmount: 1080n,
    });
    expect(
      decode({
        action: "swap-ststxbtc-for-ststx",
        data: { user: STACKER, "ststxbtc-in": 1080n, "ststx-out": 999n },
      }),
    ).toMatchObject({ ststxAmount: 999n, ststxbtcAmount: 1080n });
  });
});

/** A print as the indexer hands it over: decoded and parsed by the contract's `print` schema. */
function printEvent<T>(options: {
  contract: keyof typeof STACKINGDAO_HANDLERS;
  contractId: string;
  txId: string;
  data: T;
}): PrintEvent<T> {
  return {
    type: "print",
    contract: options.contract,
    contractId: options.contractId,
    txId: options.txId,
    eventIndex: 0,
    data: options.data,
    raw: { hex: "0x", repr: "", topic: "print" },
    block: { height: 132200, time: 1700000000, hash: "0x00", indexBlockHash: "0x00" },
    tx: { index: 0, sender: STACKER },
  };
}

describe("StackingDAO handlers with PGlite", () => {
  it("writes each token's flows to its tables, once per event", async () => {
    const program = Effect.gen(function* () {
      const db = yield* indexer.Db;

      // A real core-v1 deposit print, decoded from its Clarity hex.
      const ststxDeposit = printEvent({
        contract: "stackingDaoCoreV1",
        contractId: STACKINGDAO_CONTRACTS.CORE_V1,
        txId: "0x01",
        data: Schema.decodeUnknownSync(ststxPrintSchema)(
          decodeHex(
            "0x0c0000000206616374696f6e0d000000076465706f73697404646174610c0000000406616d6f756e7401000000000000000000000000000013880c626c6f636b2d68656967687401000000000000000000000000000204680872656665727265720907737461636b657205162b78161ee235efdc923b7ffc2aa09440628e8334",
          ),
        ),
      });
      yield* STACKINGDAO_HANDLERS.stackingDaoCoreV1(ststxDeposit);
      yield* STACKINGDAO_HANDLERS.stackingDaoCoreV1(ststxDeposit);

      yield* STACKINGDAO_HANDLERS.stackingDaoCoreBtcV3(
        printEvent({
          contract: "stackingDaoCoreBtcV3",
          contractId: STACKINGDAO_CONTRACTS.CORE_BTC_V3,
          txId: "0x02",
          data: Schema.decodeUnknownSync(coreBtcPrintSchema)({
            action: "withdraw",
            data: { stacker: STACKER, "stx-user-amount": 995n, "stx-amount": 1000n },
          }),
        }),
      );

      yield* STACKINGDAO_HANDLERS.stackingDaoSwapStstxStstxbtcV5(
        printEvent({
          contract: "stackingDaoSwapStstxStstxbtcV5",
          contractId: STACKINGDAO_CONTRACTS.SWAP_STSTX_STSTXBTC_V5,
          txId: "0x03",
          data: Schema.decodeUnknownSync(swapPrintSchema)({
            action: "swap-ststxbtc-for-ststx",
            data: { user: STACKER, "ststxbtc-in": 1080n, "ststx-out": 999n },
          }),
        }),
      );

      expect(yield* db.select().from(depositTable)).toMatchObject([
        { txId: "0x01", token: "ststx", tokenAmount: 5000n, underlyingAmount: null },
      ]);
      expect(yield* db.select().from(withdrawTable)).toMatchObject([
        {
          txId: "0x02",
          token: "ststxbtc",
          action: "withdraw",
          tokenAmount: 1000n,
          underlyingUserAmount: 995n,
          feeAmount: 5n,
        },
      ]);
      expect(yield* db.select().from(swapTable)).toMatchObject([
        {
          txId: "0x03",
          action: "swap-ststxbtc-for-ststx",
          ststxAmount: 999n,
          ststxbtcAmount: 1080n,
        },
      ]);
    });

    await Effect.runPromise(
      program.pipe(
        Effect.provide(
          indexer.layer({
            database: pglite(),
            migrations: fileURLToPath(new URL("../../../drizzle", import.meta.url)),
            handlers: STACKINGDAO_HANDLERS,
          }),
        ),
      ),
    );
  });
});
