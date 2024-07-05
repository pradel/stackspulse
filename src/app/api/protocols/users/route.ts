import { db } from "@/db/db";
import { transactionTable } from "@/db/schema";
import type { Protocol } from "@/lib/protocols";
import { subDays } from "date-fns";
import { countDistinct, gt } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

export type ProtocolUsersRouteResponse = {
  protocol: Protocol;
  uniqueSenders: number;
}[];
export type ProtocolUsersRouteQuery = {
  date: "7d" | "30d" | "all";
};

const protocolUsersRouteSchema = z.object({
  date: z.enum(["7d", "30d", "all"]),
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const params = protocolUsersRouteSchema.safeParse({
    date: searchParams.get("date") || undefined,
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
      uniqueSenders: countDistinct(transactionTable.sender),
    })
    .from(transactionTable)
    .groupBy(transactionTable.protocol);

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
