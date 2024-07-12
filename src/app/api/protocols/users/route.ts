import { sql } from "@/db/db";
import { type Protocol, protocolsInfo } from "@/lib/protocols";
import { storage } from "@/lib/storage";
import type { NextRequest } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

export type ProtocolUsersRouteResponse = {
  protocol_name: Protocol;
  unique_senders: number;
}[];
export type ProtocolUsersRouteQuery = {
  /**
   * Date range to query
   */
  date: "7d" | "30d" | "all";
  /**
   * Limit the number of results returned, defaults to 10
   * Minimum: 1
   * Maximum: 100
   */
  limit?: number;
};

const protocolUsersRouteSchema = z.object({
  date: z.enum(["7d", "30d", "all"]),
  limit: z.coerce.number().min(1).max(100).optional(),
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const params = protocolUsersRouteSchema.safeParse({
    date: searchParams.get("date") || undefined,
    limit: searchParams.get("limit") || undefined,
  });
  if (!params.success) {
    return Response.json(
      { success: false, message: "Invalid parameters" },
      { status: 400 },
    );
  }

  // ?, & and = are not allowed in cache keys
  const cacheKey =
    request.nextUrl.pathname + request.nextUrl.search.replace(/[?&=]/g, "_");
  const cachedData = await storage.getItem<{ expires: number; data: unknown }>(
    cacheKey,
  );
  if (cachedData && cachedData.expires > Date.now()) {
    return Response.json(cachedData.data, { status: 200 });
  }

  let dateCondition = "";
  if (params.data.date !== "all") {
    const daysToSubtract = {
      "7d": 7,
      "30d": 30,
    };
    dateCondition = `AND txs.block_time >= EXTRACT(EPOCH FROM (NOW() - INTERVAL '${daysToSubtract[params.data.date]} days'))`;
  }

  const result = await sql`
WITH recent_txs AS (
    SELECT
        txs.tx_id,
        txs.sender_address,
        txs.contract_call_contract_id as contract_id,
        txs.block_time
    FROM
        txs
    WHERE
        txs.contract_call_contract_id IN (
          ${sql.unsafe(
            `${Object.keys(protocolsInfo).flatMap(
              (protocol) =>
                `'${protocolsInfo[protocol as Protocol].contracts
                  .map((contract) => contract)
                  .join("', '")}'`,
            )}`,
          )}
        )
        ${sql.unsafe(dateCondition)}
)
SELECT
    CASE
    ${sql.unsafe(
      `${Object.keys(protocolsInfo)
        .map(
          (protocol) =>
            `WHEN recent_txs.contract_id IN ('${protocolsInfo[
              protocol as Protocol
            ].contracts
              .map((contract) => contract)
              .join("', '")}') THEN '${protocol}'`,
        )
        .join("\n")}`,
    )}
        ELSE 'Other'
    END AS protocol_name,
    COUNT(DISTINCT sender_address) AS unique_senders
FROM
    recent_txs
GROUP BY
    protocol_name
ORDER BY
    unique_senders DESC
LIMIT ${params.data.limit || 10}
  `;

  const stats: ProtocolUsersRouteResponse = result.map((stat) => ({
    protocol_name: stat.protocol_name as Protocol,
    unique_senders: Number.parseInt(stat.unique_senders),
  }));

  await storage.setItem(cacheKey, {
    data: stats,
    // Cache for 5 mins
    expires: Date.now() + 1000 * 60 * 5,
  });

  return Response.json(stats);
}
