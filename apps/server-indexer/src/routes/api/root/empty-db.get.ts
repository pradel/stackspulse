import { prisma } from "~/lib/prisma";

export default defineEventHandler(async () => {
  await prisma.trade.deleteMany({ where: {} });
  await prisma.transaction.deleteMany({ where: {} });
  await prisma.block.deleteMany({ where: {} });

  return { ok: true };
});
