import { fetchApi, type StackingDAOYieldResponse } from "@/lib/api";
import { YieldChartClient } from "./YieldChartClient";

export const YieldChart = async () => {
  const [ststx, stbtc] = await Promise.all([
    fetchApi<StackingDAOYieldResponse>("/stackingdao/yield?token=ststx&interval=day"),
    fetchApi<StackingDAOYieldResponse>("/stackingdao/yield?token=stbtc&interval=day"),
  ]);

  return <YieldChartClient yields={{ ststx, stbtc }} />;
};
