import { db } from "@/db/db";
import { transactionTable } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { DepositWithdrawBarChartClient } from "./DepositWithdrawBarChartClient";

const getData = async () => {
  const query = db
    .select({
      month: sql<string>`strftime('%Y-%m', timestamp, 'unixepoch') as month`,
      depositsAmount: sql<number>`sum(case when action = 'stackingdao-deposit' then json->>'outAmount' else 0 end) as depositsAmount`,
      withdrawalsAmount: sql<number>`sum(case when action = 'stackingdao-withdraw' then json->>'inAmount' else 0 end) as withdrawalsAmount`,
    })
    .from(transactionTable)
    .where(eq(transactionTable.protocol, "stackingdao"))
    .groupBy(sql`month`);

  const stats = await query;
  return stats;
};

export const DepositWithdrawBarChart = async () => {
  const stats = await getData();

  const formattedData: {
    date: string;
    withdrawals: number;
    deposits: number;
  }[] = stats.map((d) => ({
    date: d.month,
    withdrawals: d.withdrawalsAmount,
    deposits: d.depositsAmount,
  }));

  return <DepositWithdrawBarChartClient data={formattedData} />;
};
