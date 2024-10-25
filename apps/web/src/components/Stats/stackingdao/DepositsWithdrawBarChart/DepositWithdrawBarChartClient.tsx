"use client";
import { BarChart } from "@/components/ui/BarChart";
import { displayPrice } from "@/lib/currencies";
import { Card, Inset, Separator, Text } from "@radix-ui/themes";

interface DepositWithdrawBarChartClientProps {
  data: {
    date: string;
    withdrawals: number;
    deposits: number;
  }[];
}

export const DepositWithdrawBarChartClient = ({
  data,
}: DepositWithdrawBarChartClientProps) => {
  return (
    <Card size="2" className="mt-5">
      <Text as="div" size="2" weight="medium" color="gray" highContrast>
        Deposits and Withdrawals in STX
      </Text>
      <Text className="mt-1" as="div" size="1" color="gray">
        Amount of deposits and withdrawals made by users per month
      </Text>
      <Inset py="current" side="bottom">
        <Separator size="4" />
      </Inset>
      <BarChart
        showLegend={false}
        className="mt-6 pr-3"
        data={data}
        index="date"
        categories={["deposits", "withdrawals"]}
        colors={["orange", "indigo"]}
        valueFormatter={(value) => displayPrice(value, 6)}
      />
    </Card>
  );
};
