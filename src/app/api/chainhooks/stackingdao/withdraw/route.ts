import { db } from "@/db/db";
import { type InsertTransaction, transactionTable } from "@/db/schema";
import { getOrInsertToken } from "@/db/token";
import { conflictUpdateSetAllColumns } from "@/db/utils";
import type {
  ChainhookPayload,
  ChainhookReceiptEventFTBurnEvent,
  ChainhookReceiptEventSTXTransferEvent,
} from "@/lib/chainhooks";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const data: ChainhookPayload = await request.json();

  const transactionsToInsert = data.apply[0].transactions
    .filter((transactionToProcess) => transactionToProcess.metadata.success)
    .map((transactionToProcess) => {
      const sender = transactionToProcess.metadata.sender;
      const transferEvents = transactionToProcess.metadata.receipt.events
        // Events are not always in order so we sort them by index
        .sort((a, b) => a.position.index - b.position.index)
        .filter(
          (
            event,
          ): event is
            | ChainhookReceiptEventSTXTransferEvent
            | ChainhookReceiptEventFTBurnEvent =>
            event.type === "STXTransferEvent" || event.type === "FTBurnEvent",
        );
      const stxTransferEvent = transferEvents.filter(
        (event) =>
          event.type === "STXTransferEvent" && event.data.recipient === sender,
      )[0];
      const stStxBurnEvent = transferEvents.filter(
        (event): event is ChainhookReceiptEventFTBurnEvent =>
          event.type === "FTBurnEvent",
      )[0];

      return {
        txId: transactionToProcess.transaction_identifier.hash,
        protocol: "stackingdao",
        blockHeight: BigInt(data.apply[0].block_identifier.index),
        timestamp: new Date(data.apply[0].timestamp * 1000),
        sender,
        action: "stackingdao-withdraw",
        data: {
          inAmount: BigInt(stxTransferEvent.data.amount),
          inToken: "STX",
          outAmount: BigInt(stStxBurnEvent.data.amount),
          outToken: stStxBurnEvent.data.asset_identifier,
        },
      } satisfies InsertTransaction;
    });

  const tokensToInsert = new Set<string>();
  for (const transaction of transactionsToInsert) {
    tokensToInsert.add(transaction.data.inToken);
    tokensToInsert.add(transaction.data.outToken);
  }
  for (const tokenId of tokensToInsert) {
    await getOrInsertToken(tokenId);
  }

  if (transactionsToInsert.length > 0) {
    await db
      .insert(transactionTable)
      .values(transactionsToInsert)
      .onConflictDoUpdate({
        target: transactionTable.txId,
        set: conflictUpdateSetAllColumns(transactionTable),
      });
  }

  return Response.json({ ok: true });
}
