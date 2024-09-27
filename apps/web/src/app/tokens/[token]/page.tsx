import { TokenInfo } from "@/components/Token/TokenInfo";
import { TokenStats } from "@/components/Token/TokenStats";
import { stacksTokensApi } from "@/lib/stacks";
import { Container } from "@radix-ui/themes";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { token: string };
}

export default async function ProtocolPage({ params }: PageProps) {
  const token = decodeURIComponent(params.token);
  const tokenInfo = await stacksTokensApi
    .getFtMetadata(token.split("::")[0])
    .catch((error) => {
      if (error.status === 404) {
        return null;
      }
      throw error;
    });
  if (!tokenInfo) {
    notFound();
  }

  return (
    <Container size="2" className="px-4 pt-10">
      <TokenInfo tokenInfo={tokenInfo} />

      <Suspense>
        <TokenStats token={token} />
      </Suspense>
    </Container>
  );
}
