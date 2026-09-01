/**
 * Shared OPEN-DIALOG STACK for Modal and Drawer (module-level singleton).
 *
 * Two jobs:
 *  1. ESC routing: exactly ONE document keydown listener exists; Escape
 *     closes only the TOP-MOST open dialog (highest zIndex, latest mount on
 *     ties) — antd semantics. Without this, every mounted dialog's own
 *     listener fires and one Escape closes all layers at once.
 *  2. Drawer push: `isPushed` tells a drawer whether some OTHER open dialog
 *     sits above its zIndex (the drawer slides aside 180px when covered).
 *
 * Entries carry the dialog's requestClose intent router; the stack itself
 * owns no state beyond membership.
 */
export type DialogStackEntry = {
    id: symbol;
    zIndex: number;
    /** Route an Escape intent through the dialog's close gate. */
    onEscape: () => void;
};
export declare const registerDialog: (entry: DialogStackEntry) => void;
export declare const unregisterDialog: (id: symbol) => void;
/** Snapshot in stack order (mount order); version-read makes it reactive. */
export declare const dialogStack: () => DialogStackEntry[];
/** True when another open dialog sits ABOVE this zIndex. */
export declare const isPushed: (id: symbol, zIndex: number) => boolean;
