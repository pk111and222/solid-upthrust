import { TableConfig, TableKey, TableRowModel } from './types';
import { TableStateController } from './state';
export declare function createTableSelection<T>(config: TableConfig<T>, store: TableStateController<T>, core: () => TableRowModel<T>, filtered: () => TableRowModel<T>, page: () => TableRowModel<T>): {
    selectedKeys: import('solid-js').SourceAccessor<TableKey[]>;
    getSelectedRecords: () => (T & ({} | null))[];
    getCheckState: (key: TableKey) => "checked" | "mixed" | "unchecked";
    getSelectAllState: (scope?: "page" | "filtered" | "all") => {
        checked: boolean;
        indeterminate: boolean;
        disabled: boolean;
    };
    toggleRow: (key: TableKey, checked?: boolean) => void;
    selectAll: (checked?: boolean, scope?: "page" | "filtered" | "all") => void;
    invertSelection: (scope?: "page" | "filtered" | "all") => void;
    clearSelection: () => void;
    selectRange: (from: TableKey, to: TableKey, checked?: boolean) => void;
    isRowDisabled: (key: TableKey) => boolean;
};
