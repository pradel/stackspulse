"use client";

import { BarChart } from "@/components/ui/BarChart";
import { bigNumberValueFormatter } from "@/components/ui/utils";
import type { StackingDAOFlowsResponse, StackingDAOToken } from "@/lib/api";
import { monthLabel, stackingDAOTokens, toUnits } from "@/lib/stackingdao";
import { useState } from "react";
import { ChartCard } from "../../ChartCard";
import { TokenSwitch } from "../TokenSwitch";

const TOKENS = ["ststx", "ststxbtc", "stbtc"] as const;

interface FlowsChartClientProps {
  points: StackingDAOFlowsResponse["points"];
}

export const FlowsChartClient = ({ points }: FlowsChartClientProps) => {
  const [token, setToken] = useState<StackingDAOToken>("ststx");
  const { name, decimals } = stackingDAOTokens[token];

  // Token amounts are complete: core-v1 stSTX deposits print no STX amount.
  const data = points
    .filter((point) => point.token === token)
    .map((point) => ({
      date: monthLabel(point.period),
      Deposits: toUnits(point.minted, decimals),
      Withdrawals: toUnits(point.burned, decimals),
    }));

  return (
    <ChartCard
      title={`Deposits and withdrawals in ${name}`}
      description={`${name} minted by deposits and burned by withdrawals per month`}
      actions={<TokenSwitch tokens={TOKENS} value={token} onValueChange={setToken} />}
    >
      <BarChart
        className="mt-6 pr-3"
        data={data}
        index="date"
        categories={["Deposits", "Withdrawals"]}
        colors={["orange", "indigo"]}
        valueFormatter={bigNumberValueFormatter}
      />
    </ChartCard>
  );
};
