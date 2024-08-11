import type { ContractCallTransaction } from "@stacks/stacks-blockchain-api-types";
import { z } from "zod";
import { sql } from "~/db/db";
import { apiCacheConfig } from "~/lib/api";
import { getValidatedQueryZod } from "~/lib/nitro";
import { type Protocol, protocols } from "~/lib/protocols";
import { stacksApi } from "~/lib/stacks-api";

const transactionsRouteSchema = z.object({
  protocol: z.enum(protocols).optional(),
});

type TransactionsRouteResponse = (ContractCallTransaction & {
  protocol: Protocol;
})[];

export default defineCachedEventHandler(async (event) => {
  const query = await getValidatedQueryZod(event, transactionsRouteSchema);

  let protocolCondition = "";
  if (query.protocol) {
    protocolCondition = `AND dapps.id = '${query.protocol}'`;
  }

  const result = await sql<
    {
      protocol: Protocol;
      tx_id: Buffer;
    }[]
  >`
SELECT
    dapps.id as protocol,
    tx_id
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

  const formattedResult = result.map((r) => ({
    protocol: r.protocol,
    tx_id: `0x${r.tx_id.toString("hex")}`,
  }));

  const data = (await stacksApi.transactions.getTxListDetails({
    txId: formattedResult.map((r) => r.tx_id),
  })) as {
    [txId: string]: { found: boolean; result: ContractCallTransaction };
  };
  const transactionsWithDetails: TransactionsRouteResponse = formattedResult
    .map((r) =>
      data[r.tx_id].found === true
        ? { protocol: r.protocol, ...data[r.tx_id].result }
        : null,
    )
    .filter((tx) => tx !== null);

  return transactionsWithDetails;
});
