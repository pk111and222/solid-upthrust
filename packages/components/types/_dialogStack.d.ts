/**
 * Shared OPEN-DIALOG STACK for Modal, Drawer and Tour (module-level singleton).
 *
 * Two jobs:
 *  1. ESC routing: exactly ONE document keydown listener exists; Escape
 *     closes only the TOP-MOST open dialog (highest zIndex, latest mount on
 *     ties) — antd semantics. Without this, every mounted dialog's own
 *     listener fires and one Escape closes all layers at once.
 *  2. Drawer push: `isPushed` tells a drawer whether another open DRAWER sits
 *     above it (antd nested drawers — a Modal on top does not push).
 *
 * Entries carry the dialog's requestClose intent router; the stack itself
 * owns no state beyond membership.
 */
export type DialogStackEntry = {
    id: symbol;
    zIndex: number;
    /** 'drawer' entries push the drawers below them. */
    kind?: 'modal' | 'drawer' | 'tour';
    /** Route an Escape intent through the dialog's close gate. */
    onEscape: () => void;
};
export declare const registerDialog: (entry: DialogStackEntry) => void;
export declare const unregisterDialog: (id: symbol) => void;
/** Snapshot in stack order (mount order); version-read makes it reactive. */
export declare const dialogStack: () => DialogStackEntry[];
/** Whether `id` is the top-most open dialog (reactive). */
export declare const isTopDialog: (id: symbol) => boolean;
/** True when another open drawer sits ABOVE this one (higher zIndex, or same zIndex mounted later). */
export declare const isPushed: (id: symbol, zIndex: number) => boolean;
