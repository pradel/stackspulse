import { ProtocolInfo } from "@/components/Protocol/ProtocolInfo";
import { ProtocolStats } from "@/components/Protocol/ProtocolStats";
import { ProtocolTransactions } from "@/components/Protocol/ProtocolTransactions";
import { StackingDAORef } from "@/components/Protocol/StackingDAO/StackingDAORef";
import { UniqueUsersBarChart } from "@/components/Stats/UniqueUsersBarChart";
import { DepositWithdrawBarChart } from "@/components/Stats/stackingdao/DepositsWithdrawBarChart";
import { isProtocol, protocolsInfo } from "@/lib/protocols";
import { Container } from "@radix-ui/themes";
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

  const protocolInfo = protocolsInfo[protocol];

  return {
    title: `stackspulse - ${protocolInfo.name}`,
    description: `Get the latest on-chain stats for ${protocolInfo.name}. Explore real-time feed, unique users, transactions, and more..`,
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

  const protocolInfo = protocolsInfo[protocol];

  return (
    <Container size="2" className="px-4 pt-10">
      <ProtocolInfo protocol={protocol} />

      {protocol === "stackingdao" ? <StackingDAORef /> : null}

      <Suspense>
        <ProtocolStats protocol={protocol} />
      </Suspense>

      <Suspense>
        <UniqueUsersBarChart protocol={protocol} />
      </Suspense>

      {protocol === "stackingdao" ? (
        <Suspense>
          <DepositWithdrawBarChart />
        </Suspense>
      ) : null}

      {protocolInfo.transactions ? (
        <Suspense>
          <ProtocolTransactions protocol={protocol} />
        </Suspense>
      ) : null}
    </Container>
  );
}
