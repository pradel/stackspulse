import { Schema } from "effect";
import {
  HttpApi,
  HttpApiEndpoint,
  HttpApiError,
  HttpApiGroup,
  HttpApiSchema,
} from "effect/http-api";

/*
 * Amounts are integer strings in base units: STX (stSTX, stSTXbtc) and the
 * liquid tokens have 6 decimals, sBTC and stBTC 8. Periods are the UTC start
 * date (`YYYY-MM-DD`) of the day, week (Monday) or month. `asOfBlock` is the
 * block through which every event has been indexed, `null` before the first.
 */

export const Token = Schema.Literals(["ststx", "ststxbtc", "stbtc"]);
export type Token = typeof Token.Type;

export const Interval = Schema.Literals(["day", "week", "month"]);
export type Interval = typeof Interval.Type;

export const SwapAction = Schema.Literals(["swap-ststx-for-ststxbtc", "swap-ststxbtc-for-ststx"]);

const Amount = Schema.String.annotate({ description: "Integer amount in base units." });
const Count = Schema.Int;
const Period = Schema.String.annotate({ description: "UTC start date of the period, YYYY-MM-DD." });
const AsOfBlock = Schema.NullOr(Schema.Int);

/** A request whose query parameters are valid one by one but not together. */
export const InvalidQuery = Schema.Struct({
  _tag: Schema.tag("InvalidQuery"),
  message: Schema.String,
}).pipe(HttpApiSchema.status(400));

/** The Hiro API or CoinGecko failed or answered with an unexpected body. */
export const UpstreamError = Schema.Struct({
  _tag: Schema.tag("UpstreamError"),
  message: Schema.String,
}).pipe(HttpApiSchema.status(502));

// --- StackingDAO ---

const TokenStats = Schema.Struct({
  token: Token,
  deposits: Count,
  stakers: Count,
  /** STX or sBTC deposited; `core-v1` stSTX deposits print no STX amount and are left out. */
  deposited: Amount,
  /** STX or sBTC withdrawn, gross before fees, by `withdraw` and `withdraw-idle`. */
  withdrawn: Amount,
  minted: Amount,
  burned: Amount,
});

const FlowPoint = Schema.Struct({
  period: Period,
  token: Token,
  deposited: Amount,
  withdrawn: Amount,
  minted: Amount,
  burned: Amount,
});

const StakersPoint = Schema.Struct({
  period: Period,
  /** Addresses that deposited in the period. */
  stakers: Count,
  /** Of those, the addresses whose first deposit is in the period. */
  newStakers: Count,
});

const YieldPoint = Schema.Struct({
  period: Period,
  /** STX per stSTX or sBTC per stBTC, weighted by amount. */
  rate: Schema.Finite,
});

const WithdrawalsPoint = Schema.Struct({
  period: Period,
  token: Token,
  /** `withdraw-idle`: paid out at once. */
  instantCount: Count,
  instantAmount: Amount,
  /** `withdraw`: paid out after the unstaking delay. */
  standardCount: Count,
  standardAmount: Amount,
  /** Fees printed by the contracts that report them. */
  feeAmount: Amount,
});

const SwapsPoint = Schema.Struct({
  period: Period,
  action: SwapAction,
  count: Count,
  ststxAmount: Amount,
  ststxbtcAmount: Amount,
});

const ActivityBase = {
  txId: Schema.String,
  eventIndex: Schema.Int,
  blockHeight: Schema.Int,
  blockTime: Schema.Int,
};

export const ActivityItem = Schema.Union([
  Schema.Struct({
    ...ActivityBase,
    kind: Schema.Literal("deposit"),
    token: Token,
    address: Schema.String,
    tokenAmount: Amount,
    underlyingAmount: Schema.NullOr(Amount),
  }),
  Schema.Struct({
    ...ActivityBase,
    kind: Schema.Literal("withdraw"),
    action: Schema.Literals(["init-withdraw", "cancel-withdraw", "withdraw", "withdraw-idle"]),
    token: Token,
    address: Schema.String,
    tokenAmount: Amount,
    underlyingAmount: Schema.NullOr(Amount),
  }),
  Schema.Struct({
    ...ActivityBase,
    kind: Schema.Literal("swap"),
    action: SwapAction,
    address: Schema.String,
    ststxAmount: Amount,
    ststxbtcAmount: Amount,
  }),
]);
export type ActivityItem = typeof ActivityItem.Type;

const TokenQuery = Schema.optionalKey(Token);
const IntervalQuery = Schema.optionalKey(Interval);

export const StackingDaoGroup = HttpApiGroup.make("stackingdao")
  .add(
    HttpApiEndpoint.get("stats", "/stackingdao/stats", {
      success: Schema.Struct({ asOfBlock: AsOfBlock, tokens: Schema.Array(TokenStats) }),
    }),
  )
  .add(
    HttpApiEndpoint.get("flows", "/stackingdao/flows", {
      query: { token: TokenQuery, interval: IntervalQuery },
      success: Schema.Struct({
        asOfBlock: AsOfBlock,
        interval: Interval,
        points: Schema.Array(FlowPoint),
      }),
    }),
  )
  .add(
    HttpApiEndpoint.get("stakers", "/stackingdao/stakers", {
      query: { token: TokenQuery, interval: IntervalQuery },
      success: Schema.Struct({
        asOfBlock: AsOfBlock,
        interval: Interval,
        points: Schema.Array(StakersPoint),
      }),
    }),
  )
  .add(
    HttpApiEndpoint.get("yield", "/stackingdao/yield", {
      query: { token: Schema.Literals(["ststx", "stbtc"]), interval: IntervalQuery },
      success: Schema.Struct({
        asOfBlock: AsOfBlock,
        token: Schema.Literals(["ststx", "stbtc"]),
        interval: Interval,
        /** Annualized growth of the rate over the last 30 days; `null` without enough data. */
        apy: Schema.NullOr(Schema.Finite),
        points: Schema.Array(YieldPoint),
      }),
    }),
  )
  .add(
    HttpApiEndpoint.get("withdrawals", "/stackingdao/withdrawals", {
      query: { token: TokenQuery, interval: IntervalQuery },
      success: Schema.Struct({
        asOfBlock: AsOfBlock,
        interval: Interval,
        points: Schema.Array(WithdrawalsPoint),
      }),
    }),
  )
  .add(
    HttpApiEndpoint.get("swaps", "/stackingdao/swaps", {
      query: { interval: IntervalQuery },
      success: Schema.Struct({
        asOfBlock: AsOfBlock,
        interval: Interval,
        points: Schema.Array(SwapsPoint),
      }),
    }),
  )
  .add(
    HttpApiEndpoint.get("activity", "/stackingdao/activity", {
      query: {
        kind: Schema.optionalKey(Schema.Literals(["deposit", "withdraw", "swap"])),
        token: TokenQuery,
        /** Unix seconds; only events at or after this time. */
        since: Schema.optionalKey(Schema.Int),
        /** `amount` sorts by token amount and needs `token` and a `deposit` or `withdraw` `kind`. */
        sort: Schema.optionalKey(Schema.Literals(["recent", "amount"])),
        limit: Schema.optionalKey(
          Schema.Int.check(Schema.isGreaterThanOrEqualTo(1), Schema.isLessThanOrEqualTo(100)),
        ),
        cursor: Schema.optionalKey(Schema.String),
      },
      success: Schema.Struct({
        asOfBlock: AsOfBlock,
        items: Schema.Array(ActivityItem),
        /** Pass as `cursor` for the next page; `null` on the last page. */
        nextCursor: Schema.NullOr(Schema.String),
      }),
      error: InvalidQuery,
    }),
  );

// --- Tokens ---

export const TokenHolders = Schema.Struct({
  total_supply: Schema.String,
  total: Schema.Int,
  results: Schema.Array(Schema.Struct({ address: Schema.String, balance: Schema.String })),
});

export const TokenMarket = Schema.Struct({
  id: Schema.String,
  symbol: Schema.String,
  name: Schema.String,
  image: Schema.String,
  current_price: Schema.NullOr(Schema.Finite),
  market_cap: Schema.NullOr(Schema.Finite),
  price_change_percentage_24h: Schema.NullOr(Schema.Finite),
});

export const ResolvedToken = Schema.Struct({
  id: Schema.String,
  symbol: Schema.String,
  name: Schema.String,
  contract_address: Schema.NullOr(Schema.String),
});

export const TokensGroup = HttpApiGroup.make("tokens")
  .add(
    HttpApiEndpoint.get("holders", "/tokens/holders", {
      query: {
        /** Fungible token asset identifier, `<contract>::<asset>`. */
        token: Schema.String,
        limit: Schema.optionalKey(
          Schema.Int.check(Schema.isGreaterThanOrEqualTo(1), Schema.isLessThanOrEqualTo(100)),
        ),
        offset: Schema.optionalKey(Schema.Int.check(Schema.isGreaterThanOrEqualTo(0))),
      },
      success: TokenHolders,
      error: UpstreamError,
    }),
  )
  .add(
    HttpApiEndpoint.get("markets", "/tokens/markets", {
      success: Schema.Array(TokenMarket),
      error: UpstreamError,
    }),
  )
  .add(
    HttpApiEndpoint.get("resolve", "/tokens/resolve", {
      /** CoinGecko coin id. */
      query: { id: Schema.String },
      success: ResolvedToken,
      error: [HttpApiError.NotFound, UpstreamError],
    }),
  );

// --- Status ---

export const StatusGroup = HttpApiGroup.make("status").add(
  HttpApiEndpoint.get("status", "/status", {
    success: Schema.Struct({
      phase: Schema.Literals(["idle", "backfill", "live", "done", "failed"]),
      /** True once the historical backfill finished. */
      ready: Schema.Boolean,
      checkpoint: Schema.NullOr(
        Schema.Struct({
          blockHeight: Schema.Int,
          blockTime: Schema.Int,
          finalizedBlockHeight: Schema.Int,
        }),
      ),
      /** Chain tip read at the start of the latest pass. */
      chainTip: Schema.NullOr(Schema.Int),
    }),
  }),
);

export const Api = HttpApi.make("stackspulse")
  .add(StackingDaoGroup)
  .add(TokensGroup)
  .add(StatusGroup);
