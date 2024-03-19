import { db } from "@/db/db";
import { type InsertTransaction, transactionTable } from "@/db/schema";
import type {
  ChainhookPayload,
  ChainhookReceiptEventFTTransferEvent,
  ChainhookReceiptEventSTXTransferEvent,
} from "@/lib/chainhooks";
import { getOrInsertToken } from "@/lib/currencies";
import type { Protocol } from "@/lib/protocols";

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
            | ChainhookReceiptEventFTTransferEvent =>
            event.type === "STXTransferEvent" ||
            event.type === "FTTransferEvent",
        );
      const outgoingTransferEvents = transferEvents.filter(
        (event) => event.data.sender === sender,
      );
      const incomingTransferEvents = transferEvents.filter(
        (event) => event.data.recipient === sender,
      );
      const outgoingTransferEvent = outgoingTransferEvents[0];
      const incomingTransferEvent =
        incomingTransferEvents[incomingTransferEvents.length - 1];

      let protocol: Protocol;
      if (
        transactionToProcess.metadata.kind.data.contract_identifier ===
          "SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.amm-swap-pool-v1-1" ||
        transactionToProcess.metadata.kind.data.contract_identifier ===
          "SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.swap-helper-v1-03"
      ) {
        protocol = "alex";
      } else if (
        transactionToProcess.metadata.kind.data.contract_identifier ===
        "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-swap-v2-1"
      ) {
        protocol = "arkadiko";
      } else if (
        transactionToProcess.metadata.kind.data.contract_identifier ===
        "SP1Z92MPDQEWZXW36VX71Q25HKF5K2EPCJ304F275.stackswap-swap-v5k"
      ) {
        protocol = "stackswap";
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
          inAmount: BigInt(outgoingTransferEvent.data.amount),
          inToken:
            outgoingTransferEvent.type === "STXTransferEvent"
              ? "STX"
              : outgoingTransferEvent.data.asset_identifier,
          outAmount: BigInt(incomingTransferEvent.data.amount),
          outToken:
            incomingTransferEvent.type === "STXTransferEvent"
              ? "STX"
              : incomingTransferEvent.data.asset_identifier,
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
