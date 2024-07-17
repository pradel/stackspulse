import { z } from "zod";
import { sql } from "~/lib/db";
import { getValidatedQueryZod } from "~/lib/nitro";

type Protocol = "TODO";

const protocolUsersRouteSchema = z.object({
  date: z.enum(["7d", "30d", "all"]),
  limit: z.coerce.number().min(1).max(100).optional(),
});

type ProtocolUsersRouteResponse = {
  protocol_name: Protocol;
  unique_senders: number;
}[];

// TODO cache swr test
export default defineEventHandler(async (event) => {
  const query = await getValidatedQueryZod(event, protocolUsersRouteSchema);
  const limit = query.limit || 10;

  let dateCondition = "";
  if (query.date !== "all") {
    const daysToSubtract = {
      "7d": 7,
      "30d": 30,
    };
    dateCondition = `AND txs.block_time >= EXTRACT(EPOCH FROM (NOW() - INTERVAL '${daysToSubtract[query.date]} days'))`;
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

  const stats: ProtocolUsersRouteResponse = result.map((stat) => ({
    protocol_name: stat.protocol_name as Protocol,
    unique_senders: Number.parseInt(stat.unique_senders),
  }));

  return stats;
});
