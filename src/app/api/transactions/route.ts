import { getTransactions } from "@/db/transactions";
import { actions } from "@/lib/actions";
import { protocols } from "@/lib/protocols";
import type { NextRequest } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";
// TODO can we cache this?

const transactionRouteSchema = z.object({
  protocol: z.enum(protocols).optional(),
  action: z.enum(actions).optional(),
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const params = transactionRouteSchema.safeParse({
    protocol: searchParams.get("protocol") || undefined,
    action: searchParams.get("action") || undefined,
  });
  if (!params.success) {
    return Response.json(
      { success: false, message: "Invalid parameters" },
      { status: 400 },
    );
  }

  const transactions = await getTransactions({
    protocol: params.data.protocol,
    action: params.data.action,
  });

  return Response.json(transactions);
}
