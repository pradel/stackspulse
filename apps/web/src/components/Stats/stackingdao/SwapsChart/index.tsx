import { fetchApi, type StackingDAOSwapsResponse } from "@/lib/api";
import { SwapsChartClient } from "./SwapsChartClient";

export const SwapsChart = async () => {
  const swaps = await fetchApi<StackingDAOSwapsResponse>("/stackingdao/swaps?interval=month");

  return <SwapsChartClient points={swaps.points} />;
};
