import type { TransactionStatus } from "@stacks/stacks-blockchain-api-types";
import { z } from "zod";
import { sql } from "~/db/db";
import { apiCacheConfig } from "~/lib/api";
import { getValidatedQueryZod } from "~/lib/nitro";
import { protocols } from "~/lib/protocols";
import { parseDbTx } from "~/lib/transactions";

const transactionsRouteSchema = z.object({
  protocol: z.enum(protocols).optional(),
});

type TransactionsRouteResponse = {
  protocol: string;
  tx_id: string;
  sender_address: string;
  tx_status: TransactionStatus;
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
      status: number;
      sender_address: string;
      contract_call_contract_id: string;
      contract_call_function_name: string;
      block_height: number;
      block_time: number;
    }[]
  >`
SELECT
    dapps.id as protocol,
    tx_id,
    status,
    sender_address,
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
    AND canonical = TRUE
    AND microblock_canonical = TRUE
ORDER BY
    block_height DESC,
    tx_index DESC
LIMIT 50
  `;

  const formattedResult: TransactionsRouteResponse = result.map(parseDbTx);

  return formattedResult;
}, apiCacheConfig);
