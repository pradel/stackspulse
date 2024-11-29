import { ProtocolInfo } from "@/components/Protocol/ProtocolInfo";
import { ProtocolMenu } from "@/components/Protocol/ProtocolMenu";
import { Container } from "@radix-ui/themes";
import { isProtocol, protocolsInfo } from "@stackspulse/protocols";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ protocol: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
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

export default async function ProtocolLayout(
  props: Readonly<{
    children: React.ReactNode;
    params: PageProps["params"];
  }>,
) {
  const params = await props.params;

  const { children } = props;

  const protocol = params.protocol;
  if (!isProtocol(protocol)) {
    notFound();
  }

  return (
    <Container size="2" className="px-4 pt-10">
      <ProtocolInfo protocol={protocol} />

      <ProtocolMenu />

      {children}
    </Container>
  );
}
