import { TableColumn, TableConfig, TableKey, TableRowModel } from './types';
export interface TableEditDraft<T> {
    key: TableKey;
    original: T;
    record: T;
    status: 'editing' | 'validating' | 'saving' | 'error';
    errors: Readonly<Record<string, string>>;
}
export declare function createTableEditing<T>(config: TableConfig<T>, core: () => TableRowModel<T>, columns: () => readonly TableColumn<T>[]): {
    drafts: import('solid-js').SourceAccessor<ReadonlyMap<TableKey, TableEditDraft<T>>>;
    getDraft: (key: TableKey) => TableEditDraft<T> | undefined;
    begin: (key: TableKey) => boolean;
    setValue: (key: TableKey, columnId: string, value: unknown) => boolean;
    cancel: (key: TableKey) => boolean;
    commit: (key: TableKey) => Promise<boolean>;
};
