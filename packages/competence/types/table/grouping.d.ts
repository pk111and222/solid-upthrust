import { TableAggregation, TableColumn, TableRowModel } from './types';
export declare function aggregateTableValues(values: readonly unknown[], aggregate: TableAggregation): unknown;
export declare function groupTableRows<T>(model: TableRowModel<T>, columns: readonly TableColumn<T>[], grouping: readonly string[]): TableRowModel<T>;
