import { Prisma } from "@prisma/client";
import { protocols } from "@stackspulse/protocols";
import { z } from "zod";
import { apiCacheConfig } from "~/lib/api";
import { consola } from "~/lib/consola";
import { getValidatedQueryZod } from "~/lib/nitro";
import { prisma } from "~/lib/prisma";

const transactionStatsRouteSchema = z.object({
  protocol: z.enum(protocols).optional(),
});

type TransactionStatsRouteResponse = {
  count: number;
  unique_senders: number;
};

export default defineCachedEventHandler(async (event) => {
  const query = await getValidatedQueryZod(event, transactionStatsRouteSchema);

  const protocolCondition = query.protocol
    ? Prisma.sql`WHERE dapps.id = ${query.protocol}`
    : Prisma.sql``;

  const startTime = performance.now();
  const result = await prisma.$queryRaw<
    [
      {
        count: bigint;
        unique_senders: bigint;
      },
    ]
  >`
WITH protocol_contracts AS (
    SELECT UNNEST(contracts) AS contract_address
    FROM dapps
    ${protocolCondition}
),

address_txs AS (
    SELECT DISTINCT tx_id, index_block_hash, microblock_hash
    FROM (
        SELECT tx_id, index_block_hash, microblock_hash, contract_call_contract_id AS address
        FROM txs
        UNION ALL
        SELECT tx_id, index_block_hash, microblock_hash, principal
        FROM principal_stx_txs
        UNION ALL
        SELECT tx_id, index_block_hash, microblock_hash, sender
        FROM stx_events
        UNION ALL
        SELECT tx_id, index_block_hash, microblock_hash, recipient
        FROM stx_events
        UNION ALL
        SELECT tx_id, index_block_hash, microblock_hash, sender
        FROM ft_events
        UNION ALL
        SELECT tx_id, index_block_hash, microblock_hash, recipient
        FROM ft_events
        UNION ALL
        SELECT tx_id, index_block_hash, microblock_hash, sender
        FROM nft_events
        UNION ALL
        SELECT tx_id, index_block_hash, microblock_hash, recipient
        FROM nft_events
    ) sub
    WHERE address IN (SELECT contract_address FROM protocol_contracts)
)

SELECT
  COUNT(DISTINCT atxs.tx_id) AS count,
  COUNT(DISTINCT txs.sender_address) AS unique_senders
FROM
  txs
JOIN
  address_txs atxs ON atxs.tx_id = txs.tx_id
  AND atxs.index_block_hash = txs.index_block_hash
  AND atxs.microblock_hash = txs.microblock_hash
  `;

  const endTime = performance.now();
  const executionTime = endTime - startTime;
  consola.debug("Query execution completed in", executionTime, "ms");

  const stats: TransactionStatsRouteResponse = {
    count: Number.parseInt(result[0].count.toString()),
    unique_senders: Number.parseInt(result[0].unique_senders.toString()),
  };

  return stats;
}, apiCacheConfig);
