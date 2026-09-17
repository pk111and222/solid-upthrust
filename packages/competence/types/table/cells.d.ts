import { TableCell, TableColumn, TableRow } from './types';
/** Resolves spans against the rendered page, clipping across pin boundaries. */
export declare const buildTableCells: <T>(rows: readonly TableRow<T>[], columns: readonly TableColumn<T>[], region: (id: string) => string) => readonly TableCell<T>[][];
