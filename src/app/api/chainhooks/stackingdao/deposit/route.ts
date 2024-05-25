import { db } from "@/db/db";
import { transactionTable } from "@/db/schema";
import { InsertTransaction } from "@/db/schema-types";
import { getOrInsertToken } from "@/db/token";
import { conflictUpdateSetAllColumns } from "@/db/utils";
import type {
  ChainhookPayload,
  ChainhookReceiptEventFTMintEvent,
  ChainhookReceiptEventSTXTransferEvent,
} from "@/lib/chainhooks";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const data: ChainhookPayload = await request.json();

  const transactionsToInsert = data.apply[0]?.transactions
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
