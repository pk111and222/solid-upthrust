import { TriggerAction, TriggerPlacement } from './trigger';
/**
 * Headless logic for Tooltip — a thin createTrigger specialization.
 *
 * Tooltip semantics on top of the shared floating-layer mechanics:
 *  - default trigger is `hover` (antd parity), placement `top`
 *  - antd-style open/close delays: open waits `mouseEnterDelay` (default 0.1s),
 *    close waits `mouseLeaveDelay` (default 0.1s) — both mapped onto
 *    createTrigger's hoverOpenDelay / hoverDelay
 *  - exposes the full trigger API (layerStyle, actualPlacement, …) so the UI
 *    layer renders through the same Portal + measured-positioning pipeline
 *    as Dropdown
 */
export type TooltipConfig = {
    open?: boolean;
    defaultOpen?: boolean;
    disabled?: boolean;
    /** How the tooltip opens. Default 'hover'. */
    trigger?: TriggerAction;
    /** Default 'top'. */
    placement?: TriggerPlacement;
    /** Delay before opening on hover, ms. Default 100. */
    mouseEnterDelay?: number;
    /** Delay before closing on leave, ms. Default 100. */
    mouseLeaveDelay?: number;
    onOpenChange?: (open: boolean) => void;
    getContainer?: () => HTMLElement;
};
export type TooltipIns = {
    open: () => boolean;
    setOpen: (v: boolean) => void;
};
export declare const createTooltip: (config?: TooltipConfig) => {
    open: import('solid-js').SourceAccessor<boolean>;
    refs: TooltipIns;
    setOpen: (v: boolean) => void;
    toggle: () => void;
    triggerRef: (el: HTMLElement) => void;
    layerRef: (el: HTMLElement) => void;
    bindLayerHover: () => void;
    remeasure: () => void;
    layerStyle: import('solid-js').SourceAccessor<Record<string, string>>;
    actualPlacement: import('solid-js').SourceAccessor<"bottomLeft" | "bottomRight" | "topLeft" | "topRight" | "bottom" | "top" | "left" | "right" | "leftTop" | "leftBottom" | "rightTop" | "rightBottom">;
    mounted: import('solid-js').SourceAccessor<boolean>;
    arrow: import('solid-js').SourceAccessor<{
        x: number;
        y: number;
        side: "top" | "bottom" | "left" | "right";
    } | undefined>;
};
export declare const tooltipSplits: (keyof TooltipConfig)[];
