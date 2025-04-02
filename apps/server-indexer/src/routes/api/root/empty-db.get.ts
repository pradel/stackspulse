import { prisma } from "~/lib/prisma";

// TODO delete this file after first version is released
export default defineEventHandler(async () => {
  await prisma.trade.deleteMany({ where: {} });
  await prisma.pool.deleteMany({ where: {} });
  await prisma.token.deleteMany({ where: {} });
  await prisma.transaction.deleteMany({ where: {} });
  await prisma.block.deleteMany({ where: {} });
  await prisma.dapp.deleteMany({ where: {} });
  return { ok: true };
});
