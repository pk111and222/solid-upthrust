import { DialogIns } from 'upthrust-competence';
/**
 * DOM side effects shared by Modal and Drawer (the headless `createDialog`
 * owns state; this owns the document). One implementation for both:
 *
 *  - enter phase: the tree mounts carrying its final classes, so `visible`
 *    stays false for one macrotask after every animatedOpen rising edge —
 *    the class flip then lands on a mounted element and the transition runs
 *  - stack membership while open (Escape routing + drawer push)
 *  - focus: save the outside element on open, move focus into the panel,
 *    trap Tab / stray focus while top-most, restore on close
 *    (`focusable.trap` / `focusable.focusTriggerAfterClose`)
 *  - scroll lock with a page-wide counter, scrollbar-width compensation and
 *    restoration of the body's previous inline styles
 */
export type DialogLayerConfig = {
    dialog: DialogIns;
    kind: 'modal' | 'drawer';
    zIndex: () => number;
    keyboard: () => boolean;
    onEscape: () => void;
    panel: () => HTMLElement | undefined;
    /** Trap focus inside the panel while top-most. Default true. */
    trap: () => boolean;
    /** Restore focus to the opener after close. Default true. */
    restoreFocus: () => boolean;
    /** Lock body scroll while shown. */
    lock: () => boolean;
};
/** antd mask: `boolean | { enabled, blur, closable }`; `maskClosable` is the deprecated fallback. */
export type DialogMaskConfig = {
    enabled?: boolean;
    blur?: boolean;
    closable?: boolean;
};
/** antd focusable. */
export type DialogFocusable = {
    trap?: boolean;
    focusTriggerAfterClose?: boolean;
};
export declare const resolveMask: (mask: boolean | DialogMaskConfig | undefined, maskClosable: boolean | undefined) => {
    enabled: boolean;
    blur: boolean;
    closable: boolean;
};
/**
 * antd useClosable: `closable` true/object shows the button; `closeIcon`
 * null/false hides it; an object may carry its own closeIcon / disabled.
 */
export declare const resolveClosable: <T extends {
    closeIcon?: unknown;
    disabled?: boolean;
}>(closable: boolean | T | undefined, closeIcon: unknown, fallback: boolean) => {
    show: boolean;
    icon: {} | null | undefined;
    disabled: boolean;
    config: T | undefined;
};
/** Number / numeric string → px; other strings pass through. */
export declare const cssSize: (value: number | string | undefined) => string | undefined;
/** Page-wide scroll lock shared with Tour (rc-tour Portal autoLock). Every lock must be paired with one unlock. */
export declare const lockBodyScroll: () => void;
export declare const unlockBodyScroll: () => void;
export declare const createDialogLayer: (config: DialogLayerConfig) => {
    stackId: symbol;
    visible: import('solid-js').SourceAccessor<boolean>;
    pushed: import('solid-js').SourceAccessor<boolean>;
};
