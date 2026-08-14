import { Component, JSX } from 'solid-js';

export interface PaginationProps {
    current?: number;
    defaultCurrent?: number;
    total: number;
    pageSize?: number;
    defaultPageSize?: number;
    showQuickJumper?: boolean;
    showTotal?: (total: number, range: [number, number]) => JSX.Element;
    onChange?: (page: number, pageSize: number) => void;
    disabled?: boolean;
    hideOnSinglePage?: boolean;
    size?: 'default' | 'small';
    align?: 'start' | 'center' | 'end';
    class?: string;
    style?: JSX.CSSProperties;
}
declare const Pagination: Component<PaginationProps>;
export default Pagination;
