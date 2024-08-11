import { Configuration, TransactionsApi } from "@stacks/blockchain-api-client";
const configuration = new Configuration({
  // TODO make call to hosted node
  //   basePath: "https://stacks-node-api.mainnet.stacks.co",
});

export const stacksApi = {
  transactions: new TransactionsApi(configuration),
};
