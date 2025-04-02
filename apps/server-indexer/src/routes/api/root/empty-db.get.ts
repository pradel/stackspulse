import { prisma } from "~/lib/prisma";

// TODO delete this file after first version is released
export default defineEventHandler(async () => {
  await prisma.trade.deleteMany({ where: {} });
  await prisma.transaction.deleteMany({ where: {} });
  await prisma.block.deleteMany({ where: {} });

  return { ok: true };
});
