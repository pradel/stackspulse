"use client";

import { BarChart } from "@/components/ui/BarChart";
import { bigNumberValueFormatter } from "@/components/ui/utils";
import type { StackingDAOToken, StackingDAOWithdrawalsResponse } from "@/lib/api";
import { monthLabel, stackingDAOTokens, toUnits } from "@/lib/stackingdao";
import { useState } from "react";
import { ChartCard } from "../../ChartCard";
import { TokenSwitch } from "../TokenSwitch";

const TOKENS = ["ststx", "ststxbtc", "stbtc"] as const;

interface WithdrawalsChartClientProps {
  points: StackingDAOWithdrawalsResponse["points"];
}

export const WithdrawalsChartClient = ({ points }: WithdrawalsChartClientProps) => {
  const [token, setToken] = useState<StackingDAOToken>("ststx");
  const { underlying, decimals } = stackingDAOTokens[token];

  const data = points
    .filter((point) => point.token === token)
    .map((point) => ({
      date: monthLabel(point.period),
      Instant: toUnits(point.instantAmount, decimals),
      Standard: toUnits(point.standardAmount, decimals),
    }));

  return (
    <ChartCard
      title={`Instant vs standard withdrawals in ${underlying}`}
      description="Instant ones pay out at once for a fee, standard ones after unstaking"
      actions={<TokenSwitch tokens={TOKENS} value={token} onValueChange={setToken} />}
    >
      <BarChart
        className="mt-6 pr-3"
        type="stacked"
        data={data}
        index="date"
        categories={["Instant", "Standard"]}
        colors={["orange", "indigo"]}
        valueFormatter={bigNumberValueFormatter}
      />
    </ChartCard>
  );
};
