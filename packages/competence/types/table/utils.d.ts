import { TableKey, TableUpdater } from './types';
export declare const tableRowId: (key: TableKey) => string;
export declare const resolveTableUpdater: <T>(updater: TableUpdater<T>, previous: T) => T;
export declare const positiveInteger: (value: number | undefined, fallback: number) => number;
export declare const unique: <T>(values: readonly T[]) => T[];
export declare const readPath: (record: unknown, path: readonly (string | number)[]) => unknown;
export declare const clamp: (value: number, min: number, max: number) => number;
