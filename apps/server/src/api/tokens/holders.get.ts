import { z } from "zod";
import { apiCacheConfig } from "~/lib/api";
import { getValidatedQueryZod } from "~/lib/nitro";
import { stacksClient } from "~/lib/stacks";

const tokensHoldersRouteSchema = z.object({
  token: z.string(),
  limit: z.coerce.number().min(1).max(100).optional(),
  offset: z.coerce.number().min(0).optional(),
});

type TokensHoldersRouteResponse = {
  total_supply: string;
  total: number;
  results: {
    address: string;
    balance: string;
  }[];
};

export default defineCachedEventHandler(async (event) => {
  const query = await getValidatedQueryZod(event, tokensHoldersRouteSchema);

  const limit = query.limit ?? 20;
  const offset = query.offset ?? 0;

  const data: TokensHoldersRouteResponse = (
    await stacksClient.GET("/extended/v1/tokens/ft/{token}/holders", {
      params: {
        path: { token: query.token },
        query: { limit, offset },
      },
    })
  ).data;

  return data;
}, apiCacheConfig);
