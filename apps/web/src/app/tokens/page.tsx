import { TokenHoldersTable } from "@/components/Token/TokenHoldersTable";
import { TokenInfo } from "@/components/Token/TokenInfo";
import { TokenStats } from "@/components/Token/TokenStats";
import { TokenTransactionsVolume } from "@/components/Token/TokenTransactionsVolume";
import { env } from "@/env";
import { stacksTokensApi } from "@/lib/stacks";
import { Container, Table, Text } from "@radix-ui/themes";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

// export async function generateMetadata({
//   params,
// }: PageProps): Promise<Metadata> {
//   const tokenInfo = await stacksTokensApi
//     .getFtMetadata(params.token)
//     .catch((error) => {
//       if (error.status === 404) {
//         return null;
//       }
//       throw error;
//     });
//   if (!tokenInfo) {
//     notFound();
//   }

//   return {
//     title: `stackspulse - ${tokenInfo.name}`,
//     description: `Get the latest ${tokenInfo.name} on-chain stats. Explore holders, transaction volume, and more..`,
//     alternates: {
//       canonical: `/tokens/${params.token}`,
//     },
//   };
// }

export default async function ProtocolPage() {
  const data = await fetch(
    `${env.NEXT_PUBLIC_API_URL}/api/tokens/markets`,
  ).then((res) => res.json());

  console.log("data", data);

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
