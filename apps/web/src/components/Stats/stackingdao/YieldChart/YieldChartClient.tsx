"use client";

import { AreaChart } from "@/components/ui/AreaChart";
import type { StackingDAOYieldResponse } from "@/lib/api";
import { stackingDAOTokens } from "@/lib/stackingdao";
import { useState } from "react";
import { ChartCard } from "../../ChartCard";
import { TokenSwitch } from "../TokenSwitch";

const TOKENS = ["ststx", "stbtc"] as const;

interface YieldChartClientProps {
  yields: Record<(typeof TOKENS)[number], StackingDAOYieldResponse>;
}

export const YieldChartClient = ({ yields }: YieldChartClientProps) => {
  const [token, setToken] = useState<(typeof TOKENS)[number]>("ststx");
  const { name, underlying } = stackingDAOTokens[token];
  const { apy, points } = yields[token];
  const category = `${underlying} per ${name}`;

  const data = points.map((point) => ({ date: point.period, [category]: point.rate }));

  return (
    <ChartCard
      title={`${name} value in ${underlying}`}
      description={
        apy === null
          ? `How much ${underlying} one ${name} is worth, from withdrawals`
          : `How much ${underlying} one ${name} is worth, from withdrawals. ${(apy * 100).toFixed(2)}% APY over the last 30 days`
      }
      actions={<TokenSwitch tokens={TOKENS} value={token} onValueChange={setToken} />}
    >
      <AreaChart
        className="mt-3 pr-3"
        data={data}
        index="date"
        categories={[category]}
        colors={["orange"]}
        autoMinValue
        showLegend={false}
        valueFormatter={(value) => value.toFixed(6)}
        valueFormatterYAxis={(value) => value.toFixed(4)}
      />
    </ChartCard>
  );
};
