import type { PgliteDatabase } from "drizzle-orm/pglite";
import { decodeHex, type EventHandler, type Logger } from "stacksindex";

import { depositTable, withdrawTable } from "../../schema.ts";
import { CHAIN_ID } from "./contracts.ts";
import { stackingDaoLogSchema } from "./event-schemas.ts";

// oxlint-disable-next-line typescript/no-explicit-any
export type AppDatabase = PgliteDatabase<any>;

export interface CreateStackingDaoHandlerOptions {
  db: AppDatabase;
  logger: Logger;
  chainId?: bigint;
}

export function createStackingDaoHandler({
  db,
  logger,
  chainId = CHAIN_ID,
}: CreateStackingDaoHandlerOptions): EventHandler {
  return async (event) => {
    const rawValue = event.contract_log.value.hex;
    let decoded: unknown;
    try {
      decoded = decodeHex(rawValue);
    } catch (err) {
      logger.debug({
        msg: "Failed to decode Clarity log value",
        contractId: event.contract_log.contract_id,
        txId: event.tx_id,
        error: err,
      });
      return;
    }

    const parsed = stackingDaoLogSchema.safeParse(decoded);
    if (!parsed.success) {
      logger.trace?.({
        msg: "Non-matching StackingDAO log event",
        contractId: event.contract_log.contract_id,
        txId: event.tx_id,
      });
      return;
    }

    const log = parsed.data;

    if (log.kind === "deposit") {
      await db
        .insert(depositTable)
        .values({
          txId: event.tx_id,
          chainId,
          eventIndex: event.event_index,
          contractId: event.contract_log.contract_id,
          stacker: log.stacker,
          stxAmount: log.stxAmount,
          ststxAmount: log.ststxAmount,
          referrer: log.referrer,
          pool: log.pool,
          blockHeight: BigInt(event.block_height),
          blockTime: BigInt(event.block_time),
        })
        .onConflictDoNothing();

      logger.debug({
        msg: "StackingDAO deposit indexed",
        txId: event.tx_id,
        stacker: log.stacker,
        ststxAmount: log.ststxAmount,
        stxAmount: log.stxAmount,
        contractId: event.contract_log.contract_id,
      });
    } else {
      await db
        .insert(withdrawTable)
        .values({
          txId: event.tx_id,
          chainId,
          eventIndex: event.event_index,
          contractId: event.contract_log.contract_id,
          action: log.action,
          stacker: log.stacker,
          nftId: log.nftId,
          ststxAmount: log.ststxAmount,
          stxAmount: log.stxAmount,
          blockHeight: BigInt(event.block_height),
          blockTime: BigInt(event.block_time),
        })
        .onConflictDoNothing();

      logger.debug({
        msg: "StackingDAO withdraw indexed",
        action: log.action,
        txId: event.tx_id,
        stacker: log.stacker,
        ststxAmount: log.ststxAmount,
        stxAmount: log.stxAmount,
        contractId: event.contract_log.contract_id,
      });
    }
  };
}
