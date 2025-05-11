import { z } from "zod";
import { apiCacheConfig } from "~/lib/api";
import { getValidatedQueryZod } from "~/lib/nitro";
import { prisma } from "~/lib/prisma";

const tokensTransactionVolumeRouteSchema = z.object({
  token: z.string(),
});

type TokensTransactionVolumeRouteResponse = {
  date: string;
  daily_volume: string;
}[];

export default defineCachedEventHandler(async (event) => {
  const query = await getValidatedQueryZod(
    event,
    tokensTransactionVolumeRouteSchema,
  );

  const result = await prisma.$queryRaw<
    {
      date: string;
      daily_volume: string;
    }[]
  >`
    SELECT
        DATE_TRUNC('day', TO_TIMESTAMP(blocks.burn_block_time)) AS date,
        SUM(ft_events.amount::numeric) AS daily_volume
    FROM
        ft_events
    JOIN
        blocks ON ft_events.index_block_hash = blocks.index_block_hash
    WHERE
        ft_events.asset_identifier = ${query.token}
        AND ft_events.canonical = true
    GROUP BY
        DATE_TRUNC('day', TO_TIMESTAMP(blocks.burn_block_time))
    ORDER BY
        date;
  `;

  const stats: TokensTransactionVolumeRouteResponse = result.map((row) => ({
    date: row.date.slice(0, 10),
    daily_volume: row.daily_volume,
  }));

  return stats;
}, apiCacheConfig);
