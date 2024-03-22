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
