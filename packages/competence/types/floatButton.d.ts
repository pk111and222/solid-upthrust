/**
 * Headless logic for FloatButton — the antd FloatButton / BackTop core.
 *
 * Two machines live here:
 *
 *  - createFloatButton: SCROLL-VISIBILITY. A float button in "BackTop mode"
 *    appears only once the page (or a target container) has scrolled past a
 *    visibility threshold (antd: 400px), hides again when scrolled back, and
 *    reports `isBackTop` so the UI renders the up-arrow glyph. Regular float
 *    buttons (no threshold configured) are always visible. The visibility
 *    gate is a thin, DI-able scroll listener — same shape as createAnchor's
 *    (getScrollContainer + rAF debounce) so the same test container works.
 *
 *  - createFloatButtonGroup: EXPAND/COLLAPSE. A group holds child float
 *    buttons collapsed behind a trigger; clicking the trigger fans them out
 *    toward the configured direction ('up' | 'down' | 'left' | 'right'),
 *    antd's FloatButtonGroup. Pure open-state bookkeeping — the fan-out
 *    geometry (row/column + gap) is a renderer concern.
 */
export type FloatButtonDirection = 'up' | 'down' | 'left' | 'right';
export type FloatButtonConfig = {
    /** Controlled visibility (wins over scroll-spy when present). */
    visible?: boolean;
    /** Show only after this many scrolled px. undefined = always visible. */
    visibilityHeight?: number;
    /** BackTop mode: renders the up glyph and scrolls to top on click. */
    backTop?: boolean;
    /** Listen for scrolling on this container instead of the window. */
    getScrollContainer?: () => HTMLElement | Window | undefined;
    onVisibleChange?: (visible: boolean) => void;
    /** BackTop click: scrolling to top is injected so tests can observe it. */
    onClick?: (e?: Event) => void;
    /** Scroll action for BackTop clicks (DI for tests). */
    scrollToTop?: (behavior?: ScrollBehavior) => void;
    /** rAF DI (tests run scroll checks synchronously). */
    requestAnimationFrame?: (cb: () => void) => number;
    cancelAnimationFrame?: (id: number) => void;
};
export type FloatButtonIns = {
    /** Effective visibility (controlled wins; else scroll-spy). */
    visible: () => boolean;
    /** True when BackTop mode is on (glyph + click-to-top). */
    isBackTop: () => boolean;
    /** The click intent — BackTop scrolls, plain buttons only report. */
    handleClick: (e?: Event) => void;
    /** Register the scroll container element (DI alt to getScrollContainer). */
    containerRef: (el: HTMLElement) => void;
};
export declare const createFloatButton: (config?: FloatButtonConfig) => FloatButtonIns;
export type FloatButtonGroupConfig = {
    /** Which way the fan opens from the trigger. Default 'up'. */
    direction?: FloatButtonDirection;
    /** Start expanded instead of collapsed. */
    defaultOpen?: boolean;
    /** Controlled expansion. */
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** BackTop mode on the trigger itself (antd group + BackTop combo). */
    backTop?: boolean;
};
export type FloatButtonGroupIns = {
    open: () => boolean;
    setOpen: (open: boolean) => void;
    toggle: () => void;
    direction: () => FloatButtonDirection;
    isBackTop: () => boolean;
};
export declare const createFloatButtonGroup: (config?: FloatButtonGroupConfig) => FloatButtonGroupIns;
export declare const floatButtonSplits: (keyof FloatButtonConfig)[];
export declare const floatButtonGroupSplits: (keyof FloatButtonGroupConfig)[];
