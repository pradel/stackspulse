import { env } from "@/env";
import type { TransactionStatsRouteResponse } from "@/lib/api";
import { Card, Text } from "@radix-ui/themes";
import type { Protocol } from "@stackspulse/protocols";

interface ProtocolStatsProps {
  protocol: Protocol;
}

export const ProtocolStats = async ({ protocol }: ProtocolStatsProps) => {
  const stats: TransactionStatsRouteResponse = await fetch(
    `${env.NEXT_PUBLIC_API_URL}/api/transactions/stats?protocol=${protocol}`,
  ).then((res) => res.json());

  return (
    <div className="mt-5 grid grid-cols-2 gap-5">
      <Card size="2">
        <Text as="div" size="2" color="gray">
          Total Transactions
        </Text>
        <Text as="div" mt="2" size="5" weight="medium">
          {stats.count.toLocaleString("en-US")}
        </Text>
      </Card>
      <Card size="2">
        <Text as="div" size="2" color="gray">
          Unique addresses
        </Text>
        <Text as="div" mt="2" size="5" weight="medium">
          {stats.unique_senders.toLocaleString("en-US")}
        </Text>
      </Card>
    </div>
  );
};
