"use client";
import { type Protocol, protocolsInfo } from "@/lib/protocols";
import { Card, Inset, Separator, Text } from "@radix-ui/themes";
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
    protocol: Protocol;
    month: string;
    uniqueSenders: number;
  }[];
}

export const UniqueUsersBarChartClient = ({
  data,
}: UniqueUsersBarChartProps) => {
  // To format we need to group by month
  const formattedData: {
    date: string;
    arkadiko: number;
    alex: number;
    stackswap: number;
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
        stackswap: protocol === "stackswap" ? uniqueSenders : 0,
      });
    }
  }

  const categories: {
    name: Protocol;
    fillColor: string;
    bgColor: string;
  }[] = [
    {
      name: "stackswap",
      fillColor: "fill-cyan-9",
      bgColor: "bg-cyan-9",
    },
    {
      name: "arkadiko",
      fillColor: "fill-iris-9",
      bgColor: "bg-iris-9",
    },
    {
      name: "alex",
      fillColor: "fill-blue-9",
      bgColor: "bg-blue-9",
    },
  ];

  return (
    <Card size="2" className="mt-5">
      <Text as="div" size="2" weight="medium" color="gray" highContrast>
        Unique users
      </Text>
      <Text className="mt-1" as="div" size="1" color="gray">
        Total unique addresses per month per protocol
      </Text>
      <Inset py="current" side="bottom">
        <Separator size="4" />
      </Inset>
      <div className="mt-10 h-[300px] pr-3">
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
                    {payload
                      ?.map((p) => {
                        const category = categories.find(
                          (c) => c.name === p.dataKey,
                        );
                        if (!category) return null;
                        return (
                          <div
                            key={p.dataKey}
                            className="flex items-center gap-2"
                          >
                            <div
                              className={`size-2 ${category.bgColor} rounded-full`}
                            />
                            <Text as="div" size="2" color="gray">
                              {protocolsInfo[category.name].name}:{" "}
                              <Text color="gray" highContrast>
                                {p.value?.toLocaleString("en-US")}
                              </Text>
                            </Text>
                          </div>
                        );
                      })
                      .reverse()}
                  </div>
                </div>
              )}
            />
            {categories.map((info) => (
              <Bar
                key={info.name}
                dataKey={info.name}
                stackId="a"
                className={info.fillColor}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
