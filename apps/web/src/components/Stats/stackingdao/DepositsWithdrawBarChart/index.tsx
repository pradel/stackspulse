import { env } from "@/env";
import type { StackingDAOProtocolStatsResponse } from "@/lib/api";
import { DepositWithdrawBarChartClient } from "./DepositWithdrawBarChartClient";

export const DepositWithdrawBarChart = async () => {
  const stats: StackingDAOProtocolStatsResponse = await fetch(
    `${env.NEXT_PUBLIC_API_URL}/api/protocols/stackingdao`,
  ).then((res) => res.json());

  const formattedData: {
    date: string;
    withdrawals: number;
    deposits: number;
  }[] = stats.map((d) => ({
    date: d.month,
    withdrawals: d.withdrawals,
    deposits: d.deposits,
  }));

  return <DepositWithdrawBarChartClient data={formattedData} />;
};
