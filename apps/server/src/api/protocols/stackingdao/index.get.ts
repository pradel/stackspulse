import { sql } from "~/db/db";
import { apiCacheConfig } from "~/lib/api";
import { consola } from "~/lib/consola";
import { formatElapsedTime } from "~/utils/timeFormatter";

type StackingDAOProtocolStatsResponse = {
  month: string;
  deposits: number;
  withdrawals: number;
}[];

export default defineCachedEventHandler(async () => {
  const queryStartTime = Date.now();
  const result = await sql`
WITH monthly_blocks AS (
    SELECT
        DATE_TRUNC('month', TO_TIMESTAMP(burn_block_time)) AS month,
        MIN(block_height) AS min_block_height,
        MAX(block_height) AS max_block_height
    FROM
        blocks
    WHERE
        block_height >= 132118
    GROUP BY
        DATE_TRUNC('month', TO_TIMESTAMP(burn_block_time))
),

deposits AS (
    SELECT
        mb.month,
        SUM(se.amount) AS deposits
    FROM
        monthly_blocks mb
    JOIN
        stx_events se ON se.block_height BETWEEN mb.min_block_height AND mb.max_block_height
    WHERE
        se.recipient = 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.reserve-v1'
        AND se.sender NOT LIKE 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG%'
        AND canonical = TRUE
        AND microblock_canonical = TRUE
    GROUP BY
        mb.month
),

withdrawals AS (
    SELECT
        mb.month,
        SUM(se.amount) AS withdrawals
    FROM
        monthly_blocks mb
    JOIN
        stx_events se ON se.block_height BETWEEN mb.min_block_height AND mb.max_block_height
    WHERE
        se.sender = 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.reserve-v1'
        AND se.recipient NOT LIKE 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG%'
        AND canonical = TRUE
        AND microblock_canonical = TRUE
    GROUP BY
        mb.month
)

SELECT
    COALESCE(d.month, w.month) AS month,
    COALESCE(d.deposits, 0) AS deposits,
    COALESCE(w.withdrawals, 0) AS withdrawals
FROM
    deposits d
FULL OUTER JOIN
    withdrawals w ON d.month = w.month
WHERE
    COALESCE(d.deposits, 0) > 0 OR COALESCE(w.withdrawals, 0) > 0
ORDER BY
    month ASC
  `;

  const queryEndTime = Date.now();
  consola.debug(
    `StackingDAOProtocolStats: Query executed in ${formatElapsedTime(
      queryEndTime - queryStartTime,
    )}ms`,
  );

  const stats: StackingDAOProtocolStatsResponse = result.map((row) => ({
    // format of the month is "2021-08-01 00:00:00+00"
    // we want to output "2021-08"
    month: row.month.slice(0, 7),
    deposits: Number.parseInt(row.deposits),
    withdrawals: Number.parseInt(row.withdrawals),
  }));

  return stats;
}, apiCacheConfig);
