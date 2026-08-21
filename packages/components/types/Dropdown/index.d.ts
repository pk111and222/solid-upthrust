import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { TriggerPlacement } from 'upthrust-competence';
export interface DropdownMenuItem {
    key: string;
    label: string | JSX.Element;
    icon?: string;
    disabled?: boolean;
    danger?: boolean;
    type?: 'divider';
    onClick?: () => void;
}
export interface DropdownMenuProps {
    items: DropdownMenuItem[];
    onClick?: (key: string) => void;
}
export type DropdownTrigger = 'click' | 'hover' | 'contextMenu';
export type DropdownPlacement = TriggerPlacement;
export interface DropdownProps {
    menu: DropdownMenuProps;
    trigger?: DropdownTrigger;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    disabled?: boolean;
    placement?: DropdownPlacement;
    overlayClass?: string;
    overlayStyle?: JSX.CSSProperties;
    children: JSX.Element;
    class?: string;
    style?: JSX.CSSProperties;
}
declare const Dropdown: Component<DropdownProps>;
export default Dropdown;
