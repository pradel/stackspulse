import type { Payload } from "@hirosystems/chainhook-client";
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

  consola.log("Received chainhook webhook");

  for (const bundle of chainhook.apply) {
    const events = bundle.transactions
      .flatMap((transaction) =>
        "receipt" in transaction.metadata
          ? transaction.metadata.receipt.events
          : [],
      )
      // This is separate step to narrow down the type of event for typescript
      .filter((event) => event.type === "SmartContractEvent")
      // Get all the events that are coming from the contract we watch in this chainhook
      .filter((event) => event.data.topic === "print");

    console.log("events", events);
  }

  return {
    success: true,
  };
});
