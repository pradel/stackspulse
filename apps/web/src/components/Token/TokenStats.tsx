"use client";

import { useGetTokenHolders } from "@/hooks/api/useGetTokenHolders";
import type { FtMetadataResponse } from "@/lib/stacks";
import { Card, Text } from "@radix-ui/themes";

interface TokenStatsProps {
  token: string;
  tokenInfo: FtMetadataResponse;
}

export const TokenStats = ({ token, tokenInfo }: TokenStatsProps) => {
  const { data } = useGetTokenHolders({ token, limit: 1 });

  return (
    <div className="mt-5 grid grid-cols-2 gap-5">
      <Card size="2">
        <Text as="div" size="2" color="gray">
          Supply
        </Text>
        <Text
          as="div"
          mt="2"
          size="5"
          weight="medium"
          title={data.total_supply}
        >
          {Number(
            Number(data.total_supply) / Number(10 ** (tokenInfo.decimals ?? 0)),
          ).toLocaleString("en-US")}
        </Text>
      </Card>
      <Card size="2">
        <Text as="div" size="2" color="gray">
          Holders
        </Text>
        <Text as="div" mt="2" size="5" weight="medium">
          {data.total.toLocaleString("en-US")}
        </Text>
      </Card>
    </div>
  );
};
