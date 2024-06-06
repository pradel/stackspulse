import { db } from "@/db/db";
import { transactionTable } from "@/db/schema";
import { InsertTransaction } from "@/db/schema-types";
import { getOrInsertToken } from "@/db/token";
import type {
  ChainhookPayload,
  ChainhookReceiptEventFTTransferEvent,
  ChainhookReceiptEventSTXTransferEvent,
} from "@/lib/chainhooks";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const data: ChainhookPayload = await request.json();
  const transactions = data.apply[0]?.transactions ?? [];

  const transactionsToInsert = transactions
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
            | ChainhookReceiptEventFTTransferEvent =>
            event.type === "STXTransferEvent" ||
            event.type === "FTTransferEvent",
        )
        .filter((event) => event.data.sender === sender);
      const tokenXTransferEvent = transferEvents[0];
      const tokenYTransferEvent = transferEvents[transferEvents.length - 1];

      return {
        txId: transactionToProcess.transaction_identifier.hash,
        protocol: "arkadiko",
        blockHeight: BigInt(data.apply[0].block_identifier.index),
        timestamp: new Date(data.apply[0].timestamp * 1000),
        sender,
        action: "add-liquidity",
        data: {
          tokenX:
            tokenXTransferEvent.type === "STXTransferEvent"
              ? "STX"
              : tokenXTransferEvent.data.asset_identifier,
          tokenY:
            tokenYTransferEvent.type === "STXTransferEvent"
              ? "STX"
              : tokenYTransferEvent.data.asset_identifier,
        },
      } satisfies InsertTransaction;
    });

  const tokensToInsert = new Set<string>();
  for (const transaction of transactionsToInsert) {
    tokensToInsert.add(transaction.data.tokenX);
    tokensToInsert.add(transaction.data.tokenY);
  }
  for (const tokenId of tokensToInsert) {
    await getOrInsertToken(tokenId);
  }

  if (transactionsToInsert.length > 0) {
    await db
      .insert(transactionTable)
      .values(transactionsToInsert)
      .onConflictDoNothing();
  }

  return Response.json({ ok: true });
}
