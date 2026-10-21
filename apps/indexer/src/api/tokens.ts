import { Cache, Config, Duration, Effect, Exit, Option, Schema } from "effect";
import { HttpClient, HttpClientRequest, HttpClientResponse } from "effect/http";
import { HttpApiBuilder, HttpApiError } from "effect/http-api";

import { Api, ResolvedToken, TokenHolders, TokenMarket, UpstreamError } from "./api.ts";

const CoinGeckoCoin = Schema.Struct({
  id: Schema.String,
  symbol: Schema.String,
  name: Schema.String,
  contract_address: Schema.optionalKey(Schema.NullOr(Schema.String)),
  platforms: Schema.optionalKey(Schema.Record(Schema.String, Schema.NullOr(Schema.String))),
});

/** Caches successes for `ttl`; failures are retried on the next request. */
const cached = <Key, A, E>(ttl: Duration.Input, lookup: (key: Key) => Effect.Effect<A, E>) =>
  Cache.makeWith(lookup, {
    capacity: 1000,
    timeToLive: (exit) => (Exit.isSuccess(exit) ? ttl : Duration.zero),
  });

const toUpstreamError = (service: string) => (error: { readonly message: string }) =>
  UpstreamError.make({ message: `${service}: ${error.message}` });

export const TokensHandlers = HttpApiBuilder.group(Api, "tokens", (handlers) =>
  Effect.gen(function* () {
    const client = yield* HttpClient.HttpClient;
    const hiroApiKey = yield* Config.option(Config.String("HIRO_API_KEY"));
    const coingeckoApiKey = yield* Config.option(Config.String("COINGECKO_API_KEY"));

    const hiro = client.pipe(
      HttpClient.mapRequest((request) =>
        request.pipe(
          HttpClientRequest.prependUrl("https://api.hiro.so"),
          HttpClientRequest.acceptJson,
          Option.match(hiroApiKey, {
            onNone: () => (r: HttpClientRequest.HttpClientRequest) => r,
            onSome: (key) => HttpClientRequest.setHeader("x-api-key", key),
          }),
        ),
      ),
      HttpClient.filterStatusOk,
    );

    const coingecko = client.pipe(
      HttpClient.mapRequest((request) =>
        request.pipe(
          HttpClientRequest.prependUrl("https://api.coingecko.com/api/v3"),
          HttpClientRequest.acceptJson,
          Option.match(coingeckoApiKey, {
            onNone: () => (r: HttpClientRequest.HttpClientRequest) => r,
            onSome: (key) => HttpClientRequest.setHeader("x-cg-demo-api-key", key),
          }),
        ),
      ),
      HttpClient.filterStatusOk,
    );

    const holders = yield* cached("15 minutes", (key: string) => {
      const { token, limit, offset } = JSON.parse(key) as {
        token: string;
        limit: number;
        offset: number;
      };
      return hiro
        .get(`/extended/v1/tokens/ft/${encodeURIComponent(token)}/holders`, {
          urlParams: { limit, offset },
        })
        .pipe(
          Effect.flatMap(HttpClientResponse.schemaBodyJson(TokenHolders)),
          Effect.mapError(toUpstreamError("Hiro API")),
        );
    });

    const markets = yield* cached("24 hours", () =>
      coingecko
        .get("/coins/markets", { urlParams: { vs_currency: "usd", category: "stacks-ecosystem" } })
        .pipe(
          Effect.flatMap(HttpClientResponse.schemaBodyJson(Schema.Array(TokenMarket))),
          Effect.mapError(toUpstreamError("CoinGecko")),
        ),
    );

    const resolve = yield* cached("3 days", (id: string) =>
      coingecko.get(`/coins/${encodeURIComponent(id)}`).pipe(
        Effect.flatMap(HttpClientResponse.schemaBodyJson(CoinGeckoCoin)),
        Effect.map((coin): typeof ResolvedToken.Type => ({
          id: coin.id,
          symbol: coin.symbol,
          name: coin.name,
          contract_address: coin.platforms?.stacks || coin.contract_address || null,
        })),
        Effect.mapError((error): HttpApiError.NotFound | typeof UpstreamError.Type =>
          error._tag === "HttpClientError" && error.response?.status === 404
            ? new HttpApiError.NotFound()
            : toUpstreamError("CoinGecko")(error),
        ),
      ),
    );

    return handlers.handleAll({
      holders: ({ query: { token, limit = 20, offset = 0 } }) =>
        Cache.get(holders, JSON.stringify({ token, limit, offset })),
      markets: () => Cache.get(markets, "markets"),
      resolve: ({ query: { id } }) => Cache.get(resolve, id),
    });
  }),
);
