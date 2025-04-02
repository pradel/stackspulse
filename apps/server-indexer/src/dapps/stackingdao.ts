import { prisma } from "~/lib/prisma";
import type { Dapp } from "~/routes/api/chainhook/webhook.post";

const contracts = [
  "SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.stacking-dao-core-v1",
  "SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.stacking-dao-core-v2",
  "SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.stacking-dao-core-v3",
  "SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.stacking-dao-core-v4",
];

export const stackingdaoDapp: Dapp = {
  id: "stackingdao",

  init: async () => {
    const dappData = {
      id: "stackingdao",
      name: "StackingDAO",
      updatedAt: new Date(),
    };
    await prisma.dapp.upsert({
      where: {
        id: dappData.id,
      },
      create: {
        ...dappData,
        createdAt: new Date(),
      },
      update: dappData,
    });
  },

  isTransaction: (transaction) => {
    return (
      transaction.metadata.kind.type === "ContractCall" &&
      contracts.includes(transaction.metadata.kind.data.contract_identifier)
    );
  },
};
