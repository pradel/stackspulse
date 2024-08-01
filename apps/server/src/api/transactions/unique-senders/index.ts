import { z } from "zod";
import { sql } from "~/db/db";
import { getValidatedQueryZod } from "~/lib/nitro";
import { protocols } from "~/lib/protocols";

const transactionUniqueSendersRouteSchema = z.object({
  protocol: z.enum(protocols),
});

type TransactionUniqueSendersRouteResponse = {
  month: string;
  unique_senders: number;
}[];

export default defineCachedEventHandler(
  async (event) => {
    const query = await getValidatedQueryZod(
      event,
      transactionUniqueSendersRouteSchema,
    );

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
)

SELECT
  mb.month,
  COUNT(DISTINCT txs.sender_address) AS unique_senders
FROM 
  monthly_blocks mb
JOIN
  txs ON txs.block_height BETWEEN mb.min_block_height AND mb.max_block_height
JOIN
  dapps ON txs.contract_call_contract_id = ANY (dapps.contracts)
WHERE
  txs.type_id = 2
  AND dapps.id = ${query.protocol}
GROUP BY
  mb.month
ORDER BY
  mb.month ASC
  `;

    const stats: TransactionUniqueSendersRouteResponse = result.map((row) => ({
      // format of the month is "2021-08-01 00:00:00+00"
      // we want to output "2021-08"
      month: row.month.slice(0, 7),
      unique_senders: Number.parseInt(row.unique_senders),
    }));

    return stats;
  },
  {
    shouldBypassCache(event) {
      const query = getQuery(event);
      if (query.cache === "true") {
        return true;
      }
      return false;
    },
  },
);
