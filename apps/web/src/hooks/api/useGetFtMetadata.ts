import { TokensApi } from "@hirosystems/token-metadata-api-client";
import { useQuery } from "@tanstack/react-query";

const api = new TokensApi();

export const useGetFtMetadata = (params: {
  principal: string;
}) => {
  return useQuery({
    queryKey: ["get-transactions", params.principal],
    queryFn: async () => {
      const result = await api.getFtMetadata(params.principal);
      return result;
    },
  });
};
