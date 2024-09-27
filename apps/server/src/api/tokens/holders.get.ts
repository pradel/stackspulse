import { z } from "zod";
import { sql } from "~/db/db";
import { apiCacheConfig } from "~/lib/api";
import { getValidatedQueryZod } from "~/lib/nitro";

const tokensTransactionVolumeRouteSchema = z.object({
  token: z.string(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
});

export default defineCachedEventHandler(async (event) => {
  const query = await getValidatedQueryZod(
    event,
    tokensTransactionVolumeRouteSchema,
  );

  const limit = query.limit ?? 20;
  const offset = query.offset ?? 0;

  const result = await sql`
WITH totals AS (
    SELECT
        SUM(balance) AS total,
        COUNT(*)::int AS total_count
    FROM ft_balances
    WHERE token = ${query.token}
)
SELECT
    fb.address,
    fb.balance,
    ts.total AS total_supply,
    ts.total_count AS count,
    ROUND((fb.balance::numeric / ts.total::numeric) * 100, 2) AS percentage
FROM ft_balances fb
CROSS JOIN totals ts
WHERE fb.token = ${query.token}
ORDER BY fb.balance DESC
LIMIT ${limit}
OFFSET ${offset}
  `;

  return result;
}, apiCacheConfig);
