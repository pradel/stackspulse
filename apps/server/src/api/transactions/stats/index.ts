import { z } from "zod";
import { sql } from "~/lib/db";
import { getValidatedQueryZod } from "~/lib/nitro";
import { protocols } from "~/lib/protocols";

const transactionStatsRouteSchema = z.object({
  protocol: z.enum(protocols).optional(),
});

type TransactionStatsRouteResponse = {
  count: number;
  unique_senders: number;
};

export default defineEventHandler(async (event) => {
  const query = await getValidatedQueryZod(event, transactionStatsRouteSchema);

  let protocolCondition = "";
  if (query.protocol) {
    protocolCondition = `AND dapps.id = '${query.protocol}'`;
  }

  const result = await sql`
SELECT
  COUNT(txs.id) AS count,
  COUNT(DISTINCT sender_address) AS unique_senders
FROM
    txs
JOIN
    dapps ON txs.contract_call_contract_id = ANY (dapps.contracts)
WHERE
  txs.type_id = 2
  ${sql.unsafe(protocolCondition)}
  `;

  const stats: TransactionStatsRouteResponse = {
    count: Number.parseInt(result[0].count),
    unique_senders: Number.parseInt(result[0].unique_senders),
  };

  return stats;
});
