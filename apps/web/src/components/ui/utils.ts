interface Color {
  fillColor: string;
  bgColor: string;
}

export const themeColors: {
  [key: string]: Color;
} = {
  orange: {
    fillColor: "fill-orange-9",
    bgColor: "bg-orange-9",
  },
  indigo: {
    fillColor: "fill-indigo-9",
    bgColor: "bg-indigo-9",
  },
};

export const constructCategoryColors = (
  categories: string[],
  colors: string[],
): Map<string, Color> => {
  const categoryColors = new Map<string, Color>();
  categories.forEach((category, idx) => {
    categoryColors.set(category, themeColors[colors[idx]]);
  });
  return categoryColors;
};

export const defaultValueFormatter = (value: number | string) => {
  return value.toString();
};

export const numberValueFormatter = (value: number | string) => {
  return value.toLocaleString("en-US");
};

export const bigNumberValueFormatter = (value: number | string) => {
  const num = typeof value === "string" ? Number.parseFloat(value) : value;
  if (Number.isNaN(num)) return value.toString();

  const absNum = Math.abs(num);
  if (absNum >= 1e9) {
    return `${(num / 1e9).toFixed(1)}B`;
  } else if (absNum >= 1e6) {
    return `${(num / 1e6).toFixed(1)}M`;
  } else if (absNum >= 1e3) {
    return `${(num / 1e3).toFixed(1)}K`;
  } else {
    return num.toString();
  }
};
