"use client";
import { Card, Heading, Separator, Text } from "@radix-ui/themes";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface UniqueUsersBarChartProps {
  data: {
    protocol: "alex" | "arkadiko";
    month: string;
    uniqueSenders: number;
  }[];
}

export const UniqueUsersBarChart = ({ data }: UniqueUsersBarChartProps) => {
  // To format we need to group by month
  const formattedData: {
    date: string;
    arkadiko: number;
    alex: number;
  }[] = [];

  for (const item of data) {
    const month = item.month;
    const protocol = item.protocol;
    const uniqueSenders = item.uniqueSenders;

    const existing = formattedData.find((d) => d.date === month);
    if (existing) {
      existing[protocol] = uniqueSenders;
    } else {
      formattedData.push({
        date: month,
        arkadiko: protocol === "arkadiko" ? uniqueSenders : 0,
        alex: protocol === "alex" ? uniqueSenders : 0,
      });
    }
  }

  return (
    <Card size="2" className="mt-5">
      <Text as="div" size="2" color="gray">
        Unique users
      </Text>
      <div className="mt-6 h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            width={500}
            height={300}
            data={formattedData}
            margin={{
              bottom: 0,
              left: 0,
              right: 0,
              top: 0,
            }}
          >
            <CartesianGrid
              className="stroke-gray-11"
              horizontal={true}
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              fill=""
              stroke=""
              className="fill-gray-11 text-1"
              tickMargin={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              type="number"
              fill=""
              stroke=""
              className="fill-gray-11 text-1"
              tickMargin={8}
            />
            <Tooltip
              cursor={{ fill: "var(--gray-11)", opacity: "0.10" }}
              content={({ label, payload }) => (
                <div className="rounded-2 bg-[var(--color-page-background)] py-3">
                  <div className="px-4">
                    <Text as="div" size="2" weight="medium">
                      {label}
                    </Text>
                  </div>
                  <Separator className="my-3" size="4" />
                  <div className="space-y-2 px-4">
                    {payload?.map((p) => (
                      <Text as="div" key={p.dataKey} size="2" color="gray">
                        {p.dataKey}:{" "}
                        <Text color="gray" highContrast>
                          {p.value}
                        </Text>
                      </Text>
                    ))}
                  </div>
                </div>
              )}
            />
            <Bar dataKey="arkadiko" stackId="a" className="fill-iris-9" />
            <Bar dataKey="alex" stackId="a" className="fill-blue-9" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
