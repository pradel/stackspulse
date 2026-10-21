import { Effect, Layer } from "effect";
import { FetchHttpClient, HttpRouter } from "effect/http";
import { HttpApiBuilder, HttpApiScalar } from "effect/http-api";
import { Indexer } from "stacksindex/effect";

import { Api } from "./api.ts";
import { StackingDaoHandlers } from "./stackingdao.ts";
import { TokensHandlers } from "./tokens.ts";

const StatusHandlers = HttpApiBuilder.group(Api, "status", (handlers) =>
  handlers.handle("status", () =>
    Effect.gen(function* () {
      const status = yield* (yield* Indexer).status;
      return {
        phase: status.phase,
        ready: status.ready,
        checkpoint: status.checkpoint,
        chainTip: status.anchor?.blockHeight ?? null,
      };
    }).pipe(Effect.orDie),
  ),
);

/**
 * The HTTP API, with interactive docs at `/docs`. It reads the indexer
 * database, so it needs `Indexer` and `IndexerDatabase` from `indexer.layer`
 * and runs in the indexer process: PGlite allows one process per database.
 */
export const ApiLayer = HttpApiBuilder.layer(Api).pipe(
  Layer.provide([StackingDaoHandlers, TokensHandlers, StatusHandlers]),
  Layer.provide(HttpApiScalar.layer(Api)),
  Layer.provide(HttpRouter.cors({ allowedMethods: ["GET"] })),
  Layer.provide(FetchHttpClient.layer),
);
