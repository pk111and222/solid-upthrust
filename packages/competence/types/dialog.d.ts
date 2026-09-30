/**
 * Headless logic shared by Modal and Drawer — the rc-dialog / rc-drawer state
 * core. Both components are the SAME machine under the skin:
 *
 *  - controlled or uncontrolled `open`
 *  - `animatedOpen` lags `open` by one leave-animation: while a close plays,
 *    the panel must stay mounted and visible; it flips false only when the
 *    animation finishes
 *  - `mounted`: rc-dialog keep-alive — the DOM is created on the first open
 *    (or immediately with `forceRender`) and survives later closes (hidden),
 *    unless `destroyOnHidden` drops it after the leave animation
 *  - an async close GATE: a closing intent whose handler returns a promise
 *    keeps the dialog open (busy) until it settles; a rejection or `false`
 *    keeps it open (antd Modal.confirm: reject = stay for retry)
 *  - intent routing (mask click / Escape / close icon / ok / cancel) with a
 *    single `shouldClose` hook the consumer can veto or defer
 *
 * DOM side effects (stack, focus trap/restore, scroll lock, enter phase) live
 * in the UI package's shared `createDialogLayer` (components/lib/_dialogLayer),
 * which consumes this machine for both Modal and Drawer.
 */
export type DialogIntent = 'mask' | 'keyboard' | 'close' | 'ok' | 'cancel';
export type DialogConfig = {
    open?: boolean;
    defaultOpen?: boolean;
    /** veto/defer a close intent; return false (or a promise resolving false / rejecting) to stay open. */
    shouldClose?: (intent: DialogIntent) => boolean | Promise<boolean>;
    onClose?: (intent: DialogIntent) => void;
    afterClose?: () => void;
    afterOpenChange?: (open: boolean) => void;
    /** Unmount the panel DOM after the leave animation instead of keeping it alive. Default false. */
    destroyOnHidden?: boolean;
    /** Create the DOM before the first open. Default false. */
    forceRender?: boolean;
};
export type DialogIns = {
    /** Effective open (controlled value wins over the internal signal). */
    open: () => boolean;
    setOpen: (v: boolean) => void;
    /** True from open until the leave animation finishes. */
    animatedOpen: () => boolean;
    /** Whether the dialog DOM should exist (keep-alive / forceRender / destroyOnHidden). */
    mounted: () => boolean;
    /** True while an async shouldClose promise is pending. */
    busy: () => boolean;
    /** Route a closing intent through the gate (mask/Escape/×/ok/cancel). */
    requestClose: (intent: DialogIntent) => void;
    /** UI calls this when the leave animation has finished. */
    notifyLeaveDone: () => void;
    /** The last element focused outside the dialog — restore on close. */
    lastActiveElement: () => HTMLElement | undefined;
    setLastActiveElement: (el: HTMLElement | undefined) => void;
};
/** Leave-animation headroom before the machine forces the leave to finish, ms. */
export declare const DIALOG_LEAVE_MS = 300;
export declare const createDialog: (config?: DialogConfig) => DialogIns;
export declare const dialogSplits: (keyof DialogConfig)[];
