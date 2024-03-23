import { cn } from "@/lib/cn";
import { Separator, Text } from "@radix-ui/themes";
import {
  Bar,
  CartesianGrid,
  BarChart as ReChartsBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { constructCategoryColors } from "./utils";

interface BarChartProps {
  className?: string;
  data: any[];
  index: string;
  categories: string[];
  stack?: boolean;
  colors: string[];
}

export const BarChart = ({
  className,
  data,
  index,
  categories,
  stack,
  colors,
}: BarChartProps) => {
  const categoryColors = constructCategoryColors(categories, colors);

  return (
    <div className={cn("w-full h-80", className)}>
      <ResponsiveContainer className="size-full">
        <ReChartsBarChart
          data={data}
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
            dataKey={index}
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
              <div className="min-w-[150px] rounded-2 bg-[var(--color-background)] py-3">
                <div className="px-4">
                  <Text as="div" size="2" weight="medium">
                    {label}
                  </Text>
                </div>
                <Separator className="my-3" size="4" />
                <div className="space-y-2 px-4">
                  {payload?.map((p) => {
                    return (
                      <div key={p.dataKey} className="flex items-center gap-2">
                        <div
                          className={`size-2 ${
                            categoryColors.get(p.dataKey as string)?.bgColor
                          } rounded-full`}
                        />
                        <Text as="div" size="2" color="gray">
                          {p.name}:{" "}
                          <Text color="gray" highContrast>
                            {p.value?.toLocaleString("en-US")}
                          </Text>
                        </Text>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          />
          {categories.map((category) => (
            <Bar
              key={category}
              name={category}
              type="linear"
              stackId={stack ? "a" : undefined}
              dataKey={category}
              className={categoryColors.get(category)?.fillColor}
            />
          ))}
        </ReChartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};
