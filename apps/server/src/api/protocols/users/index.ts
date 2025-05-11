import { Prisma } from "@prisma/client";
import type { Protocol } from "@stackspulse/protocols";
import { z } from "zod";
import { apiCacheConfig } from "~/lib/api";
import { getValidatedQueryZod } from "~/lib/nitro";
import { prisma } from "~/lib/prisma";

const protocolUsersRouteSchema = z.object({
  mode: z.enum(["direct", "nested"]).optional(),
  date: z.enum(["7d", "30d", "all"]),
  limit: z.coerce.number().min(1).max(100).optional(),
});

export type ProtocolUsersRouteResponse = {
  protocol_name: Protocol;
  unique_senders: number;
}[];

export default defineCachedEventHandler(async (event) => {
  const query = await getValidatedQueryZod(event, protocolUsersRouteSchema);
  const limit = query.limit || 10;
  const mode = query.mode || "nested";
  const daysToSubtractMap = {
    all: undefined,
    "7d": 7,
    "30d": 30,
  };
  const daysToSubtract = daysToSubtractMap[query.date];

  let result: { protocol_name: Protocol; unique_senders: number }[];
  if (mode === "direct") {
    result = await getProtocolUsersDirectPrisma({
      limit,
      daysToSubtract,
    });
  } else {
    result = await getProtocolUsersNestedPrisma({
      limit,
      daysToSubtract,
    });
  }

  const stats: ProtocolUsersRouteResponse = result.map((stat) => ({
    protocol_name: stat.protocol_name as Protocol,
    unique_senders: Number.parseInt(stat.unique_senders),
  }));

  return stats;
}, apiCacheConfig);

interface QueryParams {
  limit: number;
  daysToSubtract?: number;
}

const getProtocolUsersDirectPrisma = async ({
  limit,
  daysToSubtract,
}: QueryParams) => {
  const dateCondition = daysToSubtract
    ? Prisma.sql`AND txs.block_time >= EXTRACT(EPOCH FROM (NOW() - INTERVAL '${daysToSubtract} days'))`
    : Prisma.sql``;

  const result = await prisma.$queryRaw<
    {
      contract_call_contract_id: string;
      unique_senders: bigint;
    }[]
  >`
    SELECT
      contract_call_contract_id,
      COUNT(DISTINCT sender_address) AS unique_senders
    FROM
      txs
    WHERE
      type_id = 2
      ${dateCondition}
    GROUP BY
      dapps.id
    ORDER BY
      unique_senders DESC
    LIMIT ${limit}
  `;

  return result.map((r) => ({
    protocol_name: r.contract_call_contract_id,
    unique_senders: Number(r.unique_senders),
  }));
};

const getProtocolUsersNestedPrisma = async ({
  limit,
  daysToSubtract,
}: QueryParams) => {
  const dateCondition = daysToSubtract
    ? new Date(Date.now() - daysToSubtract * 24 * 60 * 60 * 1000)
    : undefined;

  const result = await prisma.$queryRaw<
    {
      contract_call_contract_id: string;
      unique_senders: bigint;
    }[]
  >`
    WITH protocol_contracts AS (
      SELECT
        id,
        UNNEST(contracts) AS contract_address
      FROM
        dapps
    ),
    address_txs AS (
      SELECT DISTINCT
        tx_id,
        index_block_hash,
        microblock_hash
      FROM
        txs
      WHERE
        contract_call_contract_id IN (SELECT contract_address FROM protocol_contracts)
        ${
          dateCondition
            ? Prisma.sql`AND block_time >= ${dateCondition}`
            : Prisma.sql``
        }
        AND canonical = TRUE
        AND microblock_canonical = TRUE
    )
    SELECT
      contract_call_contract_id,
      COUNT(DISTINCT sender_address) AS unique_senders
    FROM
      txs
    WHERE
      tx_id IN (SELECT tx_id FROM address_txs)
    GROUP BY
      contract_call_contract_id
    ORDER BY
      unique_senders DESC
    LIMIT ${limit}
  `;

  return result.map((r) => ({
    protocol_name: r.contract_call_contract_id,
    unique_senders: Number(r.unique_senders),
  }));
};
