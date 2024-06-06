import { db } from "@/db/db";
import { transactionTable } from "@/db/schema";
import { InsertTransaction } from "@/db/schema-types";
import { getOrInsertToken } from "@/db/token";
import { conflictUpdateSetAllColumns } from "@/db/utils";
import type {
  ChainhookPayload,
  ChainhookReceiptEventFTTransferEvent,
  ChainhookReceiptEventSTXTransferEvent,
} from "@/lib/chainhooks";
import type { Protocol } from "@/lib/protocols";

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
          "SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.swap-helper-v1-01" ||
        transactionToProcess.metadata.kind.data.contract_identifier ===
          "SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.swap-helper-v1-02" ||
        transactionToProcess.metadata.kind.data.contract_identifier ===
          "SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.swap-helper-v1-03"
      ) {
        protocol = "alex";
      } else if (
        transactionToProcess.metadata.kind.data.contract_identifier ===
          "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-swap-v2-1" ||
        transactionToProcess.metadata.kind.data.contract_identifier ===
          "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-multi-hop-swap-v1-1"
      ) {
        protocol = "arkadiko";
      } else if (
        transactionToProcess.metadata.kind.data.contract_identifier ===
          "SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.stableswap-stx-ststx-v-1-2" ||
        transactionToProcess.metadata.kind.data.contract_identifier ===
          "SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.stableswap-usda-susdt-v-1-2" ||
        transactionToProcess.metadata.kind.data.contract_identifier ===
          "SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.stableswap-aeusdc-susdt-v-1-2" ||
        transactionToProcess.metadata.kind.data.contract_identifier ===
          "SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.stableswap-usda-aeusdc-v-1-2" ||
        transactionToProcess.metadata.kind.data.contract_identifier ===
          "SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.stableswap-abtc-xbtc-v-1-2"
      ) {
        protocol = "bitflow";
      } else if (
        transactionToProcess.metadata.kind.data.contract_identifier ===
        "SP1Z92MPDQEWZXW36VX71Q25HKF5K2EPCJ304F275.stackswap-swap-v5k"
      ) {
        protocol = "stackswap";
      } else if (
        transactionToProcess.metadata.kind.data.contract_identifier ===
        "SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-router"
      ) {
        protocol = "velar";
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
