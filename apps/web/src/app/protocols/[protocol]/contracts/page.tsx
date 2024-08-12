import { Button, Link, Table } from "@radix-ui/themes";
import { isProtocol, protocolsInfo } from "@stackspulse/protocols";
import { IconPencil } from "@tabler/icons-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: PageProps): Metadata {
  const protocol = params.protocol;

  return {
    alternates: {
      canonical: `/protocols/${protocol}/contracts`,
    },
  };
}

interface PageProps {
  params: { protocol: string };
}

export default async function ProtocolPage({ params }: PageProps) {
  const protocol = params.protocol;
  if (!isProtocol(protocol)) {
    notFound();
  }

  const protocolInfo = protocolsInfo[protocol];

  return (
    <>
      <Table.Root className="mt-5">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Contract</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {protocolInfo.contracts.map((contract) => (
            <Table.Row key={contract}>
              <Table.Cell>
                <Link
                  href={`https://explorer.hiro.so/txid/${contract}?chain=mainnet`}
                  target="_blank"
                  color="gray"
                >
                  {contract}
                </Link>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      <div className="mt-5 flex justify-end">
        <Button size="1" variant="ghost" color="gray" asChild>
          <a
            href="https://github.com/pradel/stackspulse/blob/main/packages/protocols/src/protocols.ts"
            target="_blank"
            rel="noreferrer"
          >
            Edit <IconPencil size={12} />
          </a>
        </Button>
      </div>
    </>
  );
}
