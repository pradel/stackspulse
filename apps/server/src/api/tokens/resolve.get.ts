import { z } from "zod";
import { env } from "~/env";
import { apiCacheConfig } from "~/lib/api";
import { getValidatedQueryZod } from "~/lib/nitro";

type CoingeckoCoinsIdResponse = {
  id: string;
  symbol: string;
  name: string;
  contract_address: string;
  platforms?: {
    stacks?: string;
  };
};

type TokensResolveRouteResponse = CoingeckoCoinsIdResponse;

const tokensResolveRouteSchema = z.object({
  id: z.string(),
});

/**
 * Resolves a coingecko token id to a deployed token contract address
 */
export default defineCachedEventHandler(
  async (event) => {
    const query = await getValidatedQueryZod(event, tokensResolveRouteSchema);

    const url = `https://api.coingecko.com/api/v3/coins/${query.id}`;

    const data: CoingeckoCoinsIdResponse = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-cg-demo-api-key": env.COINGECKO_API_KEY,
      },
    }).then((res) => res.json());

    return {
      id: data.id,
      symbol: data.symbol,
      name: data.name,
      contract_address: data.platforms?.stacks || data.contract_address,
    };
  },
  {
    ...apiCacheConfig,
    // Cache for 3 days
    maxAge: 60 * 60 * 24 * 3,
  },
);
