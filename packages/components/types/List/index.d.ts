import { JSX } from '@solidjs/web';
import { ListGroupConfig, ListIns, ListScrollToConfig } from 'upthrust-competence';
export type { ListScrollToConfig, ListScrollAlign } from 'upthrust-competence';
export interface ListSemanticSlots {
    root?: string;
    item?: string;
    groupHeader?: string;
}
export interface ListSemanticStyles {
    root?: JSX.CSSProperties;
    item?: JSX.CSSProperties;
    groupHeader?: JSX.CSSProperties;
}
export interface ListRef<T = any, K = unknown> extends ListIns<T, K> {
    /** Scroll to a position, an item (rowKey), or a group header. */
    scrollTo: (config: ListScrollToConfig) => void;
}
export interface ListProps<T = any, K = unknown> {
    /** Data source. */
    items: T[];
    /** Render a single row. */
    itemRender: (item: T, index: number) => JSX.Element;
    /** Unique key per item: a field name or a getter. */
    rowKey?: ((item: T, index: number) => string | number) | keyof T;
    /** Scroll container height (px); content scrolls when it overflows. */
    height?: number;
    /** Virtual scrolling: render only rows in view (requires height). */
    virtual?: boolean;
    /** Grouping configuration. */
    group?: ListGroupConfig<T, K>;
    /** Whether group headers stick to the top while scrolling. */
    sticky?: boolean;
    /** Native scroll event handler (infinite loading etc.). */
    onScroll?: (e: Event & {
        currentTarget: HTMLDivElement;
        target: HTMLDivElement;
    }) => void;
    /** Loading indicator rendered after the last row (infinite loading). */
    loading?: boolean;
    /** Custom loading node; default is a centered spinner with "加载中…". */
    loadingRender?: JSX.Element;
    /** Fixed footer rendered after all rows (outside the scroll content flow end). */
    footer?: JSX.Element;
    /** Semantic class slots. */
    classNames?: ListSemanticSlots;
    /** Semantic inline styles. */
    styles?: ListSemanticStyles;
    /** Estimated row height (px) for virtual mode. Default 44. */
    estimateRowHeight?: number;
    /** Estimated group header height (px). Default 40. */
    estimateGroupHeaderHeight?: number;
    /** Extra rows rendered above/below the viewport in virtual mode. Default 5. */
    overscan?: number;
    class?: string;
    style?: JSX.CSSProperties;
    ref?: (val: ListRef<T, K>) => void;
}
declare const List: <T, K = unknown>(providedProps: ListProps<T, K>) => JSX.Element;
export default List;
