import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { TriggerPlacement, TriggerAction } from 'upthrust-competence';
export type PopoverPlacement = TriggerPlacement;
export type PopoverTrigger = TriggerAction;
export interface PopoverProps {
    /** Card title. */
    title?: JSX.Element;
    /** Content of the card. */
    content?: JSX.Element;
    /** Default 'hover'. */
    trigger?: PopoverTrigger;
    /** Default 'top'. */
    placement?: PopoverPlacement;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    disabled?: boolean;
    getContainer?: () => HTMLElement;
    overlayClass?: string;
    overlayStyle?: JSX.CSSProperties;
    children: JSX.Element;
    class?: string;
    style?: JSX.CSSProperties;
}
declare const Popover: Component<PopoverProps>;
export default Popover;
