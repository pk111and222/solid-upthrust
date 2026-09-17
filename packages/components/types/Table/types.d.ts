import { JSX } from '@solidjs/web';
import { TableColumnDef, TableConfig, TableExpandable, TableIns, TableKey, TablePaginationConfig, TableRowSelection } from 'upthrust-competence';
export interface TableEditorContext<T> {
    value: unknown;
    record: T;
    column: TableColumnType<T>;
    error?: string;
    disabled: boolean;
    onChange: (value: unknown) => void;
}
export interface TableColumnType<T> extends Omit<TableColumnDef<T>, 'children' | 'title'> {
    title?: JSX.Element;
    children?: readonly TableColumnType<T>[];
    render?: (value: unknown, record: T, index: number) => JSX.Element;
    editable?: boolean;
    editor?: (context: TableEditorContext<T>) => JSX.Element;
    class?: string;
}
export interface TableExpandableProps<T> extends TableExpandable<T> {
    expandedRowRender?: (record: T, index: number) => JSX.Element;
    indentSize?: number;
}
export interface TablePaginationProps extends TablePaginationConfig {
    pageSizeOptions?: number[];
    hideOnSinglePage?: boolean;
    showQuickJumper?: boolean;
    showTotal?: (total: number, range: [number, number]) => JSX.Element;
}
export interface TableRowSelectionProps<T> extends TableRowSelection<T> {
    columnTitle?: JSX.Element;
    columnWidth?: number;
    fixed?: boolean;
}
export interface TableRef<T> {
    nativeElement: HTMLDivElement;
    table: TableIns<T>;
    scrollTo: (target: {
        key?: TableKey;
        index?: number;
        top?: number;
        align?: 'start' | 'center' | 'end' | 'nearest';
    }) => void;
}
export interface TableProps<T> extends Omit<TableConfig<T>, 'columns' | 'column' | 'expandable' | 'pagination' | 'rowSelection' | 'virtual'> {
    columns: readonly TableColumnType<T>[];
    column?: Partial<TableColumnType<T>>;
    expandable?: TableExpandableProps<T>;
    pagination?: false | TablePaginationProps;
    rowSelection?: TableRowSelectionProps<T>;
    virtual?: boolean | TableConfig<T>['virtual'];
    scroll?: {
        x?: number | string;
        y?: number;
    };
    sticky?: boolean | {
        offsetHeader?: number;
    };
    size?: 'small' | 'middle' | 'large';
    bordered?: boolean;
    striped?: boolean;
    loading?: boolean;
    showHeader?: boolean;
    caption?: JSX.Element;
    title?: (data: readonly T[]) => JSX.Element;
    footer?: (data: readonly T[]) => JSX.Element;
    summary?: (data: readonly T[], table: TableIns<T>) => JSX.Element;
    emptyText?: JSX.Element;
    rowClassName?: string | ((record: T, index: number) => string);
    onRow?: (record: T, index: number) => JSX.HTMLAttributes<HTMLTableRowElement>;
    onRowClick?: (record: T, event: MouseEvent) => void;
    ref?: (instance: TableRef<T>) => void;
    id?: string;
    'aria-label'?: string;
    class?: string;
    style?: JSX.CSSProperties;
}
