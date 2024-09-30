"use client";

import { useGetTransactionVolume } from "@/hooks/api/useGetTransactionVolume";
import { Card, Inset, Separator, Text } from "@radix-ui/themes";
import { AreaChart } from "../ui/AreaChart";
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
    daily_volume: Number(d.daily_volume),
  }));

  return (
    <Card size="2" className="mt-5">
      <Text as="div" size="2" weight="medium" color="gray" highContrast>
        Transactions volume
      </Text>
      <Text className="mt-1" as="div" size="1" color="gray">
        The total volume of transactions for the token.
      </Text>
      <Inset py="current" side="bottom">
        <Separator size="4" />
      </Inset>
      <AreaChart
        className="mt-6 pr-3"
        data={formattedData}
        index="date"
        categories={["daily_volume"]}
        colors={["orange"]}
        yAxisWidth={60}
        valueFormatter={numberValueFormatter}
      />
    </Card>
  );
};
