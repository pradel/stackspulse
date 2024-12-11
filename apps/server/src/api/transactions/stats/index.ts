import { protocols } from "@stackspulse/protocols";
import { z } from "zod";
import { sql } from "~/db/db";
import { apiCacheConfig } from "~/lib/api";
import { getValidatedQueryZod } from "~/lib/nitro";

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

  const result = await sql`
WITH protocol_contracts AS (
    SELECT DISTINCT contract_id as contract_address
    FROM smart_contracts
    WHERE contract_id LIKE ANY (
        SELECT contract_address
        FROM dapps, UNNEST(contracts) AS contract_address
        ${sql.unsafe(protocolContractsCondition)}
    )
),

address_txs AS (
    SELECT DISTINCT tx_id, index_block_hash, microblock_hash
    FROM (
        SELECT tx_id, index_block_hash, microblock_hash
        FROM principal_stx_txs
        WHERE principal IN (SELECT contract_address FROM protocol_contracts)

        UNION ALL

        SELECT tx_id, index_block_hash, microblock_hash
        FROM stx_events
        WHERE sender IN (SELECT contract_address FROM protocol_contracts)
           OR recipient IN (SELECT contract_address FROM protocol_contracts)

        UNION ALL

        SELECT tx_id, index_block_hash, microblock_hash
        FROM ft_events
        WHERE sender IN (SELECT contract_address FROM protocol_contracts)
           OR recipient IN (SELECT contract_address FROM protocol_contracts)

        UNION ALL

        SELECT tx_id, index_block_hash, microblock_hash
        FROM nft_events
        WHERE sender IN (SELECT contract_address FROM protocol_contracts)
           OR recipient IN (SELECT contract_address FROM protocol_contracts)
    ) combined_events
)

SELECT
  COUNT(DISTINCT address_txs.tx_id) AS count,
  COUNT(DISTINCT txs.sender_address) AS unique_senders
FROM address_txs
INNER JOIN txs USING (tx_id, index_block_hash, microblock_hash)
WHERE txs.canonical = TRUE
AND txs.microblock_canonical = TRUE;
  `;

  const stats: TransactionStatsRouteResponse = {
    count: Number.parseInt(result[0].count),
    unique_senders: Number.parseInt(result[0].unique_senders),
  };

  return stats;
}, apiCacheConfig);
