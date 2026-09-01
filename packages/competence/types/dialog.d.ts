/**
 * Headless logic shared by Modal and Drawer — the rc-dialog / rc-drawer state
 * core. Both components are the SAME machine under the skin:
 *
 *  - controlled or uncontrolled `open`
 *  - `animatedOpen` lags `open` by one leave-animation: while a close plays,
 *    the panel must stay mounted and visible; the DOM is only allowed to
 *    disappear when the animation finishes
 *  - lazy mount + destroyOnHidden teardown sequencing (reopen cancels the
 *    pending destroy and reuses the live DOM)
 *  - an async close GATE: a closing intent whose handler returns a promise
 *    keeps the dialog open (busy) until it settles — antd's confirmLoading
 *    pattern generalized
 *  - intent routing (mask click / Escape / close icon / ok / cancel) with a
 *    single `shouldClose` hook the consumer can veto or defer
 *
 * The UI layer owns: portal, mask/panel DOM, the actual animation classes,
 * focus trapping internals and scroll-lock side effects (all driven by the
 * signals exposed here).
 */
export type DialogIntent = 'mask' | 'keyboard' | 'close' | 'ok' | 'cancel';
export type DialogConfig = {
    open?: boolean;
    defaultOpen?: boolean;
    /** veto/defer a close intent; return false (or a promise resolving false) to stay open. */
    shouldClose?: (intent: DialogIntent) => boolean | Promise<boolean>;
    onClose?: (intent: DialogIntent) => void;
    afterClose?: () => void;
    afterOpenChange?: (open: boolean) => void;
    /**
     * Unmount the panel DOM after the leave animation instead of keeping it
     * alive. Default false (rc-dialog keep-alive; antd destroyOnHidden).
     */
    destroyOnHidden?: boolean;
    /** Extra ms after the animation window before the destroy fires. Default 0. */
    destroyDelay?: number;
};
export type DialogIns = {
    /** Effective open (controlled value wins over the internal signal). */
    open: () => boolean;
    setOpen: (v: boolean) => void;
    /**
     * True from the first open until the leave animation finishes — the panel
     * DOM must exist and stay interactive-blocked while this is true. Flips
     * false only after the leave window, which is when destroyOnHidden may
     * unmount it.
     */
    animatedOpen: () => boolean;
    /** True while an async shouldClose/onClose promise is pending. */
    busy: () => boolean;
    /** Route a closing intent through the gate (mask/Escape/×/ok/cancel). */
    requestClose: (intent: DialogIntent) => void;
    /** UI calls this when the leave animation has finished. */
    notifyLeaveDone: () => void;
    /** The last element focused outside the dialog — restore on close. */
    lastActiveElement: () => HTMLElement | undefined;
    setLastActiveElement: (el: HTMLElement | undefined) => void;
};
export declare const createDialog: (config?: DialogConfig) => DialogIns;
export declare const dialogSplits: (keyof DialogConfig)[];
