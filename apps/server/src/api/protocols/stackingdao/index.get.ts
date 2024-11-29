import { stackingDAOStats } from "@prisma/client/sql";
import { apiCacheConfig } from "~/lib/api";
import { prisma } from "~/lib/prisma";

type StackingDAOProtocolStatsResponse = {
  month: string;
  deposits: number;
  withdrawals: number;
}[];

export default defineCachedEventHandler(async () => {
  const result = await prisma.$queryRawTyped(stackingDAOStats());

  const stats: StackingDAOProtocolStatsResponse = result.map((row) => ({
    // format of the month is "2021-08-01 00:00:00+00"
    // we want to output "2021-08"
    month: row.month.slice(0, 7),
    deposits: Number.parseInt(row.deposits),
    withdrawals: Number.parseInt(row.withdrawals),
  }));

  return stats;
}, apiCacheConfig);
