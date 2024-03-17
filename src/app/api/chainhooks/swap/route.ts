import { InsertTransaction, transactionTable } from "@/db/schema";
import { db } from "@/db/db";
import { getOrInsertToken } from "@/lib/currencies";
import {
  ChainhookPayload,
  ChainhookReceiptEventFTTransferEvent,
  ChainhookReceiptEventSTXTransferEvent,
} from "@/lib/chainhooks";
import { Protocol } from "@/lib/protocols";

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
            event
          ): event is
            | ChainhookReceiptEventSTXTransferEvent
            | ChainhookReceiptEventFTTransferEvent =>
            event.type === "STXTransferEvent" ||
            event.type === "FTTransferEvent"
        )
        .filter(
          (event) =>
            event.data.sender === sender || event.data.recipient === sender
        );
      const firstTransferEvent = transferEvents[0];
      const lastTransferEvent = transferEvents[transferEvents.length - 1];

      let protocol: Protocol;
      if (
        transactionToProcess.metadata.kind.data.contract_identifier ===
        "SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.amm-swap-pool-v1-1"
      ) {
        protocol = "alex";
      } else if (
        transactionToProcess.metadata.kind.data.contract_identifier ===
        "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-swap-v2-1"
      ) {
        protocol = "arkadiko";
      } else {
        throw new Error("Unknown protocol");
      }

      return {
        txId: transactionToProcess.transaction_identifier.hash,
        protocol,
        blockHeight: BigInt(data.apply[0].block_identifier.index),
        timestamp: new Date(data.apply[0].timestamp * 1000),
        sender,
        action: "swap",
        data: {
          inAmount: BigInt(firstTransferEvent.data.amount),
          inToken:
            firstTransferEvent.type === "STXTransferEvent"
              ? "STX"
              : firstTransferEvent.data.asset_identifier,
          outAmount: BigInt(lastTransferEvent.data.amount),
          outToken:
            lastTransferEvent.type === "STXTransferEvent"
              ? "STX"
              : lastTransferEvent.data.asset_identifier,
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
      .onConflictDoNothing();
  }

  return Response.json({ ok: true });
}
