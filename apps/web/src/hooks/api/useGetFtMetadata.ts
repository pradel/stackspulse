import { tokenMetadataClient } from "@/lib/stacks";
import { useQuery } from "@tanstack/react-query";

export const useGetFtMetadata = (params: { principal: string }) => {
  return useQuery({
    queryKey: ["get-transactions", params.principal],
    queryFn: async () => {
      // This is used by Velar and the metadata API doesn't support it yet
      if (
        params.principal === "SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx"
      ) {
        return {
          decimals: 6,
          symbol: "STX",
        };
      }
      const metadata = await tokenMetadataClient.GET(
        "/metadata/v1/ft/{principal}",
        {
          params: {
            path: {
              principal: params.principal,
            },
          },
        },
      );
      const tokenInfo = metadata?.data;
      return tokenInfo;
    },
  });
};
