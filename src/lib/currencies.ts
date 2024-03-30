export const displayPrice = (
  price: bigint | number | string,
  decimals: number,
): string => {
  const priceNumber = Number(price) / 10 ** decimals;
  // For accounts < 1 (eg: BTC) we want to display 6 decimal places
  // otherwise we want to display 2 decimal places
  const maximumFractionDigits = priceNumber < 1 ? 6 : 2;
  return priceNumber.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits,
    notation: "compact",
  });
};
