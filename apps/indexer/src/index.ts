import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { createDatabase, createHistoricalRuntime, createLogger } from "stacksindex";

import {
  createStackingDaoHandler,
  STACKINGDAO_CONTRACTS,
  STACKINGDAO_START_BLOCKS,
} from "./protocols/stackingdao/index.ts";

export * from "./schema.ts";
export * from "./protocols/stackingdao/index.ts";

const apiKey = process.env.HIRO_API_KEY;
const dataDir = process.env.DATA_DIR ?? "./data";

fs.mkdirSync(dataDir, { recursive: true });

const appClient = new PGlite(path.join(dataDir, "app.db"));
await appClient.waitReady;
const appDb = drizzle({ client: appClient });

const migrationsFolder = fileURLToPath(new URL("../drizzle", import.meta.url));
await migrate(appDb, { migrationsFolder });

const indexerDatabase = await createDatabase({
  kind: "pglite",
  directory: path.join(dataDir, "indexer.db"),
});

const logger = createLogger({
  level: 2,
});

let isShuttingDown = false;
async function shutdown(code: number) {
  if (isShuttingDown) {
    return;
  }
  isShuttingDown = true;
  try {
    await appClient.close();
  } catch {
    // Ignore error on close
  }
  try {
    await indexerDatabase.close();
  } catch {
    // Ignore error on close
  }
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

const runtime = createHistoricalRuntime({
  logger,
  db: indexerDatabase.db,
  network: "mainnet",
  api: { apiKey },
});

const stackingDaoHandler = createStackingDaoHandler({ db: appDb, logger });

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

const result = await runtime.run(contracts);

if (result.isErr()) {
  logger.error({ msg: "Error running historical sync", error: result.error });
  await shutdown(1);
} else {
  logger.info({ msg: "Historical sync finished successfully" });
  await shutdown(0);
}
