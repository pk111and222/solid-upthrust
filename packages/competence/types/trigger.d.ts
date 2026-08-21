/**
 * Shared floating-layer trigger mechanics — the subset of antd's rc-trigger
 * this library needs. Owns: trigger-event sequencing (click / hover with
 * enter-leave debounce / contextMenu / focus), portal mounting, measured
 * positioning with viewport flip, and dismiss (outside click + Escape).
 *
 * UI components (Dropdown, Menu popup, future Popover/Popconfirm/Tooltip)
 * render whatever they like; this layer only decides WHEN the layer is open
 * and WHERE it sits.
 */
export type TriggerPlacement = 'bottomLeft' | 'bottomRight' | 'bottom' | 'topLeft' | 'topRight' | 'top';
export type TriggerAction = 'click' | 'hover' | 'contextMenu' | 'focus';
export type TriggerConfig = {
    open?: boolean;
    defaultOpen?: boolean;
    disabled?: boolean;
    action?: TriggerAction;
    placement?: TriggerPlacement;
    /** Gap between trigger and layer, px. Default 4. */
    offset?: number;
    onOpenChange?: (open: boolean) => void;
    /** Where the layer portals to. Defaults to document.body. */
    getContainer?: () => HTMLElement;
    /** Hover close debounce, ms. Default 100 (antd behavior). */
    hoverDelay?: number;
    /** Dependency injection for tests / non-browser environments. */
    measure?: (triggerEl: HTMLElement, layerEl: HTMLElement, viewport: {
        w: number;
        h: number;
    }) => TriggerPosition;
};
export type TriggerPosition = {
    /**
     * Layer anchor in container coordinates. For bottom placements this is the
     * layer's top edge (triggerBottom + offset). For top placements this is the
     * line the layer's BOTTOM edge hangs from (triggerTop - offset) — the layer
     * applies translateY(-100%) so its box grows upward. Centered placements
     * (bottom/top) additionally use translateX(-50%).
     */
    top: number;
    left: number;
    /** Actual placement after collision adjustment — reported back for animation origin. */
    placement: TriggerPlacement;
};
/**
 * Measure the layer anchor for a placement, using viewport coordinates.
 * Pure — safe to call directly in tests.
 */
export declare const measurePlacement: (triggerRect: {
    left: number;
    top: number;
    right: number;
    bottom: number;
}, placement: TriggerPlacement, offset: number, viewport: {
    w: number;
    h: number;
}) => {
    top: number;
    left: number;
    placement: TriggerPlacement;
};
export declare const createTrigger: (config?: TriggerConfig) => {
    open: import('solid-js').SourceAccessor<boolean>;
    setOpen: (v: boolean) => void;
    toggle: () => void;
    triggerRef: (el: HTMLElement) => void;
    layerRef: (el: HTMLElement) => void;
    bindLayerHover: () => void;
    remeasure: () => void;
    layerStyle: import('solid-js').SourceAccessor<Record<string, string>>;
    actualPlacement: import('solid-js').SourceAccessor<"bottomLeft" | "bottomRight" | "topLeft" | "topRight" | "bottom" | "top">;
    refs: TriggerIns;
};
export declare const triggerSplits: (keyof TriggerConfig)[];
