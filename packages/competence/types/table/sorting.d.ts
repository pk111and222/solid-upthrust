import { TableColumn, TableRowModel, TableSortState } from './types';
export declare const compareTableValues: (a: unknown, b: unknown) => number;
export declare function sortTableRows<T>(model: TableRowModel<T>, columns: readonly TableColumn<T>[], sorters: readonly TableSortState[], manual?: boolean): TableRowModel<T>;
