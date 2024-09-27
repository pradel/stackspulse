import { ProtocolStats } from "@/components/Protocol/ProtocolStats";
import { ProtocolTransactions } from "@/components/Protocol/ProtocolTransactions";
import { StackingDAORef } from "@/components/Protocol/StackingDAO/StackingDAORef";
import { UniqueUsersBarChart } from "@/components/Stats/UniqueUsersBarChart";
import { DepositWithdrawBarChart } from "@/components/Stats/stackingdao/DepositsWithdrawBarChart";
import { TokenInfo } from "@/components/Token/TokenInfo";
import { stacksTokensApi } from "@/lib/stacks";
import { Container } from "@radix-ui/themes";
import { isProtocol, protocolsInfo } from "@stackspulse/protocols";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { token: string };
}

export default async function ProtocolPage({ params }: PageProps) {
  const token = params.token.split("%3A%3A")[0];
  const tokenInfo = await stacksTokensApi
    .getFtMetadata(token)
    .catch((error) => {
      if (error.status === 404) {
        return null;
      }
      throw error;
    });
  if (!tokenInfo) {
    notFound();
  }
  console.log(tokenInfo);

  return (
    <Container size="2" className="px-4 pt-10">
      <TokenInfo tokenInfo={tokenInfo} />
    </Container>
  );
}
