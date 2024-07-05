import { db } from "@/db/db";
import { transactionTable } from "@/db/schema";
import type { Protocol } from "@/lib/protocols";
import { subDays } from "date-fns";
import { countDistinct, desc, gt, sql } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

export type ProtocolUsersRouteResponse = {
  protocol: Protocol;
  uniqueSenders: number;
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

  const query = db
    .select({
      protocol: transactionTable.protocol,
      uniqueSenders: countDistinct(transactionTable.sender).as("uniqueSenders"),
    })
    .from(transactionTable)
    .groupBy(transactionTable.protocol)
    .orderBy(desc(sql`uniqueSenders`))
    .limit(params.data.limit || 10);

  if (params.data.date !== "all") {
    const daysToSubtract = {
      "7d": 7,
      "30d": 30,
    };
    const dateBegin = subDays(new Date(), daysToSubtract[params.data.date]);
    query.where(gt(transactionTable.timestamp, dateBegin));
  }

  const stats = await query;

  return Response.json(stats);
}
