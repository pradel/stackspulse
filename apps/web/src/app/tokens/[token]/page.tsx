import { TokenInfo } from "@/components/Token/TokenInfo";
import { stacksTokensApi } from "@/lib/stacks";
import { Card, Container, Text } from "@radix-ui/themes";
import { notFound } from "next/navigation";

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

  return (
    <Container size="2" className="px-4 pt-10">
      <TokenInfo tokenInfo={tokenInfo} />

      <div className="mt-5 grid grid-cols-2 gap-5">
        <Card size="2">
          <Text as="div" size="2" color="gray">
            Supply
          </Text>
          <Text as="div" mt="2" size="5" weight="medium">
            TODO
          </Text>
        </Card>
        <Card size="2">
          <Text as="div" size="2" color="gray">
            Holders
          </Text>
          <Text as="div" mt="2" size="5" weight="medium">
            TODO
          </Text>
        </Card>
      </div>
    </Container>
  );
}
