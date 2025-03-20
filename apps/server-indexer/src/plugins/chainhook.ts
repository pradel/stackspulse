import type { Predicate } from "@hirosystems/chainhook-client";
import { env } from "~/env";
import { createChainhook, getChainhooks } from "~/lib/chainhook";
import { consola } from "~/lib/consola";

const predicate = {
  name: `${env.NODE_ENV}-stackspulse.new-block`,
  chain: "stacks",
  version: 1,
  networks: {
    mainnet: {
      if_this: {
        scope: "block_height",
        higher_than: 1,
      },
      then_that: {
        http_post: {
          url: `${env.WEBHOOK_PROXY_URL}/api/chainhook/webhook`,
          authorization_header: `Bearer ${env.CHAINHOOK_API_TOKEN}`,
        },
      },
      decode_clarity_values: true,
      start_block: 1,
    },
  },
} satisfies Omit<Predicate, "uuid">;

/**
 * Setup the required chainhook that are necessary for the app to run properly.
 */
export default defineNitroPlugin(async (nitroApp) => {
  if (env.NODE_ENV === "development" && !env.WEBHOOK_PROXY_URL) {
    consola.warn(
      "WEBHOOK_PROXY_URL is not set, chainhooks will not be registered",
    );
    return;
  }

  const chainhooks = await getChainhooks();
  const predicateName = predicate.name;
  const hasChainhook = chainhooks.find(
    (chainhook) => chainhook.name === predicateName,
  );
  if (!hasChainhook) {
    const response = await createChainhook(predicate);
    consola.debug(
      `Registered ${predicateName} chainhook ${response.chainhookUuid}`,
    );
  }

  consola.success("Plugin: Chainhooks registered");
});
