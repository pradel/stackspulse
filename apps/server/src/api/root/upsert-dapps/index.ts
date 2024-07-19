import { db } from "~/db/db";
import { dapps } from "~/db/schema";
import { conflictUpdateSetAllColumns } from "~/db/utils";
import { protocols, protocolsInfo } from "~/lib/protocols";

/**
 * Keep the DB up to date with the latest protocols
 */
export default defineEventHandler(async (event) => {
  await db
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

  return { ok: true };
});
