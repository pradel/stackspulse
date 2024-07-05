import { ProtocolInfo } from "@/components/Protocol/ProtocolInfo";
import { ProtocolTransactions } from "@/components/Protocol/ProtocolTransactions";
import { StackingDAORef } from "@/components/Protocol/StackingDAO/StackingDAORef";
import { UniqueUsersBarChart } from "@/components/Stats/UniqueUsersBarChart";
import { DepositWithdrawBarChart } from "@/components/Stats/stackingdao/DepositsWithdrawBarChart";
import { getTransactions, getTransactionsStats } from "@/db/transactions";
import {
  type Action,
  actionInfo,
  isAction,
  protocolsActions,
} from "@/lib/actions";
import { isProtocol, protocolsInfo } from "@/lib/protocols";
import { Button, Card, Container, Heading, Text } from "@radix-ui/themes";
import { IconInfoCircle } from "@tabler/icons-react";
import type { Metadata } from "next";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { Fragment, Suspense } from "react";

export const dynamic = "force-dynamic";
// TODO
// Cache the page for 60 seconds
// export const revalidate = 60;

interface PageProps {
  params: { protocol: string };
  searchParams: { action?: Action };
}

export function generateMetadata({ params }: PageProps): Metadata {
  const protocol = params.protocol;
  if (!isProtocol(protocol)) {
    notFound();
  }

  return {
    title: `stackspulse - ${protocolsInfo[protocol].name}`,
    description: `Get the latest on-chain stats for ${protocolsInfo[protocol].name}. Explore real-time feed, unique users, transactions, and more..`,
    alternates: {
      canonical: `/protocols/${protocol}`,
    },
  };
}

export default async function ProtocolPage({
  params,
  searchParams,
}: PageProps) {
  const protocol = params.protocol;
  const action = searchParams.action;
  if (!isProtocol(protocol) || (action && !isAction(action))) {
    notFound();
  }
  const stats = await getTransactionsStats({ protocol });
  const protocolActions = protocolsActions[protocol];

  return (
    <Container size="2" className="px-4 pt-10">
      <ProtocolInfo protocol={protocol} />

      {protocol === "stackingdao" ? <StackingDAORef /> : null}

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
            {stats.uniqueSenders.toLocaleString("en-US")}
          </Text>
        </Card>
      </div>

      <Suspense>
        <UniqueUsersBarChart protocol={protocol} />
      </Suspense>

      {protocol === "stackingdao" ? (
        <Suspense>
          <DepositWithdrawBarChart />
        </Suspense>
      ) : null}

      <div className="mt-10">
        <Heading as="h2" size="3" color="gray" highContrast>
          Transactions
        </Heading>
        <div className="mt-2 flex items-center gap-5">
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
          <ProtocolTransactions protocol={protocol} action={action} />
        </div>
      </div>
    </Container>
  );
}
