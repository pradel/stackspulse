import { TokenHoldersTable } from "@/components/Token/TokenHoldersTable";
import { TokenInfo } from "@/components/Token/TokenInfo";
import { TokenStats } from "@/components/Token/TokenStats";
import { TokenTransactionsVolume } from "@/components/Token/TokenTransactionsVolume";
import { tokenMetadataClient } from "@/lib/stacks";
import { Container } from "@radix-ui/themes";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const metadata = await tokenMetadataClient.GET(
    "/metadata/v1/ft/{principal}",
    {
      params: {
        path: {
          principal: params.token,
        },
      },
    },
  );
  const tokenInfo = metadata?.data;
  if (!tokenInfo) {
    notFound();
  }

  return {
    title: `stackspulse - ${tokenInfo.name}`,
    description: `Get the latest ${tokenInfo.name} on-chain stats. Explore holders, transaction volume, and more..`,
    alternates: {
      canonical: `/tokens/${params.token}`,
    },
  };
}

export default async function ProtocolPage(props: PageProps) {
  const params = await props.params;
  const metadata = await tokenMetadataClient.GET(
    "/metadata/v1/ft/{principal}",
    {
      params: {
        path: {
          principal: params.token,
        },
      },
    },
  );
  const tokenInfo = metadata?.data;
  if (!tokenInfo) {
    notFound();
  }

  const token = tokenInfo.asset_identifier;

  return (
    <Container size="2" className="px-4 pt-10">
      <TokenInfo tokenInfo={tokenInfo} />

      <Suspense>
        <TokenStats tokenInfo={tokenInfo} />
      </Suspense>

      <Suspense>
        <TokenTransactionsVolume tokenInfo={tokenInfo} />
      </Suspense>

      <Suspense>
        <TokenHoldersTable tokenInfo={tokenInfo} />
      </Suspense>
    </Container>
  );
}
