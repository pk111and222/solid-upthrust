import { TableColumn, TableConfig, TableRow, TableRowModel } from './types';
export declare const createTableRowModel: <T>(rows: readonly TableRow<T>[]) => TableRowModel<T>;
/** For expanded/page models whose rows are already a flat display sequence. */
export declare const createFlatTableRowModel: <T>(rows: readonly TableRow<T>[]) => TableRowModel<T>;
export declare function buildTableCoreRows<T>(config: TableConfig<T>, columns: readonly TableColumn<T>[]): TableRowModel<T>;
export declare const expandTableRows: <T>(rows: readonly TableRow<T>[], expanded: ReadonlySet<string | number>) => TableRow<T>[];
