import { createClient } from "@stacks/blockchain-api-client";

export const stacksClient = createClient({
  // TODO make call to hosted node
  baseUrl: "https://api.mainnet.hiro.so",
});
