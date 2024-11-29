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
    SELECT UNNEST(contracts) AS contract_address
    FROM dapps
    ${sql.unsafe(protocolContractsCondition)}
),

address_txs AS (
    SELECT DISTINCT tx_id, index_block_hash, microblock_hash
    FROM (
        SELECT tx_id, index_block_hash, microblock_hash
        FROM principal_stx_txs
        WHERE EXISTS (
            SELECT 1 FROM protocol_contracts
            WHERE principal_stx_txs.principal LIKE protocol_contracts.contract_address
        )

        UNION ALL

        SELECT tx_id, index_block_hash, microblock_hash
        FROM stx_events
        WHERE EXISTS (
            SELECT 1 FROM protocol_contracts
            WHERE stx_events.sender LIKE protocol_contracts.contract_address
            OR stx_events.recipient LIKE protocol_contracts.contract_address
        )

        UNION ALL

        SELECT tx_id, index_block_hash, microblock_hash
        FROM ft_events
        WHERE EXISTS (
            SELECT 1 FROM protocol_contracts
            WHERE ft_events.sender LIKE protocol_contracts.contract_address
            OR ft_events.recipient LIKE protocol_contracts.contract_address
        )

        UNION ALL

        SELECT tx_id, index_block_hash, microblock_hash
        FROM nft_events
        WHERE EXISTS (
            SELECT 1 FROM protocol_contracts
            WHERE nft_events.sender LIKE protocol_contracts.contract_address
            OR nft_events.recipient LIKE protocol_contracts.contract_address
        )
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
  console.log("Result", result);

  const stats: TransactionStatsRouteResponse = {
    count: Number.parseInt(result[0].count),
    unique_senders: Number.parseInt(result[0].unique_senders),
  };

  return stats;
}, apiCacheConfig);
