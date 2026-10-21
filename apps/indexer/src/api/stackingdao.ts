import { type SQL, sql } from "drizzle-orm";
import { Effect, Schema } from "effect";
import { HttpApiBuilder } from "effect/http-api";
import { Indexer } from "stacksindex/effect";

import { indexer } from "../indexer.ts";
import { type ActivityItem, Api, type Interval, InvalidQuery, type Token } from "./api.ts";

const TOKENS: readonly Token[] = ["ststx", "ststxbtc", "stbtc"];

/** Withdrawal steps that burn the token; `init-withdraw` and `cancel-withdraw` only lock it. */
const BURNING_ACTIONS = sql`('withdraw', 'withdraw-idle')`;

/** UTC start date of the `interval` containing a Unix-seconds column. */
const periodOf = (interval: Interval, blockTime: SQL) =>
  sql`to_char(date_trunc(${interval}, to_timestamp(${blockTime}) at time zone 'UTC'), 'YYYY-MM-DD')`;

const where = (conditions: readonly (SQL | undefined)[]) => {
  const defined = conditions.filter((condition) => condition !== undefined);
  return defined.length === 0 ? sql`` : sql`where ${sql.join(defined, sql` and `)}`;
};

/** Runs a read on the indexer database; a failing query is a defect, answered with a 500. */
const query = <Row extends Record<string, unknown>>(statement: SQL) =>
  Effect.gen(function* () {
    const db = yield* indexer.Db;
    return yield* db.execute<Row>(statement, "objects");
  }).pipe(Effect.orDie);

const asOfBlock = Effect.gen(function* () {
  const status = yield* (yield* Indexer).status;
  return status.checkpoint?.blockHeight ?? null;
}).pipe(Effect.orDie);

// --- Yield ---

const ratesByPeriod = (token: "ststx" | "stbtc", interval: Interval) =>
  query<{ period: string; rate: number }>(sql`
    select ${periodOf(interval, sql`block_time`)} as period,
      (sum(underlying_amount)::numeric / sum(token_amount))::float8 as rate
    from withdraw
    where token = ${token}
      and action in ('init-withdraw', 'withdraw-idle')
      and underlying_amount is not null
      and token_amount > 0
    group by 1
    order by 1
  `);

const DAY_MS = 86_400_000;

/**
 * Annualized growth of the daily rate between the last day and the earliest
 * day at most 30 days before it; `null` with fewer than two such days.
 */
const trailingApy = (daily: readonly { period: string; rate: number }[]): number | null => {
  const last = daily.at(-1);
  if (last === undefined) return null;
  const lastTime = Date.parse(last.period);
  const first = daily.find((point) => lastTime - Date.parse(point.period) <= 30 * DAY_MS);
  if (first === undefined || first === last) return null;
  const days = (lastTime - Date.parse(first.period)) / DAY_MS;
  return (last.rate / first.rate) ** (365 / days) - 1;
};

// --- Activity ---

const Cursor = Schema.Struct({
  sort: Schema.Literals(["recent", "amount"]),
  /** Block height for `recent`, token amount for `amount`. */
  key: Schema.String.check(Schema.isPattern(/^\d+$/)),
  txId: Schema.String,
  eventIndex: Schema.Int,
});
type Cursor = typeof Cursor.Type;

const encodeCursor = (cursor: Cursor) => Buffer.from(JSON.stringify(cursor)).toString("base64url");

const decodeCursor = (value: string) =>
  Effect.try({
    try: () => JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as unknown,
    catch: () => InvalidQuery.make({ message: "Invalid cursor." }),
  }).pipe(
    Effect.flatMap((json) =>
      Schema.decodeUnknownEffect(Cursor)(json).pipe(
        Effect.mapError(() => InvalidQuery.make({ message: "Invalid cursor." })),
      ),
    ),
  );

interface ActivityRow extends Record<string, unknown> {
  kind: "deposit" | "withdraw" | "swap";
  action: string;
  token: Token | null;
  txId: string;
  eventIndex: number;
  address: string;
  tokenAmount: string | null;
  underlyingAmount: string | null;
  ststxAmount: string | null;
  ststxbtcAmount: string | null;
  blockHeight: number;
  blockTime: number;
}

const toActivityItem = (row: ActivityRow): ActivityItem => {
  const base = {
    txId: row.txId,
    eventIndex: row.eventIndex,
    blockHeight: row.blockHeight,
    blockTime: row.blockTime,
    address: row.address,
  };
  switch (row.kind) {
    case "deposit":
      return {
        ...base,
        kind: "deposit",
        token: row.token as Token,
        tokenAmount: row.tokenAmount as string,
        underlyingAmount: row.underlyingAmount,
      };
    case "withdraw":
      return {
        ...base,
        kind: "withdraw",
        action: row.action as "init-withdraw" | "cancel-withdraw" | "withdraw" | "withdraw-idle",
        token: row.token as Token,
        tokenAmount: row.tokenAmount as string,
        underlyingAmount: row.underlyingAmount,
      };
    case "swap":
      return {
        ...base,
        kind: "swap",
        action: row.action as "swap-ststx-for-ststxbtc" | "swap-ststxbtc-for-ststx",
        ststxAmount: row.ststxAmount as string,
        ststxbtcAmount: row.ststxbtcAmount as string,
      };
  }
};

export const StackingDaoHandlers = HttpApiBuilder.group(Api, "stackingdao", (handlers) =>
  handlers.handleAll({
    stats: () =>
      Effect.gen(function* () {
        const deposits = yield* query<{
          token: Token;
          deposits: number;
          stakers: number;
          deposited: string;
          minted: string;
        }>(sql`
          select token, count(*)::int as deposits, count(distinct stacker)::int as stakers,
            coalesce(sum(underlying_amount), 0)::text as deposited,
            coalesce(sum(token_amount), 0)::text as minted
          from deposit
          group by token
        `);
        const burns = yield* query<{ token: Token; withdrawn: string; burned: string }>(sql`
          select token,
            coalesce(sum(underlying_amount), 0)::text as withdrawn,
            coalesce(sum(token_amount), 0)::text as burned
          from withdraw
          where action in ${BURNING_ACTIONS}
          group by token
        `);

        return {
          asOfBlock: yield* asOfBlock,
          tokens: TOKENS.map((token) => {
            const deposit = deposits.find((row) => row.token === token);
            const burn = burns.find((row) => row.token === token);
            return {
              token,
              deposits: deposit?.deposits ?? 0,
              stakers: deposit?.stakers ?? 0,
              deposited: deposit?.deposited ?? "0",
              withdrawn: burn?.withdrawn ?? "0",
              minted: deposit?.minted ?? "0",
              burned: burn?.burned ?? "0",
            };
          }),
        };
      }),

    flows: ({ query: { token, interval = "month" } }) =>
      Effect.gen(function* () {
        const tokenFilter = token === undefined ? undefined : sql`token = ${token}`;
        const points = yield* query<{
          period: string;
          token: Token;
          deposited: string;
          withdrawn: string;
          minted: string;
          burned: string;
        }>(sql`
          with deposits as (
            select ${periodOf(interval, sql`block_time`)} as period, token,
              sum(underlying_amount) as deposited, sum(token_amount) as minted
            from deposit ${where([tokenFilter])}
            group by 1, 2
          ), burns as (
            select ${periodOf(interval, sql`block_time`)} as period, token,
              sum(underlying_amount) as withdrawn, sum(token_amount) as burned
            from withdraw ${where([sql`action in ${BURNING_ACTIONS}`, tokenFilter])}
            group by 1, 2
          )
          select period, token,
            coalesce(deposited, 0)::text as deposited, coalesce(withdrawn, 0)::text as withdrawn,
            coalesce(minted, 0)::text as minted, coalesce(burned, 0)::text as burned
          from deposits full join burns using (period, token)
          order by period, token
        `);

        return { asOfBlock: yield* asOfBlock, interval, points };
      }),

    stakers: ({ query: { token, interval = "month" } }) =>
      Effect.gen(function* () {
        const tokenFilter = where([token === undefined ? undefined : sql`token = ${token}`]);
        const points = yield* query<{ period: string; stakers: number; newStakers: number }>(sql`
          with first_deposits as (
            select stacker, ${periodOf(interval, sql`min(block_time)`)} as first_period
            from deposit ${tokenFilter}
            group by stacker
          ), active as (
            select distinct ${periodOf(interval, sql`block_time`)} as period, stacker
            from deposit ${tokenFilter}
          )
          select period, count(*)::int as stakers,
            (count(*) filter (where first_period = period))::int as "newStakers"
          from active join first_deposits using (stacker)
          group by period
          order by period
        `);

        return { asOfBlock: yield* asOfBlock, interval, points };
      }),

    yield: ({ query: { token, interval = "day" } }) =>
      Effect.gen(function* () {
        const daily = yield* ratesByPeriod(token, "day");
        const points = interval === "day" ? daily : yield* ratesByPeriod(token, interval);

        return { asOfBlock: yield* asOfBlock, token, interval, apy: trailingApy(daily), points };
      }),

    withdrawals: ({ query: { token, interval = "month" } }) =>
      Effect.gen(function* () {
        const points = yield* query<{
          period: string;
          token: Token;
          instantCount: number;
          instantAmount: string;
          standardCount: number;
          standardAmount: string;
          feeAmount: string;
        }>(sql`
          select ${periodOf(interval, sql`block_time`)} as period, token,
            (count(*) filter (where action = 'withdraw-idle'))::int as "instantCount",
            coalesce(sum(underlying_amount) filter (where action = 'withdraw-idle'), 0)::text as "instantAmount",
            (count(*) filter (where action = 'withdraw'))::int as "standardCount",
            coalesce(sum(underlying_amount) filter (where action = 'withdraw'), 0)::text as "standardAmount",
            coalesce(sum(fee_amount), 0)::text as "feeAmount"
          from withdraw
          ${where([sql`action in ${BURNING_ACTIONS}`, token === undefined ? undefined : sql`token = ${token}`])}
          group by 1, 2
          order by 1, 2
        `);

        return { asOfBlock: yield* asOfBlock, interval, points };
      }),

    swaps: ({ query: { interval = "month" } }) =>
      Effect.gen(function* () {
        const points = yield* query<{
          period: string;
          action: "swap-ststx-for-ststxbtc" | "swap-ststxbtc-for-ststx";
          count: number;
          ststxAmount: string;
          ststxbtcAmount: string;
        }>(sql`
          select ${periodOf(interval, sql`block_time`)} as period, action, count(*)::int as count,
            sum(ststx_amount)::text as "ststxAmount", sum(ststxbtc_amount)::text as "ststxbtcAmount"
          from swap
          group by 1, 2
          order by 1, 2
        `);

        return { asOfBlock: yield* asOfBlock, interval, points };
      }),

    activity: ({ query: { kind, token, since, sort = "recent", limit = 25, cursor } }) =>
      Effect.gen(function* () {
        if (sort === "amount" && (token === undefined || kind === undefined || kind === "swap")) {
          return yield* Effect.fail(
            InvalidQuery.make({
              message: "sort=amount needs a token and kind=deposit or kind=withdraw.",
            }),
          );
        }

        const after = cursor === undefined ? undefined : yield* decodeCursor(cursor);
        if (after !== undefined && after.sort !== sort) {
          return yield* Effect.fail(
            InvalidQuery.make({ message: "The cursor was issued for another sort." }),
          );
        }

        const sortKey = sort === "recent" ? sql`block_height` : sql`token_amount`;
        const rows = yield* query<ActivityRow & { sortKey: string }>(sql`
          select kind, action, token, tx_id as "txId", event_index::int as "eventIndex",
            address, token_amount::text as "tokenAmount", underlying_amount::text as "underlyingAmount",
            ststx_amount::text as "ststxAmount", ststxbtc_amount::text as "ststxbtcAmount",
            block_height::int as "blockHeight", block_time::int as "blockTime",
            ${sortKey}::text as "sortKey"
          from (
            select 'deposit' as kind, 'deposit' as action, token, tx_id, event_index, stacker as address,
              token_amount, underlying_amount, null::bigint as ststx_amount, null::bigint as ststxbtc_amount,
              block_height, block_time
            from deposit
            union all
            select 'withdraw', action, token, tx_id, event_index, stacker,
              token_amount, underlying_amount, null, null, block_height, block_time
            from withdraw
            union all
            select 'swap', action, null, tx_id, event_index, "user",
              null, null, ststx_amount, ststxbtc_amount, block_height, block_time
            from swap
          ) as activity
          ${where([
            kind === undefined ? undefined : sql`kind = ${kind}`,
            token === undefined
              ? undefined
              : token === "stbtc"
                ? sql`token = ${token}`
                : // stSTX and stSTXbtc both take part in every swap.
                  sql`(token = ${token} or kind = 'swap')`,
            since === undefined ? undefined : sql`block_time >= ${since}`,
            after === undefined
              ? undefined
              : sql`(${sortKey}, tx_id, event_index) < (${after.key}::bigint, ${after.txId}, ${after.eventIndex})`,
          ])}
          order by ${sortKey} desc, tx_id desc, event_index desc
          limit ${limit + 1}
        `);

        const page = rows.slice(0, limit);
        const last = page.at(-1);

        return {
          asOfBlock: yield* asOfBlock,
          items: page.map(toActivityItem),
          nextCursor:
            rows.length > limit && last !== undefined
              ? encodeCursor({
                  sort,
                  key: last.sortKey,
                  txId: last.txId,
                  eventIndex: last.eventIndex,
                })
              : null,
        };
      }),
  }),
);
