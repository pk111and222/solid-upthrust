export interface VirtualListConfig<T> {
    items: readonly T[];
    height?: number;
    itemHeight?: number;
    overscan?: number;
    virtual?: boolean;
}
/** Fixed-height viewport math shared by selectors; never touches the DOM. */
export declare function createVirtualList<T>(config: VirtualListConfig<T>): {
    items: import('solid-js').SourceAccessor<T[]>;
    start: import('solid-js').SourceAccessor<number>;
    end: import('solid-js').SourceAccessor<number>;
    itemHeight: () => number;
    height: () => number;
    totalHeight: () => number;
    scrollTop: () => number;
    scrollToIndex: (index: number) => number;
    setScrollTop: (value: number) => number;
    offsetTop: () => number;
};
