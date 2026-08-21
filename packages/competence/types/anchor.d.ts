export type AnchorItem = {
    key: string;
    href: string;
    title: string;
    children?: AnchorItem[];
    target?: string;
};
export type AnchorConfig = {
    items: AnchorItem[];
    /** Extra distance (px) from viewport top when positioning the active section. */
    targetOffset?: number;
    onChange?: (activeKey: string) => void;
    /** Controlled override: when provided its return value wins over scroll-spy. */
    getCurrentAnchor?: () => string;
    /** px of slack used when deciding whether a section counts as "reached". */
    bounds?: number;
    /** Dependency injection for tests / non-browser environments. */
    getScrollContainer?: () => HTMLElement | Window | undefined;
    requestAnimationFrame?: (cb: () => void) => number;
    cancelAnimationFrame?: (id: number) => void;
};
export type AnchorIns = {
    activeKey: () => string;
    scrollTo: (key: string) => void;
};
/** Resolved scroll container: a Window or a scrollable element (fallback documentElement). */
export type AnchorScrollContainer = Window | HTMLElement;
/** Viewport-relative helpers that work for both window and inner-container scrolling. */
export declare const getScrollTop: (container: AnchorScrollContainer) => number;
export declare const getScrollContainerTop: (container: AnchorScrollContainer) => number;
export declare const createAnchor: (config: AnchorConfig) => {
    activeKey: import('solid-js').SourceAccessor<string>;
    scrollTo: (key: string) => void;
    containerRef: (el: HTMLElement) => void;
    refs: AnchorIns;
};
export declare const anchorSplits: (keyof AnchorConfig)[];
