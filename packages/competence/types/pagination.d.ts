export type PaginationConfig = {
    current?: number;
    defaultCurrent?: number;
    total: number;
    pageSize?: number;
    defaultPageSize?: number;
    onChange?: (page: number, pageSize: number) => void;
    onShowSizeChange?: (current: number, size: number) => void;
    disabled?: boolean;
};
export type PaginationIns = {
    current: () => number;
    pageSize: () => number;
    goTo: (page: number) => void;
    next: () => void;
    prev: () => void;
};
/** Page token in the rendered pager: a page number or an ellipsis marker. */
export type PageItem = number | 'prev-ellipsis' | 'next-ellipsis';
export declare const createPagination: (config: PaginationConfig) => {
    current: import('solid-js').SourceAccessor<number>;
    pageSize: import('solid-js').SourceAccessor<number>;
    totalPages: import('solid-js').SourceAccessor<number>;
    pageRange: import('solid-js').SourceAccessor<PageItem[]>;
    hasPrev: import('solid-js').SourceAccessor<boolean>;
    hasNext: import('solid-js').SourceAccessor<boolean>;
    goTo: (page: number) => void;
    prev: () => void;
    next: () => void;
    changePageSize: (size: number) => void;
    offset: import('solid-js').SourceAccessor<number>;
    rangeFor: import('solid-js').SourceAccessor<[number, number]>;
    slice: <T>(items: readonly T[]) => T[];
    itemRange: import('solid-js').SourceAccessor<[number, number]>;
    refs: PaginationIns;
};
export declare const paginationSplits: (keyof PaginationConfig)[];
