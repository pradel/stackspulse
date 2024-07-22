import { env } from "@/env";
import type { Protocol } from "@/lib/protocols";
import { UniqueUsersBarChartClient } from "./UniqueUsersBarChartClient";

export const UniqueUsersBarChart = async ({
  protocol,
}: {
  protocol: Protocol;
}) => {
  const stats = await fetch(
    `${env.NEXT_PUBLIC_API_URL}/api/transactions/unique-senders?protocol=${protocol}`,
  ).then((res) => res.json());

  return <UniqueUsersBarChartClient protocol={protocol} data={stats} />;
};
