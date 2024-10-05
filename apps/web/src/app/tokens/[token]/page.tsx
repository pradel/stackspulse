import { TokenHoldersTable } from "@/components/Token/TokenHoldersTable";
import { TokenInfo } from "@/components/Token/TokenInfo";
import { TokenStats } from "@/components/Token/TokenStats";
import { TokenTransactionsVolume } from "@/components/Token/TokenTransactionsVolume";
import { stacksTokensApi } from "@/lib/stacks";
import { Container } from "@radix-ui/themes";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { token: string };
}

export default async function ProtocolPage({ params }: PageProps) {
  const tokenInfo = await stacksTokensApi
    .getFtMetadata(params.token)
    .catch((error) => {
      if (error.status === 404) {
        return null;
      }
      throw error;
    });
  if (!tokenInfo) {
    notFound();
  }

  // TODO change once https://github.com/hirosystems/token-metadata-api/issues/268 is fixed
  const token = (tokenInfo as unknown as { asset_identifier: string })
    .asset_identifier;

  return (
    <Container size="2" className="px-4 pt-10">
      <TokenInfo tokenInfo={tokenInfo} />

      <Suspense>
        <TokenStats token={token} tokenInfo={tokenInfo} />
      </Suspense>

      <Suspense>
        <TokenTransactionsVolume token={token} tokenInfo={tokenInfo} />
      </Suspense>

      <Suspense>
        <TokenHoldersTable token={token} tokenInfo={tokenInfo} />
      </Suspense>
    </Container>
  );
}
