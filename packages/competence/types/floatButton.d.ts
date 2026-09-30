/**
 * Headless logic for FloatButton — the antd 6 FloatButton / BackTop / Group core.
 *
 *  - createFloatButton: BackTop SCROLL-VISIBILITY + scroll-to-top intent.
 *    antd semantics: visible once `scrollTop >= visibilityHeight` (default
 *    400 for BackTop; 0 means visible from the start); the scroll target is
 *    DI-able (window / Document / element); clicking animates the container
 *    back to 0 over `duration` ms with easeInOutCubic (antd `_util/scrollTo`).
 *    Without a threshold the button is always visible (plain FloatButton).
 *
 *  - createFloatButtonGroup: MENU-MODE open state. With `trigger` 'click' the
 *    trigger button toggles and an outside click closes; with 'hover' the
 *    group's mouseenter / mouseleave open / close. Without a trigger the group
 *    is a static stack (menuMode false, open ignored). Controlled `open` wins;
 *    `onOpenChange` reports every intended change (antd useControlledState).
 */
export type FloatButtonGroupPlacement = 'top' | 'left' | 'right' | 'bottom';
export type FloatButtonGroupTrigger = 'click' | 'hover';
/** @deprecated 0.x direction naming; use FloatButtonGroupPlacement. */
export type FloatButtonDirection = 'up' | 'down' | 'left' | 'right';
type ScrollTarget = HTMLElement | Window | Document;
export type FloatButtonConfig = {
    /** Controlled visibility (wins over scroll-spy when present). */
    visible?: boolean;
    /** Show once scrollTop >= this many px. undefined = always visible. */
    visibilityHeight?: number;
    /** BackTop mode: click scrolls the target to top. */
    backTop?: boolean;
    /** Scroll target (antd `target`). Default window. */
    getScrollContainer?: () => ScrollTarget | undefined | null;
    onVisibleChange?: (visible: boolean) => void;
    onClick?: (e?: Event) => void;
    /** Scroll-to-top animation duration in ms. Default 450. */
    duration?: number;
    /** Scroll action override for BackTop clicks (DI for tests). */
    scrollToTop?: (duration: number) => void;
    /** rAF / clock DI (tests drive frames synchronously). */
    requestAnimationFrame?: (cb: () => void) => number;
    cancelAnimationFrame?: (id: number) => void;
    now?: () => number;
};
export type FloatButtonIns = {
    /** Effective visibility (controlled wins; else scroll-spy). */
    visible: () => boolean;
    /** True when BackTop mode is on. */
    isBackTop: () => boolean;
    /** Click intent — BackTop scrolls to top, then reports onClick. */
    handleClick: (e?: Event) => void;
    /** Register an element scroll container (alternative to getScrollContainer). */
    containerRef: (el: HTMLElement) => void;
};
/** antd getScroll: window → pageYOffset, Document → documentElement.scrollTop, element → scrollTop. */
export declare const getFloatScrollTop: (target: ScrollTarget | {
    scrollY?: number;
    scrollTop?: number;
}) => number;
/** antd easeInOutCubic(t, b, c, d): from b to c over d. */
export declare const easeInOutCubic: (t: number, b: number, c: number, d: number) => number;
export declare const createFloatButton: (config?: FloatButtonConfig) => FloatButtonIns;
export type FloatButtonGroupConfig = {
    /** Menu-mode trigger. Without it the group is a static stack. */
    trigger?: FloatButtonGroupTrigger;
    /** Start expanded (uncontrolled). */
    defaultOpen?: boolean;
    /** Controlled expansion. */
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
};
export type FloatButtonGroupIns = {
    open: () => boolean;
    /** antd triggerOpen: writes the internal state and reports when it differs. */
    setOpen: (open: boolean) => void;
    toggle: () => void;
    /** trigger is 'click' or 'hover'. */
    menuMode: () => boolean;
    /** Trigger-button click (click mode toggles). */
    onTriggerClick: () => void;
    /** Group mouseenter / mouseleave (hover mode opens / closes). */
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    /** Document click outside the group (click mode closes). */
    onOutsideClick: () => void;
};
export declare const createFloatButtonGroup: (config?: FloatButtonGroupConfig) => FloatButtonGroupIns;
/** Legacy `direction` → antd 6 `placement` (up→top, down→bottom). */
export declare const floatButtonGroupPlacement: (placement?: string, direction?: FloatButtonDirection) => FloatButtonGroupPlacement;
export declare const floatButtonSplits: (keyof FloatButtonConfig)[];
export declare const floatButtonGroupSplits: (keyof FloatButtonGroupConfig)[];
export {};
