/** Renderer-independent public contracts. No JSX, CSS or DOM dependencies. */
export type TableKey = string | number;
export type TableUpdater<T> = T | ((previous: T) => T);
export type TableSortOrder = 'ascend' | 'descend';
export type TableFixed = 'start' | 'end' | 'left' | 'right' | boolean;
export type TableBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
export type TableDataIndex<T> = Extract<keyof T, string | number> | readonly (string | number)[];
export type TableFilterValue = string | number | boolean;
export interface TableFilterItem {
    text: unknown;
    value: TableFilterValue;
    children?: readonly TableFilterItem[];
}
export interface TableSorter<T> {
    compare?: (a: T, b: T, order: TableSortOrder) => number;
    multiple?: number;
}
export interface TableCellProps {
    rowSpan?: number;
    colSpan?: number;
    [property: string]: unknown;
}
export type TableAggregation = 'sum' | 'min' | 'max' | 'mean' | 'count' | 'uniqueCount' | ((values: readonly unknown[]) => unknown);
export interface TableColumnDef<T> {
    key?: string;
    dataIndex?: TableDataIndex<T>;
    accessor?: (record: T, index: number) => unknown;
    title?: unknown;
    children?: readonly TableColumnDef<T>[];
    /** true means remote sorting; use 'auto' for built-in value sorting. */
    sorter?: boolean | 'auto' | TableSorter<T> | ((a: T, b: T, order: TableSortOrder) => number);
    sortOrder?: TableSortOrder | null;
    defaultSortOrder?: TableSortOrder;
    sortDirections?: readonly (TableSortOrder | null)[];
    filters?: readonly TableFilterItem[];
    filteredValue?: readonly TableFilterValue[] | null;
    defaultFilteredValue?: readonly TableFilterValue[];
    filterMultiple?: boolean;
    filterResetToDefaultFilteredValue?: boolean;
    /** Missing onFilter means the filter is remote, like antd. */
    onFilter?: (value: TableFilterValue, record: T) => boolean;
    enableGlobalFilter?: boolean;
    aggregation?: TableAggregation;
    hidden?: boolean;
    responsive?: readonly TableBreakpoint[];
    fixed?: TableFixed;
    width?: number;
    minWidth?: number;
    maxWidth?: number;
    resizable?: boolean;
    align?: 'left' | 'center' | 'right';
    ellipsis?: boolean;
    rowScope?: 'row' | 'rowgroup';
    onCell?: (record: T, rowIndex: number) => TableCellProps;
    shouldCellUpdate?: (record: T, previous: T) => boolean;
    meta?: Readonly<Record<string, unknown>>;
}
export interface TableColumn<T> {
    id: string;
    definition: TableColumnDef<T>;
    parentId?: string;
    depth: number;
    children: readonly TableColumn<T>[];
    getValue: (record: T, index: number) => unknown;
}
export interface TableRow<T> {
    /** Internal collision-free ID, distinct from the public row key. */
    id: string;
    key: TableKey;
    original: T | undefined;
    index: number;
    depth: number;
    parentId?: string;
    subRows: readonly TableRow<T>[];
    grouping?: {
        columnId: string;
        value: unknown;
    };
    getValue: (columnId: string) => unknown;
}
export interface TableRowModel<T> {
    rows: readonly TableRow<T>[];
    flatRows: readonly TableRow<T>[];
    rowsById: ReadonlyMap<string, TableRow<T>>;
    rowsByKey: ReadonlyMap<TableKey, TableRow<T>>;
}
export interface TableHeader<T> {
    /** Position of the first visible leaf represented by this header segment. */
    columnIndex: number;
    id: string;
    column: TableColumn<T>;
    depth: number;
    colSpan: number;
    rowSpan: number;
    /** Split groups when descendants move to different pinned regions. */
    region: 'start' | 'center' | 'end';
}
export interface TableCell<T> {
    id: string;
    row: TableRow<T>;
    column: TableColumn<T>;
    value: unknown;
    rowSpan: number;
    colSpan: number;
    hidden: boolean;
    props: TableCellProps;
}
export interface TableSortState {
    columnKey: string;
    order: TableSortOrder;
}
export interface TablePaginationState {
    current: number;
    pageSize: number;
}
export type TableFiltersState = Readonly<Record<string, readonly TableFilterValue[] | null>>;
export interface TableState {
    pagination: TablePaginationState;
    sorters: readonly TableSortState[];
    filters: TableFiltersState;
    globalFilter: string;
    selectedRowKeys: readonly TableKey[];
    expandedRowKeys: readonly TableKey[];
    columnVisibility: Readonly<Record<string, boolean>>;
    columnOrder: readonly string[];
    columnSizing: Readonly<Record<string, number>>;
    columnPinning: {
        start: readonly string[];
        end: readonly string[];
    };
    grouping: readonly string[];
}
export type TableAction = 'paginate' | 'sort' | 'filter' | 'select' | 'expand' | 'columns' | 'group' | 'reset' | 'state';
export interface TableChangeInfo<T> {
    action: 'paginate' | 'sort' | 'filter';
    currentDataSource: readonly T[];
}
export interface TablePaginationConfig {
    current?: number;
    defaultCurrent?: number;
    pageSize?: number;
    defaultPageSize?: number;
    total?: number;
    onChange?: (current: number, pageSize: number) => void;
}
export type TableSelectionAction = 'single' | 'multiple' | 'all' | 'invert' | 'none';
export interface TableRowSelection<T> {
    type?: 'checkbox' | 'radio';
    selectedRowKeys?: readonly TableKey[];
    defaultSelectedRowKeys?: readonly TableKey[];
    checkStrictly?: boolean;
    preserveSelectedRowKeys?: boolean;
    getCheckboxProps?: (record: T) => {
        disabled?: boolean;
    };
    onChange?: (keys: readonly TableKey[], records: readonly T[], info: {
        type: TableSelectionAction;
    }) => void;
    onSelect?: (record: T, selected: boolean, records: readonly T[]) => void;
}
export interface TableExpandable<T> {
    expandedRowKeys?: readonly TableKey[];
    defaultExpandedRowKeys?: readonly TableKey[];
    defaultExpandAllRows?: boolean;
    childrenColumnName?: string;
    /** Enables a detail panel even for rows without children. */
    rowExpandable?: (record: T) => boolean;
    onExpand?: (expanded: boolean, record: T) => void;
    onExpandedRowsChange?: (keys: readonly TableKey[]) => void;
}
export interface TableEditConfig<T> {
    /** Receives an immutable draft; untouched branches may share dataSource references. */
    validate?: (record: T, original: T) => void | Readonly<Record<string, string>> | Promise<void | Readonly<Record<string, string>>>;
    onSave: (record: T, original: T, key: TableKey) => void | Promise<void>;
}
export type TableRowStage = 'filtered' | 'grouped' | 'sorted';
export interface TableFeature<T> {
    name: string;
    stage: TableRowStage;
    /** Pure transform; return new rows instead of mutating the input model. */
    transform: (model: TableRowModel<T>, context: {
        state: TableState;
        columns: readonly TableColumn<T>[];
    }) => readonly TableRow<T>[];
}
export interface TableConfig<T> {
    dataSource: readonly T[];
    columns: readonly TableColumnDef<T>[];
    /** Antd 6 shared column defaults; specific definitions take precedence. */
    column?: Partial<TableColumnDef<T>>;
    rowKey?: Extract<keyof T, string> | ((record: T, index: number) => TableKey);
    getSubRows?: (record: T, index: number) => readonly T[] | undefined;
    state?: Partial<TableState>;
    initialState?: Partial<TableState>;
    onStateChange?: (next: TableState, info: {
        action: TableAction;
    }) => void;
    pagination?: false | TablePaginationConfig;
    rowSelection?: TableRowSelection<T>;
    expandable?: TableExpandable<T>;
    manualSorting?: boolean;
    manualFiltering?: boolean;
    manualPagination?: boolean;
    /** false (antd default): page root rows, then display their children. */
    paginateExpandedRows?: boolean;
    filterFromLeafRows?: boolean;
    globalFilterFn?: (query: string, record: T, row: TableRow<T>) => boolean;
    /** Client-side filter and sorter changes reset to page one by default. */
    autoResetPageIndex?: boolean;
    breakpoints?: Partial<Record<TableBreakpoint, boolean>>;
    sortDirections?: readonly (TableSortOrder | null)[];
    onChange?: (pagination: TablePaginationState & {
        total?: number;
    }, filters: TableFiltersState, sorter: TableSortState | readonly TableSortState[] | null, extra: TableChangeInfo<T>) => void;
    features?: readonly TableFeature<T>[];
    editing?: TableEditConfig<T>;
    virtual?: {
        estimateRowHeight?: number;
        overscan?: number;
    };
}
export interface TableColumnLayout<T> {
    column: TableColumn<T>;
    width: number;
    region: 'start' | 'center' | 'end';
    offset?: number;
    first: boolean;
    last: boolean;
}
