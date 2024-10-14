"use client";

import { useGetTransactionVolume } from "@/hooks/api/useGetTransactionVolume";
import type { FtMetadataResponse } from "@/lib/stacks";
import { Card, Inset, Separator, Text } from "@radix-ui/themes";
import { useMemo } from "react";
import { AreaChart } from "../ui/AreaChart";
import { bigNumberValueFormatter, numberValueFormatter } from "../ui/utils";

interface TokenStatsProps {
  tokenInfo: FtMetadataResponse;
}

export const TokenTransactionsVolume = ({ tokenInfo }: TokenStatsProps) => {
  const { data } = useGetTransactionVolume({
    token: tokenInfo.asset_identifier,
  });

  const formattedData = useMemo(() => {
    return data.map((d) => ({
      date: d.date,
      daily_volume:
        Number(d.daily_volume) / Number(10 ** (tokenInfo.decimals ?? 0)),
    }));
  }, [data, tokenInfo.decimals]);

  return (
    <Card size="2" className="mt-5">
      <Text as="div" size="2" weight="medium" color="gray" highContrast>
        Transactions volume
      </Text>
      <Text className="mt-1" as="div" size="1" color="gray">
        The total volume of transactions for the token (transfers, swaps, etc.).
      </Text>
      <Inset py="current" side="bottom">
        <Separator size="4" />
      </Inset>
      <AreaChart
        className="mt-3 pr-3"
        data={formattedData}
        index="date"
        categories={["daily_volume"]}
        colors={["orange"]}
        valueFormatter={numberValueFormatter}
        valueFormatterYAxis={bigNumberValueFormatter}
      />
    </Card>
  );
};
