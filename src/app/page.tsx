import { TopProtocolsBarList } from "@/components/Stats/TopProtocolsBarList";
import { TransactionRow } from "@/components/Transaction/TransactionRow";
import { getTransactions, getTransactionsStats } from "@/db/transactions";
import {
  Card,
  Container,
  Heading,
  Inset,
  Separator,
  Text,
} from "@radix-ui/themes";
import { Fragment, Suspense } from "react";

export const dynamic = "force-dynamic";
// TODO
// Cache the page for 60 seconds
// export const revalidate = 60;

export default async function HomePage() {
  const [transactions, stats] = await Promise.all([
    getTransactions(),
    getTransactionsStats(),
  ]);

  return (
    <Container size="2" className="px-4 pt-10">
      <div className="grid grid-cols-2 gap-5">
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
            {stats.uniqueSenders.toLocaleString("en-US")}
          </Text>
        </Card>
      </div>

      <Suspense>
        <TopProtocolsBarList />
      </Suspense>

      <div className="mt-10">
        <Heading as="h2" size="3" color="gray">
          Transactions
        </Heading>
        <div className="mt-4 md:space-y-4">
          {transactions.map((transaction) => (
            <Fragment key={transaction.txId}>
              <TransactionRow
                key={transaction.txId}
                transaction={transaction}
              />
              <Separator className="md:hidden" my="4" size="4" />
            </Fragment>
          ))}
        </div>
      </div>
    </Container>
  );
}
