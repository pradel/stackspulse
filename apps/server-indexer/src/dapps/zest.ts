import type { Dapp } from "~/routes/api/chainhook/webhook.post";

const contracts = [
  "SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.pool-borrow",
  "SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.borrow-helper-",
];

export const zestDapp: Dapp = {
  id: "zest",

  init: () => ({
    id: "zest",
    name: "Zest",
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
