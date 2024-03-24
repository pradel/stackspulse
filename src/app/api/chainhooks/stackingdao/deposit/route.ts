import { db } from "@/db/db";
import { type InsertTransaction, transactionTable } from "@/db/schema";
import { conflictUpdateSetAllColumns } from "@/db/utils";
import type {
  ChainhookPayload,
  ChainhookReceiptEventFTMintEvent,
  ChainhookReceiptEventSTXTransferEvent,
} from "@/lib/chainhooks";
import { getOrInsertToken } from "@/lib/currencies";

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
            | ChainhookReceiptEventFTMintEvent =>
            event.type === "STXTransferEvent" || event.type === "FTMintEvent",
        );
      const stxTransferEvent = transferEvents.filter(
        (event) =>
          event.type === "STXTransferEvent" && event.data.sender === sender,
      )[0];
      const stStxMintEvent = transferEvents.filter(
        (event): event is ChainhookReceiptEventFTMintEvent =>
          event.type === "FTMintEvent" && event.data.recipient === sender,
      )[0];

      return {
        txId: transactionToProcess.transaction_identifier.hash,
        protocol: "stackingdao",
        blockHeight: BigInt(data.apply[0].block_identifier.index),
        timestamp: new Date(data.apply[0].timestamp * 1000),
        sender,
        action: "stackingdao-deposit",
        data: {
          outAmount: BigInt(stxTransferEvent.data.amount),
          outToken: "STX",
          inAmount: BigInt(stStxMintEvent.data.amount),
          inToken: stStxMintEvent.data.asset_identifier,
        },
      } satisfies InsertTransaction;
    });

  for (const transaction of transactionsToInsert) {
    await getOrInsertToken(transaction.data.inToken);
    await getOrInsertToken(transaction.data.outToken);
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
