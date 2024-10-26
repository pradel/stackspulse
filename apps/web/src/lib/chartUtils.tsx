// Tremor chartColors [v0.1.0]

export type ColorUtility = "bg" | "stroke" | "fill" | "text";

export const chartColors = {
  orange: {
    bg: "bg-orange-9",
    stroke: "stroke-orange-9",
    fill: "fill-orange-9",
    text: "text-orange-9",
  },
  indigo: {
    bg: "bg-indigo-9",
    stroke: "stroke-indigo-9",
    fill: "fill-indigo-9",
    text: "text-indigo-9",
  },
  gray: {
    bg: "bg-gray-500",
    stroke: "stroke-gray-500",
    fill: "fill-gray-500",
    text: "text-gray-500",
  },
} as const satisfies {
  [color: string]: {
    [key in ColorUtility]: string;
  };
};

export type AvailableChartColorsKeys = keyof typeof chartColors;

export const AvailableChartColors: AvailableChartColorsKeys[] = Object.keys(
  chartColors,
) as Array<AvailableChartColorsKeys>;

export const constructCategoryColors = (
  categories: string[],
  colors: AvailableChartColorsKeys[],
): Map<string, AvailableChartColorsKeys> => {
  const categoryColors = new Map<string, AvailableChartColorsKeys>();
  categories.forEach((category, index) => {
    categoryColors.set(category, colors[index % colors.length]);
  });
  return categoryColors;
};

export const getColorClassName = (
  color: AvailableChartColorsKeys,
  type: ColorUtility,
): string => {
  const fallbackColor = {
    bg: "bg-gray-9",
    stroke: "stroke-gray-9",
    fill: "fill-gray-9",
    text: "text-gray-9",
  };
  return chartColors[color]?.[type] ?? fallbackColor[type];
};

// Tremor getYAxisDomain [v0.0.0]

export const getYAxisDomain = (
  autoMinValue: boolean,
  minValue: number | undefined,
  maxValue: number | undefined,
) => {
  const minDomain = autoMinValue ? "auto" : (minValue ?? 0);
  const maxDomain = maxValue ?? "auto";
  return [minDomain, maxDomain];
};

// Tremor hasOnlyOneValueForKey [v0.1.0]

export function hasOnlyOneValueForKey(
  // biome-ignore lint/suspicious/noExplicitAny: external
  array: any[],
  keyToCheck: string,
): boolean {
  const val: any[] = [];

  for (const obj of array) {
    if (Object.prototype.hasOwnProperty.call(obj, keyToCheck)) {
      val.push(obj[keyToCheck]);
      if (val.length > 1) {
        return false;
      }
    }
  }

  return true;
}
