import { z } from "zod";
import { sql } from "~/lib/db";
import { getValidatedQueryZod } from "~/lib/nitro";
import { protocols } from "~/lib/protocols";

const transactionUniqueSendersRouteSchema = z.object({
  protocol: z.enum(protocols),
});

type TransactionUniqueSendersRouteResponse = {
  month: string;
  unique_senders: number;
}[];

export default defineEventHandler(async (event) => {
  const query = await getValidatedQueryZod(
    event,
    transactionUniqueSendersRouteSchema,
  );

  const result = await sql`
SELECT
  COUNT(DISTINCT sender_address) AS unique_senders,
  date_trunc('month', to_timestamp(txs.block_time)) as month
FROM
  txs
JOIN
  dapps ON txs.contract_call_contract_id = ANY (dapps.contracts)
WHERE
  txs.type_id = 2
  AND dapps.id = ${query.protocol}
GROUP BY
  month
ORDER BY
  month ASC
  `;

  const stats: TransactionUniqueSendersRouteResponse = result.map((row) => ({
    month: row.month,
    unique_senders: Number.parseInt(row.unique_senders),
  }));

  return stats;
});
