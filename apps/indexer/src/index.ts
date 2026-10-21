import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { Cause, Effect, Exit, Fiber } from "effect";
import { Indexer, pglite } from "stacksindex/effect";

import { indexer } from "./indexer.ts";
import { STACKINGDAO_HANDLERS } from "./protocols/stackingdao/index.ts";

export * from "./schema.ts";
export * from "./protocols/stackingdao/index.ts";

const apiKey = process.env.HIRO_API_KEY;
const dataDir = process.env.DATA_DIR ?? "./data";
const migrationsFolder = fileURLToPath(new URL("../drizzle", import.meta.url));

fs.mkdirSync(dataDir, { recursive: true });

const program = Effect.gen(function* () {
  const app = yield* Indexer;

  yield* Effect.logInfo("Starting StackingDAO historical indexer").pipe(
    Effect.annotateLogs({
      contracts: Object.values(indexer.contracts).map(({ id, startBlock }) => ({ id, startBlock })),
    }),
  );

  yield* app.run;
});

const fiber = Effect.runFork(
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
  ),
);

let isShuttingDown = false;

async function shutdown(code: number) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  await Effect.runPromise(Fiber.interrupt(fiber));
  process.exit(code);
}

process.on("SIGINT", () => {
  // oxlint-disable-next-line eslint/no-void
  void shutdown(0);
});

process.on("SIGTERM", () => {
  // oxlint-disable-next-line eslint/no-void
  void shutdown(0);
});

const exit = await Effect.runPromise(Fiber.await(fiber));

if (Exit.isFailure(exit) && !Cause.hasInterruptsOnly(exit.cause)) {
  Effect.runSync(Effect.logError("Error running historical sync", Cause.squash(exit.cause)));

  await shutdown(1);
} else {
  await shutdown(0);
}
