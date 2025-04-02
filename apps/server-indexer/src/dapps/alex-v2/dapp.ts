import type { StacksTransaction } from "@hirosystems/chainhook-client";
import { prisma } from "~/lib/prisma";

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

export const alexDapp = {
  id: "alex",

  init: async () => {
    const dappData = {
      id: "alex",
      name: "Alex",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await prisma.dapp.upsert({
      where: {
        id: dappData.id,
      },
      create: dappData,
      update: dappData,
    });
  },

  isTransaction: (transaction: StacksTransaction) => {
    return (
      transaction.metadata.kind.type === "ContractCall" &&
      contracts.includes(transaction.metadata.kind.data.contract_identifier)
    );
  },
};
