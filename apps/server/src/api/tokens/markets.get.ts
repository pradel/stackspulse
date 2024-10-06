import { env } from "~/env";
import { apiCacheConfig } from "~/lib/api";

type CoingeckoCoinsMarketsResponse = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
}[];

type TokensMarketsRouteResponse = CoingeckoCoinsMarketsResponse;

export default defineCachedEventHandler(
  async () => {
    const url =
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=stacks-ecosystem";

    const data: CoingeckoCoinsMarketsResponse[] = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-cg-demo-api-key": env.COINGECKO_API_KEY,
      },
    }).then((res) => res.json());

    return data;
  },
  {
    ...apiCacheConfig,
    // Cache for 24 hours
    maxAge: 60 * 60 * 24,
  },
);
