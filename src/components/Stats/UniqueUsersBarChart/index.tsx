import { getTransactionsUniqueSendersByMonth } from "@/db/transactions";
import type { Protocol } from "@/lib/protocols";
import { UniqueUsersBarChartClient } from "./UniqueUsersBarChartClient";

export const UniqueUsersBarChart = async ({
  protocol,
}: {
  protocol: Protocol;
}) => {
  const stats = await getTransactionsUniqueSendersByMonth({ protocol });

  return <UniqueUsersBarChartClient protocol={protocol} data={stats} />;
};
