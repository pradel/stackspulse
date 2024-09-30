"use client";

import { useGetTransactionVolume } from "@/hooks/api/useGetTransactionVolume";
import { Card, Text } from "@radix-ui/themes";
import { BarChart } from "../ui/BarChart";
import { numberValueFormatter } from "../ui/utils";

interface TokenStatsProps {
  token: string;
}

export const TokenTransactionsVolume = ({ token }: TokenStatsProps) => {
  const { data } = useGetTransactionVolume({ token });

  const formattedData: {
    date: string;
  }[] = data.map((d) => ({
    date: d.date,
    daily_volume: d.daily_volume,
  }));

  return (
    <div>
      <BarChart
        className="mt-6 pr-3"
        data={formattedData}
        index="date"
        categories={["daily_volume"]}
        colors={["orange"]}
        valueFormatter={numberValueFormatter}
      />
    </div>
  );
};
