import { z } from "zod";
import { getValidatedQueryZod } from "~/lib/nitro";

const protocolUsersRouteSchema = z.object({
  date: z.enum(["7d", "30d", "all"]),
  limit: z.coerce.number().min(1).max(100).optional(),
});

// TODO cache swr test
export default defineEventHandler(async (event) => {
  const query = await getValidatedQueryZod(event, protocolUsersRouteSchema);

  console.log("query", query);

  return { ok: true };
});
