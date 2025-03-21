import type { Payload } from "@hirosystems/chainhook-client";
import { handlePoolCreated } from "~/dapps/alex-v2/create-pool";
import { env } from "~/env";
import { consola } from "~/lib/consola";

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
            }))
        : [],
    );

    consola.debug(
      "block:",
      bundle.block_identifier.index,
      ", events: ",
      events.length,
    );

    for (const event of events) {
      // biome-ignore lint: using any cast intentionally
      if (handlePoolCreated.trigger(event.data as any)) {
        // biome-ignore lint: using any cast intentionally
        await handlePoolCreated.handler(event as any);
      }
    }
  }

  return {
    success: true,
  };
});
