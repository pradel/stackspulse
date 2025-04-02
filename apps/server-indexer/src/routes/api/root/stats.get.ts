import { prisma } from "~/lib/prisma";

export default defineEventHandler(async () => {
  return {
    dapps: await prisma.dapp.count(),
    blocks: await prisma.block.count(),
    transactions: await prisma.transaction.count(),
    tokens: await prisma.token.count(),
    pools: await prisma.pool.count(),
    trades: await prisma.trade.count(),
  };
});
