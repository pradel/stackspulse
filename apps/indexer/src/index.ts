import fs from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import { Config, Effect, Layer } from "effect";
import { HttpRouter } from "effect/http";
import { Indexer, pglite } from "stacksindex/effect";

import { ApiLayer } from "./api/server.ts";
import { indexer } from "./indexer.ts";
import { STACKINGDAO_HANDLERS } from "./protocols/stackingdao/index.ts";

export * from "./schema.ts";
export * from "./protocols/stackingdao/index.ts";

const apiKey = process.env.HIRO_API_KEY;
const dataDir = process.env.DATA_DIR ?? "./data";
const migrationsFolder = fileURLToPath(new URL("../drizzle", import.meta.url));

fs.mkdirSync(dataDir, { recursive: true });

const HttpServerLayer = HttpRouter.serve(ApiLayer).pipe(
  Layer.provide(
    NodeHttpServer.layerConfig(createServer, {
      port: Config.Port("PORT").pipe(Config.withDefault(3001)),
    }),
  ),
);

/** Follows the chain and serves the API until interrupted; either failing stops both. */
const program = Effect.gen(function* () {
  const app = yield* Indexer;

  yield* Effect.logInfo("Starting StackingDAO indexer and API").pipe(
    Effect.annotateLogs({
      contracts: Object.values(indexer.contracts).map(({ id, startBlock }) => ({ id, startBlock })),
    }),
  );

  yield* Effect.all([app.live, Layer.launch(HttpServerLayer)], { concurrency: "unbounded" });
});

program.pipe(
  Effect.provide(
    /*
     * One database holds the indexer's tables (`stacksindex` schema) and the
     * app's tables (`public`, from the `../drizzle` migrations), so handler
     * writes through `indexer.Db` commit with the indexing checkpoint.
     */
    indexer.layer({
      database: pglite(path.join(dataDir, "indexer.db")),
      migrations: migrationsFolder,
      chain: "mainnet",
      api: { apiKey },
      logLevel: "Info",
      handlers: STACKINGDAO_HANDLERS,
    }),
  ),
  NodeRuntime.runMain,
);
