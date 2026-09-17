import { TableIns } from 'upthrust-competence';
import { TableColumnType } from './types';
export declare function TableFilter<T>(props: {
    column: TableColumnType<T>;
    id: string;
    table: TableIns<T>;
    disabled?: boolean;
}): import("@solidjs/web").JSX.Element;
