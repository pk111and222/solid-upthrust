import { TableColumn, TableConfig, TableFiltersState, TableRowModel } from './types';
export declare function filterTableRows<T>(model: TableRowModel<T>, columns: readonly TableColumn<T>[], filters: TableFiltersState, globalFilter: string, config: TableConfig<T>): TableRowModel<T>;
/** Faceting applies every other filter, but excludes the column's own filter. */
export declare function getTableFacetedValues<T>(model: TableRowModel<T>, columns: readonly TableColumn<T>[], filters: TableFiltersState, globalFilter: string, config: TableConfig<T>, columnId: string): Map<unknown, number>;
