import { TableAction, TableColumn, TableConfig, TableKey, TableState } from './types';
export declare function createTableState<T>(config: TableConfig<T>, columns: () => readonly TableColumn<T>[], expandedDefaults: readonly TableKey[]): {
    state: import('solid-js').SourceAccessor<TableState>;
    read: () => TableState;
    update: (updater: Partial<TableState> | ((previous: TableState) => Partial<TableState>), action?: TableAction) => TableState;
    initialState: TableState;
    slice: <K extends keyof TableState>(key: K) => import('solid-js').SourceAccessor<TableState[K]>;
    reset: () => TableState;
};
export type TableStateController<T> = ReturnType<typeof createTableState<T>>;
