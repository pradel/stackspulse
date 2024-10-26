import type { Protocol } from "@stackspulse/protocols";
import { z } from "zod";
import { sql } from "~/db/db";
import { apiCacheConfig } from "~/lib/api";
import { getValidatedQueryZod } from "~/lib/nitro";

const protocolUsersRouteSchema = z.object({
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

  let dateCondition = "";
  if (query.date !== "all") {
    const daysToSubtract = {
      "7d": 7,
      "30d": 30,
    };
    dateCondition = `AND txs.block_time >= EXTRACT(EPOCH FROM (NOW() - INTERVAL '${
      daysToSubtract[query.date]
    } days'))`;
  }

  const result = await sql`
WITH protocol_contracts AS (
    SELECT id, UNNEST(contracts) AS contract_address
    FROM dapps
),

address_txs AS (
    SELECT DISTINCT tx_id, index_block_hash, microblock_hash, protocol_contracts.id AS protocol_name
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
    JOIN protocol_contracts ON sub.address = protocol_contracts.contract_address
)

SELECT
    atxs.protocol_name,
    COUNT(DISTINCT txs.sender_address) AS unique_senders
FROM
    address_txs atxs
JOIN
    txs ON atxs.tx_id = txs.tx_id
JOIN
    blocks ON txs.block_height = blocks.block_height
WHERE
    1=1
    ${sql.unsafe(dateCondition)}
GROUP BY
    atxs.protocol_name
ORDER BY
    unique_senders DESC
LIMIT ${limit};
  `;

  const stats: ProtocolUsersRouteResponse = result.map((stat) => ({
    protocol_name: stat.protocol_name as Protocol,
    unique_senders: Number.parseInt(stat.unique_senders),
  }));

  return stats;
}, apiCacheConfig);
