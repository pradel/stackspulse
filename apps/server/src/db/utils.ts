import { getTableColumns, sql } from "drizzle-orm";
import type { PgTable, PgUpdateSetSource } from "drizzle-orm/pg-core";

/**
 * Set all columns except the ones with default values and merge with the current row values.
 * https://github.com/drizzle-team/drizzle-orm/issues/1728#issuecomment-1998494043
 */
export function conflictUpdateSetAllColumns<TTable extends PgTable>(
  table: TTable,
): PgUpdateSetSource<TTable> {
  const columns = getTableColumns(table);
  const conflictUpdateSet = Object.entries(columns).reduce(
    (acc, [columnName, columnInfo]) => {
      if (!columnInfo.default) {
        // @ts-ignore
        acc[columnName] = sql.raw(`excluded.${columnInfo.name}`);
      }
      return acc;
    },
    {},
  ) as PgUpdateSetSource<TTable>;
  return conflictUpdateSet;
}
