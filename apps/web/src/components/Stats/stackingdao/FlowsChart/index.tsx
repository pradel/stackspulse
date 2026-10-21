import { fetchApi, type StackingDAOFlowsResponse } from "@/lib/api";
import { FlowsChartClient } from "./FlowsChartClient";

export const FlowsChart = async () => {
  const flows = await fetchApi<StackingDAOFlowsResponse>("/stackingdao/flows?interval=month");

  return <FlowsChartClient points={flows.points} />;
};
