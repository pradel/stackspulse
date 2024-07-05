import { db } from "@/db/db";
import { transactionTable } from "@/db/schema";
import { countDistinct } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

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

  const stats = await query;

  return Response.json(stats);
}
