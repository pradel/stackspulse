import { fileURLToPath } from "node:url";

import { PGlite } from "@electric-sql/pglite";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import type { HandlerEvent, Logger } from "stacksindex";
import { describe, expect, it } from "vitest";

import { depositTable, withdrawTable } from "../../schema.ts";
import { STACKINGDAO_CONTRACTS } from "./contracts.ts";
import { depositLogSchema, stackingDaoLogSchema, withdrawLogSchema } from "./event-schemas.ts";
import { createStackingDaoHandler } from "./handler.ts";

const mockLogger: Logger = {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
  trace: () => {},
};

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
    const parsed = depositLogSchema.safeParse(raw);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;

    expect(parsed.data.kind).toBe("deposit");
    expect(parsed.data.stacker).toBe("SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7");
    expect(parsed.data.ststxAmount).toBe(5000000000n);
    expect(parsed.data.stxAmount).toBeNull();
    expect(parsed.data.referrer).toBeNull();
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
    const parsed = depositLogSchema.safeParse(raw);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;

    expect(parsed.data.kind).toBe("deposit");
    expect(parsed.data.stacker).toBe("SP3VCX5NFQ8VCHFS9M6N40ZJNVTRT4HZ62WFH5C4Q");
    expect(parsed.data.stxAmount).toBe(1000000000n);
    expect(parsed.data.ststxAmount).toBe(920000000n);
    expect(parsed.data.referrer).toBe("SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7");
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
    const parsed = withdrawLogSchema.safeParse(raw);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;

    expect(parsed.data.kind).toBe("withdraw");
    expect(parsed.data.action).toBe("withdraw");
    expect(parsed.data.stacker).toBe("SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7");
    expect(parsed.data.ststxAmount).toBe(2500000000n);
    expect(parsed.data.stxAmount).toBeNull();
    expect(parsed.data.nftId).toBeNull();
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
    const parsed = withdrawLogSchema.safeParse(raw);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;

    expect(parsed.data.kind).toBe("withdraw");
    expect(parsed.data.action).toBe("init-withdraw");
    expect(parsed.data.nftId).toBe(105n);
    expect(parsed.data.ststxAmount).toBe(3000000000n);
    expect(parsed.data.stxAmount).toBe(3150000000n);
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
    const parsed = withdrawLogSchema.safeParse(raw);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;

    expect(parsed.data.kind).toBe("withdraw");
    expect(parsed.data.action).toBe("withdraw-idle");
    expect(parsed.data.ststxAmount).toBe(1000000000n);
    expect(parsed.data.stxAmount).toBe(1050000000n);
  });

  it("ignores non-matching log events", () => {
    const raw = {
      action: "something-else",
      data: { foo: "bar" },
    };
    const parsed = stackingDaoLogSchema.safeParse(raw);
    expect(parsed.success).toBe(false);
  });
});

describe("StackingDAO event handler with PGlite", () => {
  it("inserts deposit and withdraw rows into database", async () => {
    const client = new PGlite();
    await client.waitReady;
    const db = drizzle({ client });

    const migrationsFolder = fileURLToPath(new URL("../../../drizzle", import.meta.url));
    await migrate(db, { migrationsFolder });

    const handler = createStackingDaoHandler({
      db,
      logger: mockLogger,
    });

    // Hex-encoded Clarity tuple for:
    // (print { action: "deposit", data: { stacker: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG, referrer: none, amount: u5000, block-height: u132200 } })
    // In stacksindex, decodeHex is called. We can mock a HandlerEvent with contract_log.value.hex
    // Using a valid hex from clarity value
    // Alternatively, let's construct Clarity value or test handler
    const mockDepositEvent: HandlerEvent = {
      event_type: "smart_contract_log",
      contract_log: {
        contract_id: STACKINGDAO_CONTRACTS.CORE_V1,
        topic: "print",
        value: {
          hex: "0x0c0000000206616374696f6e0d000000076465706f73697404646174610c0000000406616d6f756e7401000000000000000000000000000013880c626c6f636b2d68656967687401000000000000000000000000000204680872656665727265720907737461636b657205162b78161ee235efdc923b7ffc2aa09440628e8334",
          repr: '(tuple (action "deposit") (data (tuple (amount u5000) (block-height u132200) (referrer none) (stacker \'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG))))',
        },
      },
      tx_id: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      event_index: 0,
      block_height: 132200,
      block_time: 1700000000,
      tx_index: 1,
      sender_address: "SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG",
    };

    // oxlint-disable-next-line typescript/no-explicit-any
    await handler(mockDepositEvent, {} as any);

    const deposits = await db
      .select()
      .from(depositTable)
      .where(eq(depositTable.txId, mockDepositEvent.tx_id));
    expect(deposits.length).toBe(1);
    expect(deposits[0].txId).toBe(mockDepositEvent.tx_id);
    expect(deposits[0].contractId).toBe(STACKINGDAO_CONTRACTS.CORE_V1);
    expect(deposits[0].ststxAmount).toBe(5000n);
    expect(deposits[0].stxAmount).toBeNull();
    expect(deposits[0].blockHeight).toBe(132200n);

    // Test idempotency (inserting same event again should not throw)
    // oxlint-disable-next-line typescript/no-explicit-any
    await handler(mockDepositEvent, {} as any);
    const depositsAfterSecond = await db.select().from(depositTable);
    expect(depositsAfterSecond.length).toBe(1);

    // Test withdraw event handling:
    // (print { action: "withdraw", data: { stacker: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG, amount: u2500, block-height: u133000 } })
    const mockWithdrawEvent: HandlerEvent = {
      event_type: "smart_contract_log",
      contract_log: {
        contract_id: STACKINGDAO_CONTRACTS.CORE_V1,
        topic: "print",
        value: {
          hex: "0x0c0000000206616374696f6e0d00000008776974686472617704646174610c0000000306616d6f756e7401000000000000000000000000000009c40c626c6f636b2d686569676874010000000000000000000000000002078807737461636b657205162b78161ee235efdc923b7ffc2aa09440628e8334",
          repr: '(tuple (action "withdraw") (data (tuple (amount u2500) (block-height u133000) (stacker \'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG))))',
        },
      },
      tx_id: "0x9876543210abcdef9876543210abcdef9876543210abcdef9876543210abcdef",
      event_index: 0,
      block_height: 133000,
      block_time: 1700100000,
      tx_index: 2,
      sender_address: "SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG",
    };

    // oxlint-disable-next-line typescript/no-explicit-any
    await handler(mockWithdrawEvent, {} as any);

    const withdrawals = await db
      .select()
      .from(withdrawTable)
      .where(eq(withdrawTable.txId, mockWithdrawEvent.tx_id));
    expect(withdrawals.length).toBe(1);
    expect(withdrawals[0].action).toBe("withdraw");
    expect(withdrawals[0].contractId).toBe(STACKINGDAO_CONTRACTS.CORE_V1);
    expect(withdrawals[0].ststxAmount).toBe(2500n);
    expect(withdrawals[0].stxAmount).toBeNull();
    expect(withdrawals[0].nftId).toBeNull();

    // Test invalid hex handling (should not throw)
    const invalidEvent: HandlerEvent = {
      ...mockDepositEvent,
      contract_log: {
        ...mockDepositEvent.contract_log,
        value: { hex: "0xdeadbeefinvalid", repr: "invalid" },
      },
    };
    // oxlint-disable-next-line typescript/no-explicit-any
    await expect(handler(invalidEvent, {} as any)).resolves.not.toThrow();

    await client.close();
  });
});
