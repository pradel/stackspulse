import { HomeTransactions } from "@/components/Home/HomeTransactions";
import { TopProtocolsBarList } from "@/components/Stats/TopProtocolsBarList";
import { TransactionRow } from "@/components/Transaction/TransactionRow";
import { getTransactions, getTransactionsStats } from "@/db/transactions";
import {
  Card,
  Container,
  Heading,
  Separator,
  Text,
  Tooltip,
} from "@radix-ui/themes";
import { IconInfoCircle } from "@tabler/icons-react";
import { Fragment, Suspense } from "react";

export const dynamic = "force-dynamic";
// TODO
// Cache the page for 60 seconds
// export const revalidate = 60;

export default async function HomePage() {
  const [stats] = await Promise.all([getTransactionsStats()]);

  return (
    <Container size="2" className="px-4 pt-10">
      <div>
        <Heading as="h1" size="4">
          stackpulse
        </Heading>
        <Heading as="h2" size="2" color="gray" weight="regular">
          Real-time on-chain Stats for Stacks DeFi.
        </Heading>
      </div>

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
            {stats.uniqueSenders.toLocaleString("en-US")}
          </Text>
        </Card>
      </div>

      <TopProtocolsBarList />

      <Suspense>
        <HomeTransactions />
      </Suspense>
    </Container>
  );
}
