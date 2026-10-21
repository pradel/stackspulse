import { fileURLToPath } from "node:url";

import { eq } from "drizzle-orm";
import { Effect, Option, Schema } from "effect";
import { decodeHex } from "stacksindex/clarity";
import { pglite, type PrintEvent } from "stacksindex/effect";
import { describe, expect, it } from "vitest";

import { indexer } from "../../indexer.ts";
import { depositTable, withdrawTable } from "../../schema.ts";
import { STACKINGDAO_CONTRACTS } from "./contracts.ts";
import {
  depositLogSchema,
  type StackingDaoLog,
  stackingDaoLogSchema,
  withdrawLogSchema,
} from "./event-schemas.ts";
import { STACKINGDAO_HANDLERS, stackingDaoHandler } from "./handler.ts";

describe("StackingDAO event schemas", () => {
  it("parses v1 deposit events", () => {
    const raw = {
      action: "deposit",
      data: {
        stacker: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
        amount: 5000000000n,
        referrer: null,
        "block-height": 135000n,
      },
    };
    const parsed = Schema.decodeUnknownOption(depositLogSchema)(raw);
    expect(Option.isSome(parsed)).toBe(true);
    if (Option.isNone(parsed)) return;

    expect(parsed.value.kind).toBe("deposit");
    expect(parsed.value.stacker).toBe("SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7");
    expect(parsed.value.ststxAmount).toBe(5000000000n);
    expect(parsed.value.stxAmount).toBeNull();
    expect(parsed.value.referrer).toBeNull();
  });

  it("parses v2 deposit events with stxstx-amount and referrer", () => {
    const raw = {
      action: "deposit",
      data: {
        stacker: "SP3VCX5NFQ8VCHFS9M6N40ZJNVTRT4HZ62WFH5C4Q",
        "stx-amount": 1000000000n,
        "stxstx-amount": 920000000n,
        referrer: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
        pool: null,
        "block-height": 150000n,
      },
    };
    const parsed = Schema.decodeUnknownOption(depositLogSchema)(raw);
    expect(Option.isSome(parsed)).toBe(true);
    if (Option.isNone(parsed)) return;

    expect(parsed.value.kind).toBe("deposit");
    expect(parsed.value.stacker).toBe("SP3VCX5NFQ8VCHFS9M6N40ZJNVTRT4HZ62WFH5C4Q");
    expect(parsed.value.stxAmount).toBe(1000000000n);
    expect(parsed.value.ststxAmount).toBe(920000000n);
    expect(parsed.value.referrer).toBe("SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7");
  });

  it("parses v2 deposit events with ststx-amount", () => {
    const raw = {
      action: "deposit",
      data: {
        stacker: "SP3VCX5NFQ8VCHFS9M6N40ZJNVTRT4HZ62WFH5C4Q",
        "stx-amount": 1000000000n,
        "ststx-amount": 910000000n,
        referrer: null,
        pool: "SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.pool",
      },
    };
    const parsed = Schema.decodeUnknownOption(depositLogSchema)(raw);
    expect(Option.isSome(parsed)).toBe(true);
    if (Option.isNone(parsed)) return;

    expect(parsed.value.stxAmount).toBe(1000000000n);
    expect(parsed.value.ststxAmount).toBe(910000000n);
    expect(parsed.value.pool).toBe("SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.pool");
  });

  it("rejects v2 deposit events missing both ststx-amount and stxstx-amount", () => {
    const raw = {
      action: "deposit",
      data: {
        stacker: "SP3VCX5NFQ8VCHFS9M6N40ZJNVTRT4HZ62WFH5C4Q",
        "stx-amount": 1000000000n,
      },
    };
    const parsed = Schema.decodeUnknownOption(depositLogSchema)(raw);
    expect(Option.isNone(parsed)).toBe(true);
  });

  it("parses v1 withdraw events", () => {
    const raw = {
      action: "withdraw",
      data: {
        stacker: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
        amount: 2500000000n,
        "block-height": 136000n,
      },
    };
    const parsed = Schema.decodeUnknownOption(withdrawLogSchema)(raw);
    expect(Option.isSome(parsed)).toBe(true);
    if (Option.isNone(parsed)) return;

    expect(parsed.value.kind).toBe("withdraw");
    expect(parsed.value.action).toBe("withdraw");
    expect(parsed.value.stacker).toBe("SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7");
    expect(parsed.value.ststxAmount).toBe(2500000000n);
    expect(parsed.value.stxAmount).toBeNull();
    expect(parsed.value.nftId).toBeNull();
  });

  it("parses v2 init-withdraw events with nft-id", () => {
    const raw = {
      action: "init-withdraw",
      data: {
        stacker: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
        "nft-id": 105n,
        "ststx-amount": 3000000000n,
        "stx-amount": 3150000000n,
        "block-height": 152000n,
      },
    };
    const parsed = Schema.decodeUnknownOption(withdrawLogSchema)(raw);
    expect(Option.isSome(parsed)).toBe(true);
    if (Option.isNone(parsed)) return;

    expect(parsed.value.kind).toBe("withdraw");
    expect(parsed.value.action).toBe("init-withdraw");
    expect(parsed.value.nftId).toBe(105n);
    expect(parsed.value.ststxAmount).toBe(3000000000n);
    expect(parsed.value.stxAmount).toBe(3150000000n);
  });

  it("parses v4 withdraw-idle events", () => {
    const raw = {
      action: "withdraw-idle",
      data: {
        stacker: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
        "ststx-amount": 1000000000n,
        "stx-amount": 1050000000n,
        "block-height": 500000n,
      },
    };
    const parsed = Schema.decodeUnknownOption(withdrawLogSchema)(raw);
    expect(Option.isSome(parsed)).toBe(true);
    if (Option.isNone(parsed)) return;

    expect(parsed.value.kind).toBe("withdraw");
    expect(parsed.value.action).toBe("withdraw-idle");
    expect(parsed.value.ststxAmount).toBe(1000000000n);
    expect(parsed.value.stxAmount).toBe(1050000000n);
  });

  it("parses core-stx withdraw events with stx-user and stx-fee", () => {
    const raw = {
      action: "withdraw",
      data: {
        stacker: "SP2PN3KB4SMAYG1D9Z79294ZB83NGKB453WSK18JC",
        "nft-id": 170n,
        "stx-amount": 20058343814n,
        "stx-user": 20048314642n,
        "stx-fee": 10029172n,
        "ststx-amount": 16878047147n,
        "block-height": 8720000n,
      },
    };
    const parsed = Schema.decodeUnknownOption(withdrawLogSchema)(raw);
    expect(Option.isSome(parsed)).toBe(true);
    if (Option.isNone(parsed)) return;

    expect(parsed.value.action).toBe("withdraw");
    expect(parsed.value.nftId).toBe(170n);
    expect(parsed.value.ststxAmount).toBe(16878047147n);
    expect(parsed.value.stxAmount).toBe(20058343814n);
  });

  it("ignores non-matching log events", () => {
    const raw = {
      action: "something-else",
      data: { foo: "bar" },
    };
    const parsed = Schema.decodeUnknownOption(stackingDaoLogSchema)(raw);
    expect(Option.isNone(parsed)).toBe(true);
  });
});

/** A core print as the indexer hands it over: decoded from Clarity, then parsed by the contract's `print` schema. */
function printEvent(options: {
  hex: string;
  txId: string;
  blockHeight: number;
  blockTime: number;
}): PrintEvent<StackingDaoLog> {
  return {
    type: "print",
    contract: "stackingDaoCoreV1",
    contractId: STACKINGDAO_CONTRACTS.CORE_V1,
    txId: options.txId,
    eventIndex: 0,
    data: Schema.decodeUnknownSync(stackingDaoLogSchema)(decodeHex(options.hex)),
    raw: { hex: options.hex, repr: "", topic: "print" },
    block: {
      height: options.blockHeight,
      time: options.blockTime,
      hash: "0x00",
      indexBlockHash: "0x00",
    },
    tx: { index: 0, sender: "SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG" },
  };
}

describe("StackingDAO event handler with PGlite", () => {
  it("inserts deposit and withdraw rows into database", async () => {
    const program = Effect.gen(function* () {
      const db = yield* indexer.Db;

      const depositEvent = printEvent({
        hex: "0x0c0000000206616374696f6e0d000000076465706f73697404646174610c0000000406616d6f756e7401000000000000000000000000000013880c626c6f636b2d68656967687401000000000000000000000000000204680872656665727265720907737461636b657205162b78161ee235efdc923b7ffc2aa09440628e8334",
        txId: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        blockHeight: 132200,
        blockTime: 1700000000,
      });

      yield* stackingDaoHandler(depositEvent);

      const deposits = yield* db
        .select()
        .from(depositTable)
        .where(eq(depositTable.txId, depositEvent.txId));
      expect(deposits.length).toBe(1);
      expect(deposits[0].txId).toBe(depositEvent.txId);
      expect(deposits[0].contractId).toBe(STACKINGDAO_CONTRACTS.CORE_V1);
      expect(deposits[0].ststxAmount).toBe(5000n);
      expect(deposits[0].stxAmount).toBeNull();
      expect(deposits[0].blockHeight).toBe(132200n);

      yield* stackingDaoHandler(depositEvent);
      const depositsAfterSecond = yield* db.select().from(depositTable);
      expect(depositsAfterSecond.length).toBe(1);

      const withdrawEvent = printEvent({
        hex: "0x0c0000000206616374696f6e0d00000008776974686472617704646174610c0000000306616d6f756e7401000000000000000000000000000009c40c626c6f636b2d686569676874010000000000000000000000000002078807737461636b657205162b78161ee235efdc923b7ffc2aa09440628e8334",
        txId: "0x9876543210abcdef9876543210abcdef9876543210abcdef9876543210abcdef",
        blockHeight: 133000,
        blockTime: 1700100000,
      });

      yield* stackingDaoHandler(withdrawEvent);

      const withdrawals = yield* db
        .select()
        .from(withdrawTable)
        .where(eq(withdrawTable.txId, withdrawEvent.txId));
      expect(withdrawals.length).toBe(1);
      expect(withdrawals[0].action).toBe("withdraw");
      expect(withdrawals[0].contractId).toBe(STACKINGDAO_CONTRACTS.CORE_V1);
      expect(withdrawals[0].ststxAmount).toBe(2500n);
      expect(withdrawals[0].stxAmount).toBeNull();
      expect(withdrawals[0].nftId).toBeNull();
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
