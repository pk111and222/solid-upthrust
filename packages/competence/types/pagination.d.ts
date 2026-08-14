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
export declare const createPagination: (config: PaginationConfig) => {
    current: import('solid-js').Accessor<number>;
    pageSize: import('solid-js').Accessor<number>;
    totalPages: import('solid-js').Accessor<number>;
    pageRange: import('solid-js').Accessor<(number | "prev-ellipsis" | "next-ellipsis")[]>;
    hasPrev: import('solid-js').Accessor<boolean>;
    hasNext: import('solid-js').Accessor<boolean>;
    goTo: (page: number) => void;
    prev: () => void;
    next: () => void;
    changePageSize: (size: number) => void;
    refs: PaginationIns;
};
export declare const paginationSplits: (keyof PaginationConfig)[];
