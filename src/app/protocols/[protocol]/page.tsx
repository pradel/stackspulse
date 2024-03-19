import { TransactionRow } from "@/components/Transaction/TransactionRow";
import { getTransactions, getTransactionsStats } from "@/db/transactions";
import {
  type Action,
  actionInfo,
  isAction,
  protocolsActions,
} from "@/lib/actions";
import { isProtocol, protocolsInfo } from "@/lib/protocols";
import {
  Button,
  Card,
  Container,
  Heading,
  IconButton,
  Separator,
  Text,
} from "@radix-ui/themes";
import { IconBrandX, IconWorld } from "@tabler/icons-react";
import Image from "next/image";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { Fragment } from "react";

export const dynamic = "force-dynamic";
// TODO
// Cache the page for 60 seconds
// export const revalidate = 60;

interface PageProps {
  params: { protocol: string };
  searchParams: { action?: Action };
}

export default async function ProtocolPage({
  params,
  searchParams,
}: PageProps) {
  const protocol = params.protocol;
  if (
    !isProtocol(protocol) ||
    (searchParams.action && !isAction(searchParams.action))
  ) {
    notFound();
  }
  const [transactions, stats] = await Promise.all([
    getTransactions({ protocol, action: searchParams.action }),
    getTransactionsStats({ protocol }),
  ]);
  const protocolInfo = protocolsInfo[protocol];
  const protocolActions = protocolsActions[protocol];

  return (
    <Container size="2" className="px-4 pt-10">
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
        <div className="mt-2 flex gap-5 items-center">
          <Button
            size="1"
            color="gray"
            radius="full"
            variant={searchParams.action ? "ghost" : "soft"}
            highContrast={!searchParams.action}
            asChild
          >
            <NextLink href={`/protocols/${protocol}`}>All</NextLink>
          </Button>
          {protocolActions.map((action) => {
            const Icon = actionInfo[action].icon;
            return (
              <Button
                key={action}
                size="1"
                color="gray"
                radius="full"
                variant={searchParams.action === action ? "soft" : "ghost"}
                highContrast={searchParams.action === action}
                asChild
              >
                <NextLink href={`/protocols/${protocol}?action=${action}`}>
                  {Icon ? <Icon size={14} /> : null}
                  {actionInfo[action].label}
                </NextLink>
              </Button>
            );
          })}
        </div>
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
