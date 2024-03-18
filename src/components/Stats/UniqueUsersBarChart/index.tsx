import { getTransactionsUniqueSendersByMonth } from "@/db/transactions";
import { UniqueUsersBarChartClient } from "./UniqueUsersBarChartClient";

export const UniqueUsersBarChart = async () => {
  const stats = await getTransactionsUniqueSendersByMonth();

  return <UniqueUsersBarChartClient data={stats} />;
};
