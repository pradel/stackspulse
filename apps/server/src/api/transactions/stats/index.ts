import { protocols } from "@stackspulse/protocols";
import { z } from "zod";
import { sql } from "~/db/db";
import { apiCacheConfig } from "~/lib/api";
import { consola } from "~/lib/consola";
import { getValidatedQueryZod } from "~/lib/nitro";
import { formatElapsedTime } from "~/utils/timeFormatter";

const transactionStatsRouteSchema = z.object({
  protocol: z.enum(protocols).optional(),
});

type TransactionStatsRouteResponse = {
  count: number;
  unique_senders: number;
};

export default defineCachedEventHandler(async (event) => {
  const query = await getValidatedQueryZod(event, transactionStatsRouteSchema);

  let protocolContractsCondition = "";
  if (query.protocol) {
    protocolContractsCondition = `WHERE dapps.id = '${query.protocol}'`;
  }

  const queryStartTime = Date.now();
  const result = await sql`
WITH protocol_contracts AS (
    SELECT UNNEST(contracts) AS contract_address
    FROM dapps
    ${sql.unsafe(protocolContractsCondition)}
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

  const queryEndTime = Date.now();
  consola.debug(
    `TransactionStatsRoute: Query executed in ${formatElapsedTime(
      queryEndTime - queryStartTime,
    )}ms`,
  );

  const stats: TransactionStatsRouteResponse = {
    count: Number.parseInt(result[0].count),
    unique_senders: Number.parseInt(result[0].unique_senders),
  };

  return stats;
}, apiCacheConfig);
