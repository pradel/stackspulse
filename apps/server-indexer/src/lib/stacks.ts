import { createClient } from "@stacks/blockchain-api-client";
import { env } from "~/env";

export const stacksApiClient = createClient({
  headers: {
    "x-api-key": env.HIRO_API_KEY,
  },
});
