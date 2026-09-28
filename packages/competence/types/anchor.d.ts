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
    /**
     * Controlled override: receives the scroll-spy key and its return value wins
     * (antd getCurrentAnchor(activeLink)). Zero-arg functions stay compatible.
     */
    getCurrentAnchor?: (activeKey: string) => string;
    /** px of slack used when deciding whether a section counts as "reached". */
    bounds?: number;
    /** Dependency injection for tests / non-browser environments. */
    getScrollContainer?: () => HTMLElement | Window | undefined;
    requestAnimationFrame?: (cb: () => void) => number;
    cancelAnimationFrame?: (id: number) => void;
    /** Timer injection for the click-scroll settle window (tests). */
    setTimeout?: (cb: () => void, ms: number) => unknown;
    clearTimeout?: (id: unknown) => void;
};
/**
 * Quiet period (ms) after the last scroll event of a click-initiated smooth
 * scroll before scroll-spy resumes. Smooth scrolling emits an event per frame,
 * so a gap this long means the animation has settled.
 */
export declare const ANCHOR_SCROLL_SETTLE = 120;
/** Section id of an href: the part after the last `#` (antd `#([\S ]+)$`). */
export declare const anchorTargetId: (href: string) => string | undefined;
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
