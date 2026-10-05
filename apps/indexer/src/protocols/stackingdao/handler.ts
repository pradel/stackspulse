import { Effect, Option, Schema } from "effect";
import {
  decodeHex,
  type HandlerContext,
  type HandlerEvent,
  type IndexerDb,
  type Logger,
} from "stacksindex";

import { depositTable, withdrawTable } from "../../schema.ts";
import { CHAIN_ID } from "./contracts.ts";
import { stackingDaoLogSchema } from "./event-schemas.ts";

export type AppDatabase = IndexerDb;

export type StackingDaoEventHandler = (
  event: HandlerEvent,
  context: HandlerContext,
) => Effect.Effect<void, unknown>;

export interface CreateStackingDaoHandlerOptions {
  db: AppDatabase;
  logger: Logger;
  chainId?: bigint;
}

export function createStackingDaoHandler({
  db,
  logger,
  chainId = CHAIN_ID,
}: CreateStackingDaoHandlerOptions): StackingDaoEventHandler {
  return (event) =>
    Effect.gen(function* () {
      const decoded = yield* Effect.option(
        Effect.try({
          try: () => decodeHex(event.contract_log.value.hex),
          catch: (error) => error,
        }),
      );

      if (Option.isNone(decoded)) {
        logger.debug({
          msg: "Failed to decode Clarity log value",
          contractId: event.contract_log.contract_id,
          txId: event.tx_id,
        });
        return;
      }

      const parsed = Schema.decodeUnknownOption(stackingDaoLogSchema)(decoded.value);

      if (Option.isNone(parsed)) {
        logger.trace({
          msg: "Non-matching StackingDAO log event",
          contractId: event.contract_log.contract_id,
          txId: event.tx_id,
        });
        return;
      }

      const log = parsed.value;

      if (log.kind === "deposit") {
        yield* db
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
        yield* db
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
    });
}
