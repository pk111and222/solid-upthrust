import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
export interface PaginationProps {
    current?: number;
    defaultCurrent?: number;
    total: number;
    pageSize?: number;
    defaultPageSize?: number;
    /** Page-size selector options; enables the selector when provided. */
    pageSizeOptions?: number[];
    showQuickJumper?: boolean;
    showTotal?: (total: number, range: [number, number]) => JSX.Element;
    onChange?: (page: number, pageSize: number) => void;
    onShowSizeChange?: (current: number, size: number) => void;
    disabled?: boolean;
    hideOnSinglePage?: boolean;
    size?: 'default' | 'small';
    align?: 'start' | 'center' | 'end';
    class?: string;
    style?: JSX.CSSProperties;
}
declare const Pagination: Component<PaginationProps>;
export default Pagination;
