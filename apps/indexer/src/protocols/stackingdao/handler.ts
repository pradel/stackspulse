import { Effect } from "effect";
import type { PrintEvent } from "stacksindex/effect";

import { indexer } from "../../indexer.ts";
import { depositTable, type LiquidStackingToken, swapTable, withdrawTable } from "../../schema.ts";
import { CHAIN_ID } from "./contracts.ts";
import type { LstLog, SwapLog } from "./event-schemas.ts";

/*
 * Writes go through `indexer.Db`, the batch transaction, and are
 * insert-if-absent so a replayed block is a no-op.
 */

/** Handles the deposits and withdrawals of `token`'s core contracts. */
export const createLiquidStackingHandler =
  (token: LiquidStackingToken) => (event: PrintEvent<LstLog>) =>
    Effect.gen(function* () {
      const db = yield* indexer.Db;
      const log = event.data;
      const row = {
        txId: event.txId,
        chainId: CHAIN_ID,
        eventIndex: event.eventIndex,
        contractId: event.contractId,
        token,
        stacker: log.stacker,
        tokenAmount: log.tokenAmount,
        underlyingAmount: log.underlyingAmount,
        blockHeight: BigInt(event.block.height),
        blockTime: BigInt(event.block.time),
      };

      if (log.kind === "deposit") {
        yield* db
          .insert(depositTable)
          .values({ ...row, referrer: log.referrer, pool: log.pool })
          .onConflictDoNothing();
      } else {
        yield* db
          .insert(withdrawTable)
          .values({
            ...row,
            action: log.action,
            nftId: log.nftId,
            underlyingUserAmount: log.underlyingUserAmount,
            feeAmount: log.feeAmount,
          })
          .onConflictDoNothing();
      }

      yield* Effect.logDebug(`StackingDAO ${token} ${log.kind} indexed`).pipe(
        Effect.annotateLogs({
          txId: event.txId,
          contractId: event.contractId,
          stacker: log.stacker,
          tokenAmount: log.tokenAmount,
          underlyingAmount: log.underlyingAmount,
        }),
      );
    });

/** Handles stSTX ⇄ stSTXbtc swaps. */
export const swapHandler = (event: PrintEvent<SwapLog>) =>
  Effect.gen(function* () {
    const db = yield* indexer.Db;
    const log = event.data;

    yield* db
      .insert(swapTable)
      .values({
        txId: event.txId,
        chainId: CHAIN_ID,
        eventIndex: event.eventIndex,
        contractId: event.contractId,
        action: log.action,
        user: log.user,
        ststxAmount: log.ststxAmount,
        ststxbtcAmount: log.ststxbtcAmount,
        blockHeight: BigInt(event.block.height),
        blockTime: BigInt(event.block.time),
      })
      .onConflictDoNothing();

    yield* Effect.logDebug("StackingDAO swap indexed").pipe(
      Effect.annotateLogs({
        txId: event.txId,
        action: log.action,
        ststxAmount: log.ststxAmount,
        ststxbtcAmount: log.ststxbtcAmount,
      }),
    );
  });

const ststxHandler = createLiquidStackingHandler("ststx");
const ststxbtcHandler = createLiquidStackingHandler("ststxbtc");

/** `indexer.layer` handlers: one per StackingDAO contract name. */
export const STACKINGDAO_HANDLERS = {
  stackingDaoCoreV1: ststxHandler,
  stackingDaoCoreV2: ststxHandler,
  stackingDaoCoreV3: ststxHandler,
  stackingDaoCoreV4: ststxHandler,
  stackingDaoCoreV5: ststxHandler,
  stackingDaoCoreV6: ststxHandler,
  stackingDaoCoreStxV1: ststxHandler,
  stackingDaoCoreStxV2: ststxHandler,
  stackingDaoStstxNftHelperV1: ststxHandler,
  stackingDaoCoreBtcV1: ststxbtcHandler,
  stackingDaoCoreBtcV2: ststxbtcHandler,
  stackingDaoCoreBtcV3: ststxbtcHandler,
  stackingDaoCoreStstxbtcV1: ststxbtcHandler,
  stackingDaoCoreStstxbtcV2: ststxbtcHandler,
  stackingDaoCoreStbtcV1: createLiquidStackingHandler("stbtc"),
  stackingDaoSwapStstxStstxbtcV4: swapHandler,
  stackingDaoSwapStstxStstxbtcV5: swapHandler,
};
