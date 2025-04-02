import type { Dapp } from "~/routes/api/chainhook/webhook.post";

const contracts = [
  "SP1Z92MPDQEWZXW36VX71Q25HKF5K2EPCJ304F275.stackswap-swap-v5k",
];

export const stackswapDapp: Dapp = {
  id: "stackswap",

  init: () => ({
    id: "stackswap",
    name: "Stackswap",
  }),

  isTransaction: (transaction) => {
    return (
      transaction.metadata.kind.type === "ContractCall" &&
      contracts.includes(transaction.metadata.kind.data.contract_identifier)
    );
  },
};
