import { db } from "@/db/db";
import { transactionTable } from "@/db/schema";
import { env } from "@/env";
import { protocolsInfo } from "@/lib/protocols";
import { countDistinct, gt } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  // Last 7 days
  const dateBegin = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const query = db
    .select({
      protocol: transactionTable.protocol,
      uniqueSenders: countDistinct(transactionTable.sender),
    })
    .from(transactionTable)
    .where(gt(transactionTable.timestamp, dateBegin))
    .groupBy(transactionTable.protocol);
  const stats = await query;

  const data = stats.map((stat) => ({
    name: protocolsInfo[stat.protocol].name,
    value: stat.uniqueSenders,
  }));

  const params = new URLSearchParams();
  params.append("title", "Last 7 Days Unique Users");
  params.append("data", JSON.stringify(data));

  const imageUrl = `${
    env.NEXT_PUBLIC_BASE_URL
  }/api/images/weekly-users?${params.toString()}`;

  return Response.json({ ok: true, imageUrl });
}
