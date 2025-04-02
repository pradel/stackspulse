import { prisma } from "~/lib/prisma";
import type { Dapp } from "~/routes/api/chainhook/webhook.post";

const contracts = [
  // alex-v2
  "SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.amm-registry-v2-01",
  "SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.amm-pool-v2-01",
  "SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.amm-vault-v2-01",
  // alex-v1
  "SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.amm-swap-pool-v1-1",
  "SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.swap-helper-v1-01",
  "SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.swap-helper-v1-02",
  "SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.swap-helper-v1-03",
];

export const alexDapp: Dapp = {
  id: "alex",

  init: () => ({
    id: "alex",
    name: "Alex",
  }),

  isTransaction: (transaction) => {
    return (
      transaction.metadata.kind.type === "ContractCall" &&
      contracts.includes(transaction.metadata.kind.data.contract_identifier)
    );
  },
};
