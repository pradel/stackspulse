import { prisma } from "@/lib/prisma";
import { protocols, protocolsInfo } from "@/lib/protocols";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  for (const protocol of protocols) {
    const protocolInfo = protocolsInfo[protocol];
    await prisma.dapps.upsert({
      where: { id: protocol },
      update: {
        contracts: [...protocolInfo.contracts],
      },
      create: {
        id: protocol,
        contracts: [...protocolInfo.contracts],
      },
    });
    console.log(`Upserted ${protocol} contracts`);
  }

  return Response.json({ ok: true });
}
