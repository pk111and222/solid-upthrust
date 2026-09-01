import { TriggerAction, TriggerPlacement } from './trigger';
/**
 * Headless logic for Popconfirm — a click-to-confirm floating panel built on
 * the shared createTrigger mechanics.
 *
 * Popconfirm-specific behavior layered on top:
 *  - default trigger is `click`, placement `top` (antd parity)
 *  - confirm / cancel intents close the panel and fire the matching callback
 *    (with optional loading state on the OK button — `onConfirm` may return a
 *    promise; the panel stays open until it settles)
 *  - the raw trigger API (layerStyle, actualPlacement, …) passes through so
 *    the UI layer reuses the Dropdown rendering pipeline
 */
export type PopconfirmConfig = {
    open?: boolean;
    defaultOpen?: boolean;
    disabled?: boolean;
    /** How the popconfirm opens. Default 'click'. */
    trigger?: TriggerAction;
    /** Default 'top'. */
    placement?: TriggerPlacement;
    onOpenChange?: (open: boolean) => void;
    getContainer?: () => HTMLElement;
    onConfirm?: (e?: Event) => void | Promise<unknown>;
    onCancel?: (e?: Event) => void | Promise<unknown>;
};
export type PopconfirmIns = {
    open: () => boolean;
    setOpen: (v: boolean) => void;
    confirm: (e?: Event) => void;
    cancel: (e?: Event) => void;
    loading: () => boolean;
};
export declare const createPopconfirm: (config?: PopconfirmConfig) => {
    open: import('solid-js').SourceAccessor<boolean>;
    confirm: (e?: Event) => void;
    cancel: (e?: Event) => void;
    loading: import('solid-js').SourceAccessor<boolean>;
    refs: PopconfirmIns;
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
export declare const popconfirmSplits: (keyof PopconfirmConfig)[];
