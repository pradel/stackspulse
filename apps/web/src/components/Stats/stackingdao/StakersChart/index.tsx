import { fetchApi, type StackingDAOStakersResponse } from "@/lib/api";
import { StakersChartClient } from "./StakersChartClient";

export const StakersChart = async () => {
  const stakers = await fetchApi<StackingDAOStakersResponse>("/stackingdao/stakers?interval=month");

  return <StakersChartClient points={stakers.points} />;
};
