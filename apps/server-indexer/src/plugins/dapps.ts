import { dapps } from "~/dapps";
import { consola } from "~/lib/consola";
import { prisma } from "~/lib/prisma";

export default defineNitroPlugin(async () => {
  for (const dapp of dapps) {
    const dappData = {
      ...dapp.init(),
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
  }
  consola.success("Plugin: dapps registered");
});
