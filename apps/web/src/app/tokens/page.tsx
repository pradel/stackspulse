import { env } from "@/env";
import type { TokensMarketsRouteResponse } from "@/lib/api";
import { Container, Table, Text } from "@radix-ui/themes";
import type { Metadata } from "next";
import Image from "next/image";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "stackspulse - tokens",
    description: "Explore Stacks tokens by market cap, volume, and price",
    alternates: {
      canonical: "/tokens",
    },
  };
}

export default async function ProtocolPage() {
  const data: TokensMarketsRouteResponse = await fetch(
    `${env.NEXT_PUBLIC_API_URL}/api/tokens/markets`,
  ).then((res) => res.json());

  return (
    <Container size="2" className="px-4 pt-5">
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Token</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell align="right">Price</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell align="right">24h</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell align="right">
              Market Cap
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {data.map((market) => (
            <Table.Row key={market.id}>
              <Table.Cell className="flex gap-2">
                <Image
                  className="rounded-full"
                  src={market.image}
                  alt={market.name}
                  width={20}
                  height={20}
                />
                <Text size="2">{market.name}</Text>
              </Table.Cell>
              <Table.Cell align="right">
                $
                {market.current_price.toLocaleString("en-US", {
                  maximumFractionDigits: 12,
                })}
              </Table.Cell>
              <Table.Cell align="right">
                <Text
                  size="2"
                  color={
                    market.price_change_percentage_24h >= 0 ? "green" : "red"
                  }
                >
                  {market.price_change_percentage_24h
                    ? `${market.price_change_percentage_24h.toLocaleString(
                        "en-US",
                        {
                          maximumFractionDigits: 2,
                        },
                      )}%`
                    : ""}
                </Text>
              </Table.Cell>
              <Table.Cell align="right">
                ${market.market_cap.toLocaleString("en-US")}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Container>
  );
}
