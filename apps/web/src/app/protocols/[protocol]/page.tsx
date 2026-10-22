import { ProtocolStats } from "@/components/Protocol/ProtocolStats";
import { ProtocolTransactions } from "@/components/Protocol/ProtocolTransactions";
import { StackingDAORef } from "@/components/Protocol/StackingDAO/StackingDAORef";
import { UniqueUsersBarChart } from "@/components/Stats/UniqueUsersBarChart";
import { Activity } from "@/components/Stats/stackingdao/Activity";
import { FlowsChart } from "@/components/Stats/stackingdao/FlowsChart";
import { StackingDAOOverview } from "@/components/Stats/stackingdao/StackingDAOOverview";
import { StakersChart } from "@/components/Stats/stackingdao/StakersChart";
import { SwapsChart } from "@/components/Stats/stackingdao/SwapsChart";
import { WithdrawalsChart } from "@/components/Stats/stackingdao/WithdrawalsChart";
import { YieldChart } from "@/components/Stats/stackingdao/YieldChart";
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

  if (protocol === "stackingdao") {
    return (
      <>
        <StackingDAORef />

        <Suspense>
          <StackingDAOOverview />
        </Suspense>

        <Suspense>
          <FlowsChart />
        </Suspense>

        <Suspense>
          <YieldChart />
        </Suspense>

        <Suspense>
          <StakersChart />
        </Suspense>

        <Suspense>
          <WithdrawalsChart />
        </Suspense>

        <Suspense>
          <SwapsChart />
        </Suspense>

        <Suspense>
          <Activity />
        </Suspense>
      </>
    );
  }

  return (
    <>
      <Suspense>
        <ProtocolStats protocol={protocol} />
      </Suspense>

      <Suspense>
        <UniqueUsersBarChart protocol={protocol} />
      </Suspense>

      <Suspense>
        <ProtocolTransactions protocol={protocol} />
      </Suspense>
    </>
  );
}
