"use client";

import { BarChart } from "@/components/ui/BarChart";
import { bigNumberValueFormatter } from "@/components/ui/utils";
import type { StackingDAOSwapsResponse } from "@/lib/api";
import { monthLabel, stackingDAOTokens, toUnits } from "@/lib/stackingdao";
import { ChartCard } from "../../ChartCard";

const TO_STSTXBTC = "stSTX → stSTXbtc";
const TO_STSTX = "stSTXbtc → stSTX";

interface SwapsChartClientProps {
  points: StackingDAOSwapsResponse["points"];
}

export const SwapsChartClient = ({ points }: SwapsChartClientProps) => {
  const { decimals } = stackingDAOTokens.ststxbtc;
  const byMonth = new Map<string, { date: string; [TO_STSTXBTC]: number; [TO_STSTX]: number }>();
  for (const point of points) {
    const date = monthLabel(point.period);
    const row = byMonth.get(date) ?? { date, [TO_STSTXBTC]: 0, [TO_STSTX]: 0 };
    // stSTXbtc is 1:1 with STX, so its amount is the STX value swapped.
    const value = toUnits(point.ststxbtcAmount, decimals);
    if (point.action === "swap-ststx-for-ststxbtc") {
      row[TO_STSTXBTC] += value;
    } else {
      row[TO_STSTX] += value;
    }
    byMonth.set(date, row);
  }

  return (
    <ChartCard
      title="Swaps between stSTX and stSTXbtc"
      description="STX value swapped per month in each direction"
    >
      <BarChart
        className="mt-6 pr-3"
        data={[...byMonth.values()]}
        index="date"
        categories={[TO_STSTXBTC, TO_STSTX]}
        colors={["orange", "indigo"]}
        valueFormatter={bigNumberValueFormatter}
      />
    </ChartCard>
  );
};
