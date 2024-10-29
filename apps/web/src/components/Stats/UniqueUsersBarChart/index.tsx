// import { env } from "@/env";
import type { Protocol } from "@stackspulse/protocols";
import { UniqueUsersBarChartClient } from "./UniqueUsersBarChartClient";

export const UniqueUsersBarChart = async ({
  protocol,
}: {
  protocol: Protocol;
}) => {
  // const stats = await fetch(
  //   `${env.NEXT_PUBLIC_API_URL}/api/transactions/unique-senders?protocol=${protocol}`,
  // ).then((res) => res.json());
  const stats = [
    {
      month: "2023-01",
      unique_senders: 10,
    },
    {
      month: "2023-02",
      unique_senders: 20,
    },
    {
      month: "2023-03",
      unique_senders: 30,
    },
    {
      month: "2023-04",
      unique_senders: 40,
    },
    {
      month: "2023-05",
      unique_senders: 50,
    },
    {
      month: "2023-06",
      unique_senders: 60,
    },
    {
      month: "2023-07",
      unique_senders: 70,
    },
    {
      month: "2023-08",
      unique_senders: 80,
    },
    {
      month: "2023-09",
      unique_senders: 90,
    },
    {
      month: "2023-10",
      unique_senders: 100,
    },
  ];

  return <UniqueUsersBarChartClient protocol={protocol} data={stats} />;
};
