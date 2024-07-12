import { prisma } from "@/lib/prisma";
import { protocols, protocolsInfo } from "@/lib/protocols";

export const dynamic = "force-dynamic";

export async function GET() {
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
  }

  return Response.json({ ok: true });
}
