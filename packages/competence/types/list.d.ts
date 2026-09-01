/**
 * List virtualization headless — the antd6 Listy core.
 *
 * The machine is measurement-driven and DOM-free: the renderer reports
 * viewport size / scroll position / measured row heights through setters
 * (the createSplitter `setContainerSize` injection pattern), and this layer
 * owns everything worth unit-testing:
 *
 *   1. Row tree — items expanded into a flat row sequence (item rows +
 *      group-header rows), so grouping and virtualization share ONE prefix
 *      -sum axis and group headers occupy real scroll height.
 *   2. Height cache + prefix sums — estimated heights corrected by measured
 *      ones, lazily re-summed (dirty flag) so a burst of ResizeObserver
 *      reports rebuilds the offsets once, on next read.
 *   3. Visible window — binary search over the (monotonic) offsets with an
 *      overscan buffer on both ends.
 *   4. scrollTo math — pixel / row-key / group-key targets × top/bottom/auto
 *      alignment resolved to a target scrollTop. The headless layer never
 *      touches the DOM; it RETURNS the number and the renderer scrolls.
 *
 * Variable row heights are first-class (Listy: "rows do not need the same
 * height") — estimates are corrected as rows render and measure.
 */
/** One expanded row: an item row or a group-header row. */
export type ListRow<T = unknown, K = unknown> = {
    kind: 'item' | 'groupHeader';
    /** Index into the expanded row sequence (what the height cache is keyed on). */
    row: number;
    /** Source-array index for item rows (-1 for group headers). */
    index: number;
    item?: T;
    groupKey?: K;
    /** Items belonging to the group (group headers only). */
    groupItems?: T[];
};
export type ListGroupConfig<T, K> = {
    /** Group key extractor; items with the same key are grouped adjacently. */
    key: (item: T) => K;
    /** Render the group header (renderer concern — kept here so the row tree is self-describing). */
    title?: (groupKey: K, items: T[]) => unknown;
};
export type ListScrollAlign = 'top' | 'bottom' | 'auto';
/** ref.scrollTo() configuration — Listy's ListyScrollToConfig shapes. */
export type ListScrollToConfig = number | {
    top?: number;
    left?: number;
} | {
    key: string | number;
    align?: ListScrollAlign;
    offset?: number;
} | {
    groupKey: string | number;
    align?: ListScrollAlign;
    offset?: number;
};
export type ListConfig<T = unknown, K = unknown> = {
    items: () => T[];
    /** Unique key per item: a field name or a getter. */
    rowKey?: (item: T, index: number) => string | number;
    /** Initial per-row height estimate (px). Default 44. */
    estimateRowHeight?: number;
    /** Group-header height estimate (px). Default 40. */
    estimateGroupHeaderHeight?: number;
    /** Rows rendered above/below the viewport. Default 5. */
    overscan?: number;
    group?: () => ListGroupConfig<T, K> | undefined;
};
export type ListIns<T = unknown, K = unknown> = {
    /** Expanded row tree (item rows + group headers), reactive to items/group. */
    rows: () => ListRow<T, K>[];
    /** Total scroll height (px) — the last prefix sum. */
    totalHeight: () => number;
    /** [start, end) inclusive-exclusive visible row window including overscan. */
    visibleRange: () => [number, number];
    /** Top offset of a row (px) — the prefix sum before it. */
    rowTop: (row: number) => number;
    /** Height of a row (px): measured if known, else the estimate. */
    rowHeight: (row: number) => number;
    /** Rendered spacer paddings: [top, bottom] px around the visible slice. */
    spacerPadding: () => [number, number];
    /** Viewport size reported by the renderer (px). */
    viewport: () => number;
    /** Current scroll offset (px). */
    scrollTop: () => number;
    setViewport: (px: number) => void;
    setScrollTop: (px: number) => void;
    /** Report a measured row height (ResizeObserver). Returns true when the cache changed. */
    setRowHeight: (row: number, px: number) => boolean;
    /**
     * Anchor drift after a measurement pass: how much the first visible row's
     * top has moved relative to the current scrollTop (px). The renderer adds
     * this to container.scrollTop to keep the visible content pinned while
     * rows above get their real heights. Zero when nothing drifted.
     */
    anchorDelta: () => number;
    /** Resolve any scrollTo config to a target scrollTop (NaN = nothing to do). */
    resolveScrollTo: (config: ListScrollToConfig) => number;
    /** Row index whose rowKey matches (-1 when absent). */
    rowIndexOfKey: (key: string | number) => number;
    /** Row index of a group's header (-1 when absent). */
    rowIndexOfGroupKey: (groupKey: string | number) => number;
};
export declare const listSplits: (keyof ListConfig)[];
export declare const createList: <T = unknown, K = unknown>(config: ListConfig<T, K>) => ListIns<T, K>;
