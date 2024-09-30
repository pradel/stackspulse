"use client";

import { useGetTokenHolders } from "@/hooks/api/useGetTokenHolders";
import type { FtMetadataResponse } from "@hirosystems/token-metadata-api-client";
import { Link, Table, Text } from "@radix-ui/themes";

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
    <Table.Root className="mt-10">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>Rank</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Address</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell align="right">Balance</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell align="right">
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
              >
                {holder.address}
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
  );
};
