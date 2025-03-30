import type { Payload } from "@hirosystems/chainhook-client";
import { handlePoolCreated } from "~/dapps/alex-v2/create-pool";
import { handleSwap } from "~/dapps/alex-v2/swap";
import { env } from "~/env";
import { consola } from "~/lib/consola";
import { prisma } from "~/lib/prisma";

// biome-ignore lint: using any cast intentionally
export type Operation<T = any> = {
  trigger: (data: {
    contract_identifier: string;
    value: Record<string, unknown>;
  }) => boolean;
  handler: (event: {
    tx_id: string;
    tx_index: number;
    block_height: number;
    block_timestamp: number;
    data: {
      contract_identifier: string;
      value: T;
    };
  }) => Promise<void>;
};

const operations: Operation[] = [handlePoolCreated, handleSwap];

export default defineEventHandler(async (event) => {
  const chainhook = await readBody<Payload>(event);
  const authorization = event.headers.get("authorization");
  const authorizationToken = authorization?.replace("Bearer ", "");
  if (authorizationToken !== env.CHAINHOOK_API_TOKEN) {
    return createError({
      statusCode: 401,
      message: "Unauthorized",
    });
  }

  for (const bundle of chainhook.apply) {
    // TODO verify that txs are not reverted
    const events = bundle.transactions.flatMap((transaction) =>
      "receipt" in transaction.metadata
        ? transaction.metadata.receipt.events
            // This is separate step to narrow down the type of event for typescript
            .filter((event) => event.type === "SmartContractEvent")
            // Get all the events that are coming from the contract we watch in this chainhook
            .filter((event) => event.data.topic === "print")
            .map((event) => ({
              ...event,
              tx_index: event.position.index,
              tx_id: transaction.transaction_identifier.hash,
              block_height: bundle.block_identifier.index,
              block_timestamp: bundle.timestamp,
            }))
        : [],
    );

    consola.debug(
      "block:",
      bundle.block_identifier.index,
      ", events: ",
      events.length,
    );

    const blockData = {
      height: bundle.block_identifier.index,
      timestamp: bundle.timestamp,
    };
    await prisma.block.upsert({
      where: {
        height: bundle.block_identifier.index,
      },
      create: blockData,
      update: blockData,
    });

    for (const event of events) {
      // Process all operations for each event
      for (const operation of operations) {
        // biome-ignore lint: using any cast intentionally
        if (operation.trigger(event.data as any)) {
          // biome-ignore lint: using any cast intentionally
          await operation.handler(event as any);
        }
      }
    }
  }

  return {
    success: true,
  };
});
