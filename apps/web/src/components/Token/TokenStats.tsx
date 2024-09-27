"use client";

import { useGetTokenHolders } from "@/hooks/api/useGetTokenHolders";
import { Card, Text } from "@radix-ui/themes";

interface TokenStatsProps {
  token: string;
}

export const TokenStats = ({ token }: TokenStatsProps) => {
  const { data } = useGetTokenHolders({ token });

  return (
    <div className="mt-5 grid grid-cols-2 gap-5">
      <Card size="2">
        <Text as="div" size="2" color="gray">
          Supply
        </Text>
        <Text as="div" mt="2" size="5" weight="medium">
          {Number(data.total_supply).toLocaleString("en-US")}
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
