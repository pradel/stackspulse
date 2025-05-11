import type { Protocol } from "@stackspulse/protocols";
import type postgres from "postgres";
import { z } from "zod";
import { sql } from "~/db/db";
import { apiCacheConfig } from "~/lib/api";
import { consola } from "~/lib/consola";
import { getValidatedQueryZod } from "~/lib/nitro";

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

  let result: postgres.Row[];
  if (mode === "direct") {
    result = await getProtocolUsersDirect({
      limit,
      daysToSubtract,
    });
  } else {
    result = await getProtocolUsersNested({
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

const getProtocolUsersDirect = async ({
  limit,
  daysToSubtract,
}: QueryParams) => {
  let dateCondition = "";
  if (daysToSubtract) {
    dateCondition = `AND txs.block_time >= EXTRACT(EPOCH FROM (NOW() - INTERVAL '${daysToSubtract} days'))`;
  }

  const result = await sql`
 SELECT
     dapps.id as protocol_name,
     COUNT(DISTINCT txs.sender_address) AS unique_senders
 FROM
     txs
 JOIN
     dapps ON txs.contract_call_contract_id = ANY (dapps.contracts)
 WHERE
   txs.type_id = 2
   ${sql.unsafe(dateCondition)}
 GROUP BY
     dapps.id
 ORDER BY
     unique_senders DESC
 LIMIT ${limit};
   `;

  return result;
};

const getProtocolUsersNested = async ({
  limit,
  daysToSubtract,
}: QueryParams) => {
  let dateCondition = "";
  if (daysToSubtract) {
    dateCondition = `AND txs.block_time >= EXTRACT(EPOCH FROM (NOW() - INTERVAL '${daysToSubtract} days'))`;
  }

  const queryStartTime = Date.now();
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

  const queryEndTime = Date.now();
  consola.debug(
    `ProtocolUsersRoute: Query executed in ${queryEndTime - queryStartTime}ms`,
  );

  return result;
};
