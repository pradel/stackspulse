import { TokensApi } from "@hirosystems/token-metadata-api-client";
import { useQuery } from "@tanstack/react-query";

const api = new TokensApi();

export const useGetFtMetadata = (params: {
  principal: string;
}) => {
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
      const result = await api.getFtMetadata(params.principal);
      return result;
    },
  });
};
