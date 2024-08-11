import { z } from "zod";
import { sql } from "~/db/db";
import { apiCacheConfig } from "~/lib/api";
import { getValidatedQueryZod } from "~/lib/nitro";
import { protocols } from "~/lib/protocols";

const transactionsRouteSchema = z.object({
  protocol: z.enum(protocols).optional(),
});

type TransactionsRouteResponse = {
  protocol: string;
  tx_id: string;
  contract_call_contract_id: string;
  contract_call_function_name: string;
  block_height: number;
  block_time: number;
}[];

export default defineCachedEventHandler(async (event) => {
  const query = await getValidatedQueryZod(event, transactionsRouteSchema);

  let protocolCondition = "";
  if (query.protocol) {
    protocolCondition = `AND dapps.id = '${query.protocol}'`;
  }

  const result = await sql<
    {
      protocol: string;
      tx_id: Buffer;
      contract_call_contract_id: string;
      contract_call_function_name: string;
      block_height: number;
      block_time: number;
    }[]
  >`
SELECT
    dapps.id as protocol,
    tx_id,
    contract_call_contract_id,
    contract_call_function_name,
    block_height,
    block_time
FROM
    txs
JOIN
    dapps ON txs.contract_call_contract_id = ANY (dapps.contracts)
WHERE
    txs.type_id = 2
    ${sql.unsafe(protocolCondition)}
ORDER BY
    block_height DESC,
    tx_index DESC
LIMIT 50
  `;

  const formattedResult: TransactionsRouteResponse = result.map((row) => ({
    protocol: row.protocol,
    tx_id: `0x${row.tx_id.toString("hex")}`,
    contract_call_contract_id: row.contract_call_contract_id,
    contract_call_function_name: row.contract_call_function_name,
    block_height: row.block_height,
    block_time: row.block_time,
  }));

  return formattedResult;
}, apiCacheConfig);
