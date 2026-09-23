/**
 * Shared floating-layer trigger mechanics — the subset of rc-trigger
 * this library needs. Owns: trigger-event sequencing (click / hover with
 * enter-leave debounce / contextMenu / focus), portal mounting, measured
 * positioning with viewport flip, and dismiss (outside click + Escape).
 *
 * UI components (Dropdown, Menu popup, future Popover/Popconfirm/Tooltip)
 * render whatever they like; this layer only decides WHEN the layer is open
 * and WHERE it sits.
 */
export type TriggerPlacement = 'bottomLeft' | 'bottomRight' | 'bottom' | 'topLeft' | 'topRight' | 'top' | 'leftTop' | 'leftBottom' | 'left' | 'rightTop' | 'rightBottom' | 'right';
export type TriggerAction = 'click' | 'hover' | 'contextMenu' | 'focus' | 'manual';
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
    /** Hover close debounce, ms. Default 100. */
    hoverDelay?: number;
    /** Hover open delay, ms. Default 0 (opens immediately). */
    hoverOpenDelay?: number;
    /**
     * Mount the layer DOM lazily: nothing is rendered until the first open,
     * and after close the DOM survives the leave animation plus `destroyDelay`
     * ms before being destroyed (reopening within that window cancels the
     * destroy and reuses the live DOM). Default true. Pass false to keep the
     * layer permanently mounted (legacy behavior).
     */
    lazyMount?: boolean;
    /** Grace period after the leave animation before a lazy layer is destroyed, ms. Default 1000. */
    destroyDelay?: number;
    /**
     * Reserve room for an arrow (the little pointing triangle) between the
     * layer and the trigger. Adds `arrowPadding` to the visual gap and reports
     * `arrow` position data for the UI layer to render the triangle. Default
     * false (no arrow).
     */
    arrow?: boolean;
    /** Gap the arrow occupies, px. Only used when `arrow` is true. Default 8. */
    arrowPadding?: number;
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
    /**
     * Arrow placement data (only when `arrow: true`): the arrow's center
     * position along the layer edge that faces the trigger, in LAYER-LOCAL
     * coordinates (x from the layer's left edge, y from its top edge). The UI
     * renders a triangle at this point, rotated per `side`. Clamped so the
     * arrow never spills off the layer's rounded corners.
     */
    arrow?: {
        x: number;
        y: number;
        side: 'top' | 'bottom' | 'left' | 'right';
    };
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
/**
 * Arrow (the little pointing triangle) placement: where the arrow's CENTER
 * sits on the layer edge facing the trigger, in layer-local coordinates, and
 * which way it points. The arrow tracks the trigger's center along the cross
 * axis so a shifted/clamped layer still points at the right spot, clamped to
 * keep the triangle clear of the layer's rounded corners. Pure — testable
 * directly.
 */
export declare const computeArrow: (triggerEl: {
    getBoundingClientRect(): {
        left: number;
        right: number;
        top: number;
        bottom: number;
        width: number;
        height: number;
    };
}, layerEl: {
    getBoundingClientRect(): {
        left: number;
        right: number;
        top: number;
        bottom: number;
        width: number;
        height: number;
    };
}, pos: {
    top: number;
    left: number;
    placement: TriggerPlacement;
}) => {
    x: number;
    y: number;
    side: "top" | "bottom" | "left" | "right";
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
    actualPlacement: import('solid-js').SourceAccessor<"bottomLeft" | "bottomRight" | "topLeft" | "topRight" | "bottom" | "top" | "left" | "right" | "leftTop" | "leftBottom" | "rightTop" | "rightBottom">;
    /** True while the lazy layer's DOM should exist (see lazyMount). */
    mounted: import('solid-js').SourceAccessor<boolean>;
    /** Arrow position data when `arrow: true`, else undefined. */
    arrow: import('solid-js').SourceAccessor<{
        x: number;
        y: number;
        side: "top" | "bottom" | "left" | "right";
    } | undefined>;
    refs: {
        open: import('solid-js').SourceAccessor<boolean>;
        setOpen: (v: boolean) => void;
        toggle: () => void;
    };
};
export declare const triggerSplits: (keyof TriggerConfig)[];
