"use client";
import { BarChart } from "@/components/ui/BarChart";
import { numberValueFormatter } from "@/components/ui/utils";
import { Card, Inset, Separator, Text } from "@radix-ui/themes";
import type { Protocol } from "@stackspulse/protocols";

interface UniqueUsersBarChartProps {
  protocol: Protocol;
  data: {
    month: string;
    unique_senders: number;
  }[];
}

export const UniqueUsersBarChartClient = ({
  protocol,
  data,
}: UniqueUsersBarChartProps) => {
  const formattedData: {
    date: string;
  }[] = data.map((d) => ({
    date: d.month,
    [protocol]: d.unique_senders,
  }));

  return (
    <Card size="2" className="mt-5">
      <Text as="div" size="2" weight="medium" color="gray" highContrast>
        Unique users
      </Text>
      <Text className="mt-1" as="div" size="1" color="gray">
        Total unique addresses per month
      </Text>
      <Inset py="current" side="bottom">
        <Separator size="4" />
      </Inset>
      <BarChart
        className="mt-6 pr-3"
        data={formattedData}
        index="date"
        categories={[protocol]}
        colors={["orange"]}
        valueFormatter={numberValueFormatter}
      />
    </Card>
  );
};
