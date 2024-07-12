import { sql } from "@/db/postgres/db";
import { getTransactions } from "@/db/transactions";
import { protocols } from "@/lib/protocols";
import type { NextRequest } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const transactionStatsRouteSchema = z.object({
  protocol: z.enum(protocols).optional(),
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const params = transactionStatsRouteSchema.safeParse({
    protocol: searchParams.get("protocol") || undefined,
  });
  if (!params.success) {
    return Response.json(
      { success: false, message: "Invalid parameters" },
      { status: 400 },
    );
  }
  let protocolCondition = "";
  if (params.data.protocol) {
    protocolCondition = `AND dapps.id = '${params.data.protocol}'`;
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

  return Response.json(result);
}
