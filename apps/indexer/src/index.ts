import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { Cause, Effect, Exit, Fiber } from "effect";
import { createHistoricalRuntime, createLogger, makeDatabase } from "stacksindex";

import {
  createStackingDaoHandler,
  STACKINGDAO_CONTRACTS,
  STACKINGDAO_START_BLOCKS,
} from "./protocols/stackingdao/index.ts";

export * from "./schema.ts";
export * from "./protocols/stackingdao/index.ts";

const apiKey = process.env.HIRO_API_KEY;
const dataDir = process.env.DATA_DIR ?? "./data";
const migrationsFolder = fileURLToPath(new URL("../drizzle", import.meta.url));

const logger = createLogger({
  level: 2,
});

const program = Effect.gen(function* () {
  yield* Effect.sync(() => {
    fs.mkdirSync(dataDir, { recursive: true });
  });

  const appDatabase = yield* makeDatabase({
    kind: "pglite",
    directory: path.join(dataDir, "app.db"),
  });

  yield* appDatabase.migrate({ migrationsFolder });

  const indexerDatabase = yield* makeDatabase({
    kind: "pglite",
    directory: path.join(dataDir, "indexer.db"),
  });

  const runtime = createHistoricalRuntime({
    logger,
    db: indexerDatabase.db,
    network: "mainnet",
    api: { apiKey },
  });

  const stackingDaoHandler = createStackingDaoHandler({ db: appDatabase.db, logger });

  const contracts = [
    {
      contractId: STACKINGDAO_CONTRACTS.CORE_V1,
      startBlock: STACKINGDAO_START_BLOCKS[STACKINGDAO_CONTRACTS.CORE_V1],
      handler: stackingDaoHandler,
    },
    {
      contractId: STACKINGDAO_CONTRACTS.CORE_V2,
      startBlock: STACKINGDAO_START_BLOCKS[STACKINGDAO_CONTRACTS.CORE_V2],
      handler: stackingDaoHandler,
    },
    {
      contractId: STACKINGDAO_CONTRACTS.CORE_V3,
      startBlock: STACKINGDAO_START_BLOCKS[STACKINGDAO_CONTRACTS.CORE_V3],
      handler: stackingDaoHandler,
    },
    {
      contractId: STACKINGDAO_CONTRACTS.CORE_V4,
      startBlock: STACKINGDAO_START_BLOCKS[STACKINGDAO_CONTRACTS.CORE_V4],
      handler: stackingDaoHandler,
    },
  ];

  logger.info({
    msg: "Starting StackingDAO historical indexer",
    contracts: contracts.map((c) => ({ contractId: c.contractId, startBlock: c.startBlock })),
  });

  yield* runtime.run(contracts);
});

const fiber = Effect.runFork(Effect.scoped(program));

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
  const error = Cause.squash(exit.cause);

  logger.error({
    msg: "Error running historical sync",
    error: error instanceof Error ? error : new Error(String(error)),
  });

  await shutdown(1);
} else {
  logger.info({ msg: "Historical sync finished successfully" });
  await shutdown(0);
}
