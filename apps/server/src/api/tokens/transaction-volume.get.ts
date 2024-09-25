import { sql } from "~/db/db";
import { apiCacheConfig } from "~/lib/api";

export default defineCachedEventHandler(async (event) => {
  const result = await sql`
SELECT
    DATE_TRUNC('day', TO_TIMESTAMP(blocks.burn_block_time)) AS date,
    SUM(ft_events.amount::numeric) AS daily_volume
FROM
    ft_events
JOIN
    blocks ON ft_events.index_block_hash = blocks.index_block_hash
WHERE
    ft_events.asset_identifier = 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token::welshcorgicoin'
    AND ft_events.canonical = true
GROUP BY
    DATE_TRUNC('day', TO_TIMESTAMP(blocks.burn_block_time))
ORDER BY
    date;
  `;

  const stats = result.map((row) => ({
    date: row.date.slice(0, 10),
    daily_volume: row.daily_volume,
  }));

  return stats;
}, apiCacheConfig);
