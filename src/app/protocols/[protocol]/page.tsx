import { TransactionRow } from "@/components/Transaction/TransactionRow";
import { getTransactions, getTransactionsStats } from "@/db/transactions";
import { isProtocol, protocolsInfo } from "@/lib/protocols";
import {
  Card,
  Container,
  Heading,
  IconButton,
  Separator,
  Text,
} from "@radix-ui/themes";
import { IconBrandX, IconWorld } from "@tabler/icons-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Fragment } from "react";

export const dynamic = "force-dynamic";
// TODO
// Cache the page for 60 seconds
// export const revalidate = 60;

interface PageProps {
  params: { protocol: string };
}

export default async function ProtocolPage({ params }: PageProps) {
  const protocol = params.protocol;
  if (!isProtocol(protocol)) {
    notFound();
  }
  const transactions = await getTransactions({ protocol });
  const stats = await getTransactionsStats({ protocol });
  const protocolInfo = protocolsInfo[protocol];

  return (
    <Container size="2" className="px-4 py-10">
      <div className="flex items-start gap-5">
        <Image
          className="rounded-full"
          src={`/protocols/${protocol}.png`}
          alt={`${protocol} logo`}
          width={50}
          height={50}
          priority
        />
        <div>
          <Heading as="h1" size="5" color="gray">
            {protocolInfo.name}
          </Heading>
          <Text className="mt-1" as="p" size="2" color="gray">
            {protocolInfo.description}
          </Text>
          <div className="mt-2 space-x-2">
            <IconButton size="1" variant="ghost" color="gray" asChild>
              <a href={protocolInfo.website} target="_blank" rel="noreferrer">
                <IconWorld size={14} />
              </a>
            </IconButton>
            <IconButton size="1" variant="ghost" color="gray" asChild>
              <a href={protocolInfo.x} target="_blank" rel="noreferrer">
                <IconBrandX size={14} />
              </a>
            </IconButton>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-5">
        <Card size="2">
          <Text as="div" size="2" color="gray">
            Total Transactions
          </Text>
          <Text as="div" mt="2" size="5" weight="medium">
            {stats.count}
          </Text>
        </Card>
        <Card size="2">
          <Text as="div" size="2" color="gray">
            Unique addresses
          </Text>
          <Text as="div" mt="2" size="5" weight="medium">
            {stats.uniqueSenders}
          </Text>
        </Card>
      </div>

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
