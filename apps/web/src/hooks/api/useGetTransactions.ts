import { env } from "@/env";
import type { TransactionsRouteResponse } from "@/lib/api";
import type { Protocol } from "@stackspulse/protocols";
import { useSuspenseQuery } from "@tanstack/react-query";

export const useGetTransactions = (
  params: {
    protocol?: Protocol;
  } = {},
) => {
  return useSuspenseQuery<TransactionsRouteResponse>({
    queryKey: ["get-transactions", params.protocol],
    queryFn: async () => {
      const url = new URL(`${env.NEXT_PUBLIC_API_URL}/api/transactions`);
      if (params.protocol) {
        url.searchParams.append("protocol", params.protocol);
      }
      const res = await fetch(url);
      return res.json();
    },
  });
};
