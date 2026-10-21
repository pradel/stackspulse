import {
  fetchApi,
  type StackingDAOStatsResponse,
  type StackingDAOToken,
  type StackingDAOYieldResponse,
} from "@/lib/api";
import { displayPrice } from "@/lib/currencies";
import { stackingDAOTokens } from "@/lib/stackingdao";
import { Card, Text } from "@radix-ui/themes";

export const StackingDAOOverview = async () => {
  const [stats, ststxYield, stbtcYield] = await Promise.all([
    fetchApi<StackingDAOStatsResponse>("/stackingdao/stats"),
    fetchApi<StackingDAOYieldResponse>("/stackingdao/yield?token=ststx"),
    fetchApi<StackingDAOYieldResponse>("/stackingdao/yield?token=stbtc"),
  ]);
  // stSTXbtc stays 1:1 with STX and pays its rewards in sBTC, so it has no rate to grow.
  const apy: Record<StackingDAOToken, number | null> = {
    ststx: ststxYield.apy,
    ststxbtc: null,
    stbtc: stbtcYield.apy,
  };

  return (
    <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
      {stats.tokens.map(({ token, minted, stakers, deposits }) => {
        // Token amounts are complete: core-v1 stSTX deposits print no STX amount.
        const { name, decimals } = stackingDAOTokens[token];
        const tokenApy = apy[token];
        return (
          <Card key={token} size="2">
            <Text as="div" size="2" color="gray">
              {name}
            </Text>
            <Text as="div" mt="2" size="5" weight="medium">
              {displayPrice(minted, decimals)} {name}
            </Text>
            <Text as="div" size="1" color="gray">
              minted by deposits
            </Text>
            <Text as="div" mt="3" size="1" color="gray">
              {stakers.toLocaleString("en-US")} stakers · {deposits.toLocaleString("en-US")}{" "}
              deposits
              {tokenApy === null ? null : ` · ${(tokenApy * 100).toFixed(2)}% APY (30d)`}
            </Text>
          </Card>
        );
      })}
    </div>
  );
};
