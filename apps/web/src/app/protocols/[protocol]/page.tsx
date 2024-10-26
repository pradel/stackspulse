import { ProtocolStats } from "@/components/Protocol/ProtocolStats";
import { ProtocolTransactions } from "@/components/Protocol/ProtocolTransactions";
import { StackingDAORef } from "@/components/Protocol/StackingDAO/StackingDAORef";
import { UniqueUsersBarChart } from "@/components/Stats/UniqueUsersBarChart";
import { DepositWithdrawBarChart } from "@/components/Stats/stackingdao/DepositsWithdrawBarChart";
import { isProtocol } from "@stackspulse/protocols";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ protocol: string }>;
}

export default async function ProtocolPage(props: PageProps) {
  const params = await props.params;
  const protocol = params.protocol;
  if (!isProtocol(protocol)) {
    notFound();
  }

  return (
    <>
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

      <Suspense>
        <ProtocolTransactions protocol={protocol} />
      </Suspense>
    </>
  );
}
