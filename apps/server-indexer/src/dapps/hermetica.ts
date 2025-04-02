import type { Dapp } from "~/routes/api/chainhook/webhook.post";

const contracts = [
  "SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.usdh-token-v1",
  "SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.susdh-token-v1",
  "SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.staking-v1",
];

export const hermeticaDapp: Dapp = {
  id: "hermetica",

  init: () => ({
    id: "hermetica",
    name: "Hermetica",
  }),

  isTransaction: (transaction) => {
    return (
      transaction.metadata.kind.type === "ContractCall" &&
      contracts.includes(transaction.metadata.kind.data.contract_identifier)
    );
  },
};
