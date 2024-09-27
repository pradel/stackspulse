import { env } from "@/env";
import type { TokensHoldersRouteResponse } from "@/lib/api";
import { useSuspenseQuery } from "@tanstack/react-query";

export const useGetTokenHolders = (params: { token: string }) => {
  return useSuspenseQuery<TokensHoldersRouteResponse>({
    queryKey: ["get-token-holders", params.token],
    queryFn: async () => {
      const url = new URL(`${env.NEXT_PUBLIC_API_URL}/api/tokens/holders`);
      url.searchParams.append("token", params.token);
      const res = await fetch(url);
      return res.json();
    },
  });
};
