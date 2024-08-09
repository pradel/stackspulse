import { ProtocolInfo } from "@/components/Protocol/ProtocolInfo";
import { ProtocolMenu } from "@/components/Protocol/ProtocolMenu";
import { isProtocol, protocolsInfo } from "@/lib/protocols";
import { Container } from "@radix-ui/themes";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

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

export default function ProtocolLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: PageProps["params"];
}>) {
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
