import type { Dapp } from "~/routes/api/chainhook/webhook.post";

const contracts = [
  "SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-router",
  "SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-path2",
  "SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-core",
  "SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-pool-",
  "SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.curve-pool-",
];

export const velarDapp: Dapp = {
  id: "velar",

  init: () => ({
    id: "velar",
    name: "Velar",
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
