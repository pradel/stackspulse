import { Effect } from "effect";
import type { PrintEvent } from "stacksindex/effect";

import { indexer } from "../../indexer.ts";
import { depositTable, withdrawTable } from "../../schema.ts";
import { CHAIN_ID } from "./contracts.ts";
import type { StackingDaoLog } from "./event-schemas.ts";

/**
 * Handles the prints of every StackingDAO core contract, already parsed by
 * `stackingDaoLogSchema`. Writes go through `indexer.Db`, the batch
 * transaction, and are insert-if-absent so a replayed block is a no-op.
 */
export const stackingDaoHandler = (event: PrintEvent<StackingDaoLog>) =>
  Effect.gen(function* () {
    const db = yield* indexer.Db;
    const log = event.data;

    if (log.kind === "deposit") {
      yield* db
        .insert(depositTable)
        .values({
          txId: event.txId,
          chainId: CHAIN_ID,
          eventIndex: event.eventIndex,
          contractId: event.contractId,
          stacker: log.stacker,
          stxAmount: log.stxAmount,
          ststxAmount: log.ststxAmount,
          referrer: log.referrer,
          pool: log.pool,
          blockHeight: BigInt(event.block.height),
          blockTime: BigInt(event.block.time),
        })
        .onConflictDoNothing();

      yield* Effect.logDebug("StackingDAO deposit indexed").pipe(
        Effect.annotateLogs({
          txId: event.txId,
          stacker: log.stacker,
          ststxAmount: log.ststxAmount,
          stxAmount: log.stxAmount,
          contractId: event.contractId,
        }),
      );
    } else {
      yield* db
        .insert(withdrawTable)
        .values({
          txId: event.txId,
          chainId: CHAIN_ID,
          eventIndex: event.eventIndex,
          contractId: event.contractId,
          action: log.action,
          stacker: log.stacker,
          nftId: log.nftId,
          ststxAmount: log.ststxAmount,
          stxAmount: log.stxAmount,
          blockHeight: BigInt(event.block.height),
          blockTime: BigInt(event.block.time),
        })
        .onConflictDoNothing();

      yield* Effect.logDebug("StackingDAO withdraw indexed").pipe(
        Effect.annotateLogs({
          action: log.action,
          txId: event.txId,
          stacker: log.stacker,
          ststxAmount: log.ststxAmount,
          stxAmount: log.stxAmount,
          contractId: event.contractId,
        }),
      );
    }
  });

/** `indexer.layer` handlers: one per StackingDAO core contract name. */
export const STACKINGDAO_HANDLERS = {
  stackingDaoCoreV1: stackingDaoHandler,
  stackingDaoCoreV2: stackingDaoHandler,
  stackingDaoCoreV3: stackingDaoHandler,
  stackingDaoCoreV4: stackingDaoHandler,
  stackingDaoCoreV5: stackingDaoHandler,
  stackingDaoCoreV6: stackingDaoHandler,
};
