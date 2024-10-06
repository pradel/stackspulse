import { env } from "~/env";
import { apiCacheConfig } from "~/lib/api";

type TokensMarketsRouteResponse = {
  TODO: string;
};

type CoingeckoCoinsMarketsResponse = {
  id: string;
  symbol: string;
  name: string;
}[];

export default defineCachedEventHandler(async (event) => {
  const url =
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=stacks-ecosystem";

  const data: CoingeckoCoinsMarketsResponse[] = await fetch(url, {
    method: "GET",
    headers: {
      accept: "application/json",
      "x-cg-demo-api-key": env.COINGECKO_API_KEY,
    },
  }).then((res) => res.json());

  // console.log("data", data);

  return data;
});
// }, apiCacheConfig);
