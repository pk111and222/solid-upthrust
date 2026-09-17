import { TableAction, TableColumn, TableConfig, TableFilterValue, TableKey, TablePaginationState, TableRowModel, TableSortState, TableState, TableUpdater } from './types';
export declare function createTable<T>(config: TableConfig<T>): {
    getState: import('solid-js').SourceAccessor<TableState>;
    setState: (updater: Partial<TableState> | ((previous: TableState) => Partial<TableState>), action?: TableAction) => TableState;
    reset: () => TableState;
    initialState: TableState;
    getAllColumns: () => TableColumn<T>[];
    getLeafColumns: () => TableColumn<T>[];
    getColumn: (id: string) => TableColumn<T> | undefined;
    getVisibleColumns: import('solid-js').SourceAccessor<TableColumn<T>[]>;
    getColumnLayout: import('solid-js').SourceAccessor<import('./types').TableColumnLayout<T>[]>;
    getHeaderGroups: import('solid-js').SourceAccessor<readonly import('./types').TableHeader<T>[][]>;
    getTotalWidth: () => number;
    getCoreRowModel: import('solid-js').SourceAccessor<TableRowModel<T>>;
    getFilteredRowModel: import('solid-js').SourceAccessor<TableRowModel<T>>;
    getGroupedRowModel: import('solid-js').SourceAccessor<TableRowModel<T>>;
    getSortedRowModel: import('solid-js').SourceAccessor<TableRowModel<T>>;
    getExpandedRowModel: import('solid-js').SourceAccessor<TableRowModel<T>>;
    getRowModel: import('solid-js').SourceAccessor<TableRowModel<T>>;
    getRow: (key: TableKey) => import('./types').TableRow<T> | undefined;
    getCellContext: (key: TableKey, columnId: string) => {
        row: import('./types').TableRow<T>;
        column: TableColumn<T>;
        getValue: () => unknown;
    } | undefined;
    getCellRows: import('solid-js').SourceAccessor<readonly import('./types').TableCell<T>[][]>;
    getSummary: (scope?: "page" | "filtered" | "all") => {
        [k: string]: unknown;
    };
    setSorters: (updater: TableUpdater<readonly TableSortState[]>) => void;
    toggleSorting: (id: string, multiple?: boolean) => void;
    setColumnFilter: (id: string, values: readonly TableFilterValue[] | null) => void;
    resetColumnFilter: (id: string) => void;
    setFilters: (updater: TableUpdater<TableState["filters"]>) => TableState;
    setGlobalFilter: (value: string) => TableState;
    getFacetedValues: (id: string) => Map<unknown, number>;
    getPagination: () => TablePaginationState & {
        total?: number;
    };
    getPageCount: () => number;
    canNextPage: () => boolean;
    canPreviousPage: () => boolean;
    setPagination: (updater: TableUpdater<TablePaginationState>) => void;
    setPageSize: (size: number) => void;
    nextPage: () => void;
    previousPage: () => void;
    canExpand: (key: TableKey) => boolean;
    isExpanded: (key: TableKey) => boolean;
    toggleExpanded: (key: TableKey, value?: boolean) => void;
    setExpandedRowKeys: (updater: TableUpdater<readonly TableKey[]>) => void;
    toggleAllExpanded: (value: boolean) => void;
    setGrouping: (updater: TableUpdater<readonly string[]>) => TableState;
    setColumnVisibility: (id: string, visible: boolean) => void;
    setColumnOrder: (ids: readonly string[]) => TableState;
    pinColumn: (id: string, region: "start" | "end" | false) => void;
    setColumnWidth: (id: string, width: number) => void;
    resizing: import('solid-js').SourceAccessor<{
        columnId: string;
        start: number;
        width: number;
        delta: number;
    } | undefined>;
    beginColumnResize: (id: string, clientX: number) => boolean;
    updateColumnResize: (clientX: number, direction?: "ltr" | "rtl") => void;
    endColumnResize: (commit?: boolean) => void;
    selection: {
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
    editing: {
        drafts: import('solid-js').SourceAccessor<ReadonlyMap<TableKey, import('./editing').TableEditDraft<T>>>;
        getDraft: (key: TableKey) => import('./editing').TableEditDraft<T> | undefined;
        begin: (key: TableKey) => boolean;
        setValue: (key: TableKey, columnId: string, value: unknown) => boolean;
        cancel: (key: TableKey) => boolean;
        commit: (key: TableKey) => Promise<boolean>;
    };
    virtual: {
        virtualRows: () => {
            row: import('./types').TableRow<T>;
            index: number;
            start: number;
            size: number;
            end: number;
        }[];
        visibleRange: import('solid-js').SourceAccessor<[number, number]>;
        totalHeight: () => number;
        spacerPadding: () => [number, number];
        viewport: import('solid-js').SourceAccessor<number>;
        scrollTop: () => number;
        measureRow: (key: TableKey, height: number) => boolean;
        resolveScrollTo: (target: {
            key?: TableKey;
            index?: number;
            top?: number;
            align?: "start" | "center" | "end" | "nearest";
            offset?: number;
        }) => number | undefined;
        setViewport: (height: number) => void;
        setScrollTop: (top: number) => void;
        clearMeasurements: () => void;
    };
};
export type TableIns<T> = ReturnType<typeof createTable<T>>;
