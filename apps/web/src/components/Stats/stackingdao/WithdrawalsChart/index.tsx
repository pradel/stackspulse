import { fetchApi, type StackingDAOWithdrawalsResponse } from "@/lib/api";
import { WithdrawalsChartClient } from "./WithdrawalsChartClient";

export const WithdrawalsChart = async () => {
  const withdrawals = await fetchApi<StackingDAOWithdrawalsResponse>(
    "/stackingdao/withdrawals?interval=month",
  );

  return <WithdrawalsChartClient points={withdrawals.points} />;
};
