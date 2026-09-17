import { SelectionIns, SelectionOption } from './selection';
import { FormFieldRule } from './formField';
/**
 * Headless logic for Segmented — the rc-segmented state core.
 *
 * ARCHITECTURE: Segmented is a single-picker (radio semantics) wearing a
 * sliding-thumb skin. The VALUE layer is entirely delegated to the shared
 * createSelection store (maxSelect: 1, no deselect — the same machine
 * Radio.Group rides); what THIS file adds is the THUMB:
 *
 *  - item geometry registry: the UI layer reports each item's measured
 *    box (offsetLeft/offsetWidth) via setItemRect — measurement lives in
 *    the renderer (it owns the DOM), but the derived thumb transform
 *    lives here so tests can drive it without a browser
 *  - thumbRect: the selected item's box (or the focused item's during
 *    keyboard traversal — antd's thumb follows the hover/focus target,
 *    the value only commits on click/Enter)
 *  - focus tracking for arrow-key traversal: Home/End/←/→ move focus;
 *    Enter/Space commit
 *
 * Options model: antd allows `label` to be a node and `value` to be
 * absent (label used as the key). The headless layer keeps the strict
 * SelectionOption shape (string labels, string|number keys) — the UI
 * layer normalizes richer items into it (label fallback = String(value)).
 */
export type SegmentedOption = SelectionOption & {
    /** Icon node slot (UI concern; kept for parity with antd items). */
    icon?: unknown;
    /** Payload channel for arbitrary item data (antd `payload`). */
    payload?: unknown;
};
export type SegmentedRect = {
    /** Horizontal offset from the group's content origin, px. */
    left: number;
    /** Item width, px. */
    width: number;
};
export type SegmentedConfig = {
    /** Controlled selected value (single key); undefined = uncontrolled. */
    value?: string | number;
    defaultValue?: string | number;
    options?: SegmentedOption[];
    disabled?: boolean;
    /** Equal-width items filling the container (thumb still measures). */
    block?: boolean;
    onChange?: (value: string | number) => void;
    /** Form integration: rules for the enclosing Item. */
    rules?: FormFieldRule[];
};
export type SegmentedIns = {
    /** The selected key (undefined when nothing is picked). */
    value: () => string | number | undefined;
    options: () => SegmentedOption[];
    isSelected: (value: string | number) => boolean;
    isDisabled: (value: string | number) => boolean;
    /** Whether the whole group is disabled. */
    isDisabledAll: () => boolean;
    /** Pick a key (replaces; disabled keys ignored). */
    select: (value: string | number) => void;
    /** Which key currently owns the THUMB (selection or keyboard focus). */
    thumbValue: () => string | number | undefined;
    /** The thumb's measured box (undefined = nothing to render). */
    thumbRect: () => SegmentedRect | undefined;
    /** UI reports a measured item box; recomputes the thumb. */
    setItemRect: (value: string | number, rect: SegmentedRect) => void;
    /** Drop every registered box (re-measure sweep start). */
    clearItemRects: () => void;
    /** The keyboard-focused key (traversal highlight). */
    focusValue: () => string | number | undefined;
    setFocusValue: (value: string | number | undefined) => void;
    /** Move keyboard focus to the previous/next ENABLED item. */
    moveFocus: (delta: number) => void;
    /** Focus the first/last enabled item (Home/End). */
    focusEdge: (edge: 'first' | 'last') => void;
    /** The underlying shared store (Select-style composition). */
    store: () => SelectionIns;
};
export declare const createSegmented: (config?: SegmentedConfig) => SegmentedIns;
export declare const segmentedSplits: (keyof SegmentedConfig)[];
