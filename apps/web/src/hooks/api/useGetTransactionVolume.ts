import { env } from "@/env";
import type { TokensTransactionVolumeRouteResponse } from "@/lib/api";
import { useSuspenseQuery } from "@tanstack/react-query";

export const useGetTransactionVolume = (params: { token: string }) => {
  return useSuspenseQuery<TokensTransactionVolumeRouteResponse>({
    queryKey: ["get-transaction-volume", params.token],
    queryFn: async () => {
      const url = new URL(
        `${env.NEXT_PUBLIC_API_URL}/api/tokens/transaction-volume`,
      );
      url.searchParams.append("token", params.token);
      const res = await fetch(url);
      return res.json();
    },
  });
};
