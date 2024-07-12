import type { TransactionStatsRouteResponse } from "@/app/api/transactions/stats/route";
import { env } from "@/env";
import { Card, Text, Tooltip } from "@radix-ui/themes";
import { IconInfoCircle } from "@tabler/icons-react";

export const HomeStats = async () => {
  const stats: TransactionStatsRouteResponse = await fetch(
    `${env.NEXT_PUBLIC_BASE_URL}/api/transactions/stats`,
  ).then((res) => res.json());

  return (
    <div className="mt-10 grid grid-cols-2 gap-5">
      <Card size="2">
        <Text
          className="flex items-center gap-1"
          as="div"
          size="2"
          color="gray"
        >
          Total Transactions
          <Tooltip content="Total number of transactions that interacted with the protocols supported by stackspulse">
            <IconInfoCircle size={14} />
          </Tooltip>
        </Text>
        <Text as="div" mt="2" size="5" weight="medium">
          {stats.count.toLocaleString("en-US")}
        </Text>
      </Card>
      <Card size="2">
        <Text
          className="flex items-center gap-1"
          as="div"
          size="2"
          color="gray"
        >
          Unique addresses
          <Tooltip content="Total number of unique addresses that interacted with the protocols supported by stackspulse">
            <IconInfoCircle size={14} />
          </Tooltip>
        </Text>
        <Text as="div" mt="2" size="5" weight="medium">
          {stats.unique_senders.toLocaleString("en-US")}
        </Text>
      </Card>
    </div>
  );
};
