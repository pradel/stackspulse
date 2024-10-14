"use client";

import { useGetTokenHolders } from "@/hooks/api/useGetTokenHolders";
import type { FtMetadataResponse } from "@/lib/stacks";
import { Card, Inset, Link, Separator, Table, Text } from "@radix-ui/themes";

interface TokenHoldersTableProps {
  token: string;
  tokenInfo: FtMetadataResponse;
}

export const TokenHoldersTable = ({
  token,
  tokenInfo,
}: TokenHoldersTableProps) => {
  const { data } = useGetTokenHolders({ token, limit: 10 });

  const calculatePercentage = (balance: string) => {
    const holderBalance = Number.parseFloat(balance);
    const totalSupply = Number.parseFloat(data.total_supply);
    return ((holderBalance / totalSupply) * 100).toFixed(2);
  };

  return (
    <Card size="2" className="mt-5">
      <Text as="div" size="2" weight="medium" color="gray" highContrast>
        Holders list
      </Text>
      <Inset py="current" side="bottom">
        <Separator size="4" />
      </Inset>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Rank</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Address</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell align="right">
              Balance
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell align="right" className="whitespace-nowrap">
              % of Supply
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {data.results.map((holder, index) => (
            <Table.Row key={holder.address}>
              <Table.Cell>
                <Text size="2">{index + 1}</Text>
              </Table.Cell>
              <Table.Cell>
                <Link
                  href={`https://explorer.hiro.so/address/${holder.address}?chain=mainnet`}
                  target="_blank"
                  color="gray"
                  title={holder.address}
                >
                  {holder.address.includes(".")
                    ? `${holder.address.split(".")[0].slice(0, 20)}...${
                        holder.address.split(".")[1]
                      }`
                    : holder.address}
                </Link>
              </Table.Cell>
              <Table.Cell align="right">
                <Text size="2">
                  {(
                    Number(holder.balance) /
                    Number(10 ** (tokenInfo.decimals ?? 0))
                  ).toLocaleString("en-US")}
                </Text>
              </Table.Cell>
              <Table.Cell align="right">
                <Text size="2">{calculatePercentage(holder.balance)}%</Text>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Card>
  );
};
