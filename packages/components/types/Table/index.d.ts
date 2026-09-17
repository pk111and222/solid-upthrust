import { JSX } from '@solidjs/web';
import { TableProps } from './types';
export type { TableProps, TableColumnType, TableRef, TableEditorContext, TableExpandableProps, TablePaginationProps, TableRowSelectionProps } from './types';
declare const Table: <T>(providedProps: TableProps<T>) => JSX.Element;
export default Table;
