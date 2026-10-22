"use client";

import { BarChart } from "@/components/ui/BarChart";
import { numberValueFormatter } from "@/components/ui/utils";
import type { StackingDAOStakersResponse } from "@/lib/api";
import { monthLabel } from "@/lib/stackingdao";
import { ChartCard } from "../../ChartCard";

interface StakersChartClientProps {
  points: StackingDAOStakersResponse["points"];
}

export const StakersChartClient = ({ points }: StakersChartClientProps) => {
  const data = points.map((point) => ({
    date: monthLabel(point.period),
    New: point.newStakers,
    Returning: point.stakers - point.newStakers,
  }));

  return (
    <ChartCard
      title="Stakers"
      description="Addresses depositing per month, split between first-time and returning stakers"
    >
      <BarChart
        className="mt-6 pr-3"
        type="stacked"
        data={data}
        index="date"
        categories={["New", "Returning"]}
        colors={["orange", "indigo"]}
        valueFormatter={numberValueFormatter}
      />
    </ChartCard>
  );
};
