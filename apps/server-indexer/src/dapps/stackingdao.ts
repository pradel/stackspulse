import type { Dapp } from "~/routes/api/chainhook/webhook.post";

const contracts = [
  "SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.stacking-dao-core-",
];

export const stackingdaoDapp: Dapp = {
  id: "stackingdao",

  init: () => ({
    id: "stackingdao",
    name: "StackingDAO",
  }),

  isTransaction: (transaction) => {
    if (transaction.metadata.kind.type !== "ContractCall") return false;
    const contractIdentifier =
      transaction.metadata.kind.data.contract_identifier;
    return (
      transaction.metadata.kind.type === "ContractCall" &&
      contracts.some((contract) => contractIdentifier.startsWith(contract))
    );
  },
};
