import { getTableColumns, sql } from "drizzle-orm";
import type {
  SQLiteTable,
  SQLiteUpdateSetSource,
} from "drizzle-orm/sqlite-core";

/**
 * Set all columns except the ones with default values and merge with the current row values.
 * https://github.com/drizzle-team/drizzle-orm/issues/1728#issuecomment-1998494043
 */
export function conflictUpdateSetAllColumns<TTable extends SQLiteTable>(
  table: TTable,
): SQLiteUpdateSetSource<TTable> {
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
  ) as SQLiteUpdateSetSource<TTable>;
  return conflictUpdateSet;
}
