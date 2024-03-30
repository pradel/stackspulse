import { db } from "@/db/db";
import { transactionTable } from "@/db/schema";
import { countDistinct, eq, sql } from "drizzle-orm";
import { UniqueUsersBarChartClient } from "./UniqueUsersBarChartClient";

const getData = async () => {
  const query = db
    .select({
      month: sql<string>`strftime('%Y-%m', timestamp, 'unixepoch') as month`,
      deposits: sql<number>`sum(case when action = 'stackingdao-deposit' then 1 else 0 end) as deposits`,
      depositsAmount: sql<number>`sum(case when action = 'stackingdao-deposit' then json->>'outAmount' else 0 end) as depositsAmount`,
      withdrawals: sql<number>`sum(case when action = 'stackingdao-withdraw' then 1 else 0 end) as withdrawals`,
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
  console.log(stats);

  return <div>toto</div>;

  // return <UniqueUsersBarChartClient protocol={protocol} data={stats} />;
};
