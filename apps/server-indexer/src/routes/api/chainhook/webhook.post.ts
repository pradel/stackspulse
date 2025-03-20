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

  return {
    success: true,
  };
});
