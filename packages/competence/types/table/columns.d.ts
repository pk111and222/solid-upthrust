import { TableColumn, TableColumnDef, TableConfig, TableHeader, TableColumnLayout, TableState } from './types';
export declare function buildTableColumns<T>(definitions: readonly TableColumnDef<T>[], defaults?: Partial<TableColumnDef<T>>): {
    roots: TableColumn<T>[];
    leaves: TableColumn<T>[];
    byId: Map<string, TableColumn<T>>;
};
export type TableColumnsModel<T> = ReturnType<typeof buildTableColumns<T>>;
export declare const getTableVisibleColumns: <T>(model: TableColumnsModel<T>, state: Pick<TableState, "columnVisibility" | "columnOrder" | "columnPinning">, config: TableConfig<T>) => TableColumn<T>[];
export declare const getTableColumnWidth: <T>(column: TableColumn<T>, state: Pick<TableState, "columnSizing">) => number;
export declare const buildTableColumnLayout: <T>(columns: readonly TableColumn<T>[], state: Pick<TableState, "columnSizing" | "columnPinning">) => TableColumnLayout<T>[];
/** Group headers follow the actual visible order, splitting disjoint/pinned groups. */
export declare const buildTableHeaders: <T>(model: TableColumnsModel<T>, layout: readonly TableColumnLayout<T>[]) => readonly TableHeader<T>[][];
