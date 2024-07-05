// Inspired by https://github.com/tremorlabs/tremor/blob/bd6566b814d907e130b6827194def10b5bc3661f/src/components/vis-elements/BarList/BarList.tsx
import { cn } from "@/lib/cn";
import { Text } from "@radix-ui/themes";
import Link from "next/link";
import { themeColors } from "./utils";

export const getWidthsFromValues = (dataValues: number[]) => {
  let maxValue = Number.NEGATIVE_INFINITY;
  for (const value of dataValues) {
    maxValue = Math.max(maxValue, value);
  }

  return dataValues.map((value) => {
    if (value === 0) return 0;
    return Math.max((value / maxValue) * 100, 1);
  });
};

interface Bar {
  value: number;
  name: string;
  href: string;
}

interface BarListProps {
  className?: string;
  data: Bar[];
}

export const BarList = ({ className, data }: BarListProps) => {
  const widths = getWidthsFromValues(data.map((item) => item.value));
  const color = themeColors.orange;

  const rowHeight = "h-9";

  return (
    <div className={cn("flex justify-between space-x-6", className)}>
      <div className="relative w-full">
        {data.map((item, idx) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: For a better animation when the data changes we use index as key
            key={idx}
            className={cn(
              "flex items-center rounded-2",
              rowHeight,
              color.bgColor,
              idx === data.length - 1 ? "mb-0" : "mb-2",
            )}
            style={{
              width: `${widths[idx]}%`,
              transition: "all 1s",
            }}
          >
            <div className="absolute left-2 flex max-w-full">
              <Text size="2" asChild>
                <Link href={item.href}>{item.name}</Link>
              </Text>
            </div>
          </div>
        ))}
      </div>
      <div className="min-w-min text-right">
        {data.map((item, idx) => (
          <div
            key={item.name}
            className={cn(
              "flex justify-end items-center",
              rowHeight,
              idx === data.length - 1 ? "mb-0" : "mb-2",
            )}
          >
            <Text size="2" color="gray" weight="medium">
              {item.value.toLocaleString("en-US")}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
};
