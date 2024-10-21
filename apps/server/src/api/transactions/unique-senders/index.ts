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

  const start = Date.now();
  console.log("start", start);

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
    SELECT UNNEST(contracts) AS contract_address
    FROM dapps
    WHERE id = ${query.protocol}
),

address_txs AS (
    (
        SELECT tx_id, index_block_hash, microblock_hash
        FROM txs
        WHERE contract_call_contract_id IN (SELECT contract_address FROM protocol_contracts)
    )
    UNION
    (
        SELECT tx_id, index_block_hash, microblock_hash
        FROM principal_stx_txs
        WHERE principal IN (SELECT contract_address FROM protocol_contracts)
    )
    UNION
    (
        SELECT tx_id, index_block_hash, microblock_hash
        FROM stx_events
        WHERE sender IN (SELECT contract_address FROM protocol_contracts) OR recipient IN (SELECT contract_address FROM protocol_contracts)
    )
    UNION
    (
        SELECT tx_id, index_block_hash, microblock_hash
        FROM ft_events
        WHERE sender IN (SELECT contract_address FROM protocol_contracts) OR recipient IN (SELECT contract_address FROM protocol_contracts)
    )
    UNION
    (
        SELECT tx_id, index_block_hash, microblock_hash
        FROM nft_events
        WHERE sender IN (SELECT contract_address FROM protocol_contracts) OR recipient IN (SELECT contract_address FROM protocol_contracts)
    )
)


-- SELECT COUNT(*)
-- from txs
-- JOIN
--   dapps ON txs.contract_call_contract_id = ANY (dapps.contracts)
-- WHERE
--   txs.type_id = 2
--   AND dapps.id = ;

SELECT
  mb.month,
  COUNT(DISTINCT t.sender_address) AS unique_senders
FROM
  monthly_blocks mb
JOIN
    txs t ON t.block_height BETWEEN mb.min_block_height AND mb.max_block_height
JOIN
    address_txs at ON at.tx_id = t.tx_id
GROUP BY
  mb.month
ORDER BY
  mb.month ASC
  `;

  const end = Date.now();
  console.log("end", end);
  console.log("duration", end - start);

  // const stats: TransactionUniqueSendersRouteResponse = result.map((row) => ({
  //   // format of the month is "2021-08-01 00:00:00+00"
  //   // we want to output "2021-08"
  //   month: row.month.slice(0, 7),
  //   unique_senders: Number.parseInt(row.unique_senders),
  // }));

  return result;
});
// }, apiCacheConfig);
