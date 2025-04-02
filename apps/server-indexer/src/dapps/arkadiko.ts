import type { Dapp } from "~/routes/api/chainhook/webhook.post";

const contracts = [
  "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-swap-v2-1",
  "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-multi-hop-swap-v1-1",
];

export const arkadikoDapp: Dapp = {
  id: "arkadiko",

  init: () => ({
    id: "arkadiko",
    name: "Arkadiko",
  }),

  isTransaction: (transaction) => {
    return (
      transaction.metadata.kind.type === "ContractCall" &&
      contracts.includes(transaction.metadata.kind.data.contract_identifier)
    );
  },
};
