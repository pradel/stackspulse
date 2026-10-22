import { fileURLToPath } from "node:url";

import { NodeHttpServer } from "@effect/platform-node";
import { Effect, Layer, ManagedRuntime } from "effect";
import { HttpRouter } from "effect/http";
import { HttpApiClient } from "effect/http-api";
import { pglite } from "stacksindex/effect";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";

import { indexer } from "../indexer.ts";
import { STACKINGDAO_HANDLERS } from "../protocols/stackingdao/handler.ts";
import {
  depositTable,
  type InsertDeposit,
  type InsertSwap,
  type InsertWithdraw,
  swapTable,
  withdrawTable,
} from "../schema.ts";
import { Api } from "./api.ts";
import { ApiLayer } from "./server.ts";

const at = (iso: string) => BigInt(Date.parse(iso) / 1000);

let txCounter = 0;
const nextTx = () => `0x${(++txCounter).toString(16).padStart(64, "0")}`;

const deposit = (
  row: Partial<InsertDeposit> & Pick<InsertDeposit, "token" | "stacker" | "blockTime">,
): InsertDeposit => ({
  txId: nextTx(),
  chainId: 1n,
  eventIndex: 0,
  contractId: "SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.stacking-dao-core-stx-v2",
  tokenAmount: 1000n,
  underlyingAmount: 1100n,
  blockHeight: row.blockTime,
  ...row,
});

const withdraw = (
  row: Partial<InsertWithdraw> & Pick<InsertWithdraw, "token" | "action" | "blockTime">,
): InsertWithdraw => ({
  txId: nextTx(),
  chainId: 1n,
  eventIndex: 0,
  contractId: "SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.stacking-dao-core-stx-v2",
  stacker: "SP_A",
  tokenAmount: 1000n,
  underlyingAmount: 1100n,
  blockHeight: row.blockTime,
  ...row,
});

const swap = (
  row: Pick<InsertSwap, "action" | "ststxAmount" | "ststxbtcAmount" | "blockTime">,
): InsertSwap => ({
  txId: nextTx(),
  chainId: 1n,
  eventIndex: 0,
  contractId: "SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.swap-ststx-ststxbtc-v5",
  user: "SP_C",
  blockHeight: row.blockTime,
  ...row,
});

const deposits = [
  // core-v1 prints no STX amount: counted in `minted`, not in `deposited`.
  deposit({
    token: "ststx",
    stacker: "SP_A",
    blockTime: at("2026-01-15T00:00:00Z"),
    underlyingAmount: null,
  }),
  // Last second of January, UTC.
  deposit({ token: "ststx", stacker: "SP_B", blockTime: at("2026-01-31T23:59:59Z") }),
  deposit({
    token: "ststx",
    stacker: "SP_A",
    blockTime: at("2026-02-01T00:00:00Z"),
    tokenAmount: 5000n,
    underlyingAmount: 5500n,
  }),
  deposit({
    token: "stbtc",
    stacker: "SP_C",
    blockTime: at("2026-02-10T00:00:00Z"),
    tokenAmount: 99n,
    underlyingAmount: 100n,
  }),
];

const withdrawals = [
  // Locks only: not withdrawn.
  withdraw({ token: "ststx", action: "init-withdraw", blockTime: at("2026-02-02T00:00:00Z") }),
  withdraw({
    token: "ststx",
    action: "withdraw",
    blockTime: at("2026-03-05T00:00:00Z"),
    feeAmount: 11n,
  }),
  withdraw({
    token: "ststx",
    action: "withdraw-idle",
    blockTime: at("2026-03-01T00:00:00Z"),
    underlyingAmount: 1120n,
    feeAmount: 3n,
  }),
];

const swaps = [
  swap({
    action: "swap-ststx-for-ststxbtc",
    ststxAmount: 100n,
    ststxbtcAmount: 110n,
    blockTime: at("2026-03-02T00:00:00Z"),
  }),
  swap({
    action: "swap-ststx-for-ststxbtc",
    ststxAmount: 200n,
    ststxbtcAmount: 220n,
    blockTime: at("2026-03-03T00:00:00Z"),
  }),
  swap({
    action: "swap-ststxbtc-for-ststx",
    ststxAmount: 50n,
    ststxbtcAmount: 55n,
    blockTime: at("2026-03-04T00:00:00Z"),
  }),
];

/** The API served on an ephemeral port, over an in-memory database, for the whole file. */
const runtime = ManagedRuntime.make(
  HttpRouter.serve(ApiLayer, { disableListenLog: true, disableLogger: true }).pipe(
    Layer.provideMerge(NodeHttpServer.layerTest),
    Layer.provideMerge(
      indexer.layer({
        database: pglite(),
        migrations: fileURLToPath(new URL("../../drizzle", import.meta.url)),
        handlers: STACKINGDAO_HANDLERS,
      }),
    ),
  ),
);

const makeClient = HttpApiClient.make(Api);
type Client = Effect.Success<typeof makeClient>;

/** Calls the API through the client derived from `Api`, decoding responses. */
const call = <A, E>(f: (client: Client) => Effect.Effect<A, E>) =>
  runtime.runPromise(Effect.flatMap(makeClient, f));

beforeAll(
  () =>
    runtime.runPromise(
      Effect.gen(function* () {
        const db = yield* indexer.Db;
        yield* db.insert(depositTable).values(deposits);
        yield* db.insert(withdrawTable).values(withdrawals);
        yield* db.insert(swapTable).values(swaps);
      }),
    ),
  30_000,
);

afterAll(() => runtime.dispose());

describe("GET /stackingdao/stats", () => {
  it("sums each token's flows, counting only burns as withdrawn", async () => {
    const stats = await call((client) => client.stackingdao.stats());
    expect(stats.asOfBlock).toBeNull();
    expect(stats.tokens).toEqual([
      {
        token: "ststx",
        deposits: 3,
        stakers: 2,
        deposited: "6600",
        withdrawn: "2220",
        minted: "7000",
        burned: "2000",
      },
      {
        token: "ststxbtc",
        deposits: 0,
        stakers: 0,
        deposited: "0",
        withdrawn: "0",
        minted: "0",
        burned: "0",
      },
      {
        token: "stbtc",
        deposits: 1,
        stakers: 1,
        deposited: "100",
        withdrawn: "0",
        minted: "99",
        burned: "0",
      },
    ]);
  });
});

describe("GET /stackingdao/flows", () => {
  it("groups by UTC month and merges deposit-only and withdrawal-only periods", async () => {
    const flows = await call((client) => client.stackingdao.flows({ query: { token: "ststx" } }));
    expect(flows.interval).toBe("month");
    expect(flows.points).toEqual([
      {
        period: "2026-01-01",
        token: "ststx",
        deposited: "1100",
        withdrawn: "0",
        minted: "2000",
        burned: "0",
      },
      {
        period: "2026-02-01",
        token: "ststx",
        deposited: "5500",
        withdrawn: "0",
        minted: "5000",
        burned: "0",
      },
      {
        period: "2026-03-01",
        token: "ststx",
        deposited: "0",
        withdrawn: "2220",
        minted: "0",
        burned: "2000",
      },
    ]);
  });

  it("starts weeks on Monday", async () => {
    const flows = await call((client) =>
      client.stackingdao.flows({ query: { token: "stbtc", interval: "week" } }),
    );
    // 2026-02-10 is a Tuesday.
    expect(flows.points.map((point) => point.period)).toEqual(["2026-02-09"]);
  });
});

describe("GET /stackingdao/stakers", () => {
  it("splits each period's depositors into new and returning", async () => {
    const stakers = await call((client) =>
      client.stackingdao.stakers({ query: { token: "ststx" } }),
    );
    expect(stakers.points).toEqual([
      { period: "2026-01-01", stakers: 2, newStakers: 2 },
      { period: "2026-02-01", stakers: 1, newStakers: 0 },
    ]);
  });
});

describe("GET /stackingdao/withdrawals", () => {
  it("separates instant and standard withdrawals and sums their fees", async () => {
    const withdrawalStats = await call((client) => client.stackingdao.withdrawals({ query: {} }));
    expect(withdrawalStats.points).toEqual([
      {
        period: "2026-03-01",
        token: "ststx",
        instantCount: 1,
        instantAmount: "1120",
        standardCount: 1,
        standardAmount: "1100",
        feeAmount: "14",
      },
    ]);
  });
});

describe("GET /stackingdao/yield", () => {
  it("weights the rate by amount and annualizes its growth", async () => {
    const rates = await call((client) => client.stackingdao.yield({ query: { token: "ststx" } }));
    // init-withdraw (1.10 on Feb 2) and withdraw-idle (1.12 on Mar 1); `withdraw` rows are ignored.
    expect(rates.points).toEqual([
      { period: "2026-02-02", rate: 1.1 },
      { period: "2026-03-01", rate: 1.12 },
    ]);
    expect(rates.apy).toBeCloseTo((1.12 / 1.1) ** (365 / 27) - 1, 10);
  });

  it("has no APY without two days of withdrawals in the last 30", async () => {
    const rates = await call((client) => client.stackingdao.yield({ query: { token: "stbtc" } }));
    expect(rates).toMatchObject({ apy: null, points: [] });
  });
});

describe("GET /stackingdao/swaps", () => {
  it("sums each direction per period", async () => {
    const swapStats = await call((client) => client.stackingdao.swaps({ query: {} }));
    expect(swapStats.points).toEqual([
      {
        period: "2026-03-01",
        action: "swap-ststx-for-ststxbtc",
        count: 2,
        ststxAmount: "300",
        ststxbtcAmount: "330",
      },
      {
        period: "2026-03-01",
        action: "swap-ststxbtc-for-ststx",
        count: 1,
        ststxAmount: "50",
        ststxbtcAmount: "55",
      },
    ]);
  });
});

describe("GET /stackingdao/activity", () => {
  it("pages through every event once, newest first", async () => {
    const seen: string[] = [];
    let cursor: string | null = null;
    do {
      const page = await call((client) =>
        client.stackingdao.activity({
          query: cursor === null ? { limit: 3 } : { limit: 3, cursor },
        }),
      );
      seen.push(...page.items.map((item) => item.txId));
      cursor = page.nextCursor;
    } while (cursor !== null);

    const all = [...deposits, ...withdrawals, ...swaps].toSorted((a, b) =>
      Number(b.blockHeight - a.blockHeight),
    );
    expect(seen).toEqual(all.map((row) => row.txId));
  });

  it("sorts by amount within a token and kind", async () => {
    const page = await call((client) =>
      client.stackingdao.activity({ query: { token: "ststx", kind: "deposit", sort: "amount" } }),
    );
    expect(page.items.map((item) => item.kind === "deposit" && item.tokenAmount)).toEqual([
      "5000",
      "1000",
      "1000",
    ]);
  });

  it("includes swaps for stSTX and stSTXbtc only", async () => {
    const ststxbtc = await call((client) =>
      client.stackingdao.activity({ query: { token: "ststxbtc" } }),
    );
    expect(ststxbtc.items.map((item) => item.kind)).toEqual(["swap", "swap", "swap"]);
    const stbtc = await call((client) =>
      client.stackingdao.activity({ query: { token: "stbtc" } }),
    );
    expect(stbtc.items).toMatchObject([
      { kind: "deposit", token: "stbtc", tokenAmount: "99", underlyingAmount: "100" },
    ]);
  });

  it("rejects sorting by amount across tokens and malformed cursors", async () => {
    const unsorted = await call((client) =>
      client.stackingdao.activity({ query: { sort: "amount", kind: "deposit" } }).pipe(Effect.flip),
    );
    expect(unsorted).toMatchObject({ _tag: "InvalidQuery" });
    const badCursor = await call((client) =>
      client.stackingdao.activity({ query: { cursor: "not-a-cursor" } }).pipe(Effect.flip),
    );
    expect(badCursor).toMatchObject({ _tag: "InvalidQuery" });
  });
});
