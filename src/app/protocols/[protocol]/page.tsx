import { ProtocolInfo } from "@/components/Protocol/ProtocolInfo";
import { ProtocolTransactions } from "@/components/Protocol/ProtocolTransactions";
import { StackingDAORef } from "@/components/Protocol/StackingDAO/StackingDAORef";
import { UniqueUsersBarChart } from "@/components/Stats/UniqueUsersBarChart";
import { DepositWithdrawBarChart } from "@/components/Stats/stackingdao/DepositsWithdrawBarChart";
import { getTransactionsStats } from "@/db/transactions";
import { isProtocol, protocolsInfo } from "@/lib/protocols";
import { Card, Container, Text } from "@radix-ui/themes";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
// TODO
// Cache the page for 60 seconds
// export const revalidate = 60;

interface PageProps {
  params: { protocol: string };
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

export default async function ProtocolPage({ params }: PageProps) {
  const protocol = params.protocol;
  if (!isProtocol(protocol)) {
    notFound();
  }
  const stats = await getTransactionsStats({ protocol });

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

      <Suspense>
        <ProtocolTransactions protocol={protocol} />
      </Suspense>
    </Container>
  );
}
