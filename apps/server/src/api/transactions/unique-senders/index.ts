import { protocols } from "@stackspulse/protocols";
import { z } from "zod";
import { sql } from "~/db/db";
import { apiCacheConfig } from "~/lib/api";
import { getValidatedQueryZod } from "~/lib/nitro";

const transactionUniqueSendersRouteSchema = z.object({
  protocol: z.enum(protocols),
});

type TransactionUniqueSendersRouteResponse = {
  month: string;
  unique_senders: number;
}[];

export default defineCachedEventHandler(async (event) => {
  const query = await getValidatedQueryZod(
    event,
    transactionUniqueSendersRouteSchema,
  );

  const startTime = Date.now();

  const result = await sql`
WITH monthly_blocks AS (
    SELECT
        DATE_TRUNC('month', TO_TIMESTAMP(burn_block_time)) AS month,
        MIN(block_height) AS min_block_height,
        MAX(block_height) AS max_block_height
    FROM
        blocks
    GROUP BY
        DATE_TRUNC('month', TO_TIMESTAMP(burn_block_time))
),

protocol_contracts AS (
    SELECT DISTINCT contract_id as contract_address
    FROM smart_contracts
    WHERE contract_id LIKE ANY (
        SELECT contract_address
        FROM dapps, UNNEST(contracts) AS contract_address
        WHERE id = ${query.protocol}
    )
),

address_txs AS (
    SELECT DISTINCT tx_id, index_block_hash, microblock_hash
    FROM (
        SELECT tx_id, index_block_hash, microblock_hash, principal
        FROM principal_stx_txs
        WHERE principal IN (SELECT contract_address FROM protocol_contracts)
        UNION ALL
        SELECT tx_id, index_block_hash, microblock_hash, sender
        FROM stx_events
        WHERE sender IN (SELECT contract_address FROM protocol_contracts)
        UNION ALL
        SELECT tx_id, index_block_hash, microblock_hash, recipient
        FROM stx_events
        WHERE recipient IN (SELECT contract_address FROM protocol_contracts)
        UNION ALL
        SELECT tx_id, index_block_hash, microblock_hash, sender
        FROM ft_events
        WHERE sender IN (SELECT contract_address FROM protocol_contracts)
        UNION ALL
        SELECT tx_id, index_block_hash, microblock_hash, recipient
        FROM ft_events
        WHERE recipient IN (SELECT contract_address FROM protocol_contracts)
        UNION ALL
        SELECT tx_id, index_block_hash, microblock_hash, sender
        FROM nft_events
        WHERE sender IN (SELECT contract_address FROM protocol_contracts)
        UNION ALL
        SELECT tx_id, index_block_hash, microblock_hash, recipient
        FROM nft_events
        WHERE recipient IN (SELECT contract_address FROM protocol_contracts)
    ) sub
)

SELECT
  mb.month,
  COUNT(DISTINCT txs.sender_address) AS unique_senders
FROM
  monthly_blocks mb
JOIN
    txs ON txs.block_height BETWEEN mb.min_block_height AND mb.max_block_height
JOIN
    address_txs atxs ON atxs.tx_id = txs.tx_id
GROUP BY
  mb.month
ORDER BY
  mb.month ASC
  `;

  const endTime = Date.now();
  console.log(
    `[api/transactions/unique-senders] ${query.protocol} took ${
      endTime - startTime
    }ms`,
  );

  const stats: TransactionUniqueSendersRouteResponse = result.map((row) => ({
    // format of the month is "2021-08-01 00:00:00+00"
    // we want to output "2021-08"
    month: row.month.slice(0, 7),
    unique_senders: Number.parseInt(row.unique_senders),
  }));

  return stats;
}, apiCacheConfig);
