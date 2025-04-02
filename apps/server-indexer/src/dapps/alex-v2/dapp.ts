import type { StacksTransaction } from "@hirosystems/chainhook-client";
import { prisma } from "~/lib/prisma";

const contracts = [
  "SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.amm-registry-v2-01",
  "SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.amm-pool-v2-01",
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
