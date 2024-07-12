import { dbPg } from "@/db/postgres/db";
import { dapps } from "@/db/postgres/schema";
import { conflictUpdateSetAllColumns } from "@/db/utils";
import { protocols, protocolsInfo } from "@/lib/protocols";

export const dynamic = "force-dynamic";

/**
 * Keep the DB up to date with the latest protocols
 */
export async function GET() {
  await dbPg
    .insert(dapps)
    .values(
      protocols.map((protocol) => {
        const protocolInfo = protocolsInfo[protocol];
        return {
          id: protocol,
          contracts: [...protocolInfo.contracts],
        };
      }),
    )
    .onConflictDoUpdate({
      target: dapps.id,
      set: conflictUpdateSetAllColumns(dapps),
    });

  return Response.json({ ok: true });
}
