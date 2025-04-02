import type { Dapp } from "~/routes/api/chainhook/webhook.post";

const contracts = [
  "SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.stableswap-",
  "SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR.stableswap-",
  "SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.earn-",
  "SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.router-",
  "SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.wrapper",
  "SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR.stableswap-core-",
  "SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR.xyk-core",
];

export const bitflowDapp: Dapp = {
  id: "bitflow",

  init: () => ({
    id: "bitflow",
    name: "Bitflow",
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
