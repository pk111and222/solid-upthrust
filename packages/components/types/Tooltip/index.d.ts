import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { TooltipIns, TriggerPlacement, TriggerAction } from 'upthrust-competence';
export type TooltipPlacement = TriggerPlacement;
export type TooltipTrigger = TriggerAction;
export interface TooltipProps {
    /** Tooltip content. Empty title renders nothing (antd parity). */
    title?: JSX.Element;
    /** Default 'hover'. */
    trigger?: TooltipTrigger;
    /** Default 'top'. */
    placement?: TooltipPlacement;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    disabled?: boolean;
    /** Delay before opening on hover, ms. Default 100. */
    mouseEnterDelay?: number;
    /** Delay before closing on leave, ms. Default 100. */
    mouseLeaveDelay?: number;
    getContainer?: () => HTMLElement;
    overlayClass?: string;
    overlayStyle?: JSX.CSSProperties;
    children: JSX.Element;
    class?: string;
    style?: JSX.CSSProperties;
    ref?: (val: TooltipIns) => void;
}
declare const Tooltip: Component<TooltipProps>;
export default Tooltip;
