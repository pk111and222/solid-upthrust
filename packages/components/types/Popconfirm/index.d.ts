import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { PopconfirmIns, TriggerPlacement, TriggerAction } from 'upthrust-competence';
import { ButtonProps } from '../Button';
export type PopconfirmPlacement = TriggerPlacement;
export type PopconfirmTrigger = TriggerAction;
export interface PopconfirmProps {
    /** Confirmation question, e.g. "确定删除吗?" */
    title?: JSX.Element;
    /** Optional additional description shown under the title. */
    description?: JSX.Element;
    /** Default 'click'. */
    trigger?: PopconfirmTrigger;
    /** Default 'top'. */
    placement?: PopconfirmPlacement;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    disabled?: boolean;
    /** Text of the confirm button. Default '确定'. */
    okText?: JSX.Element;
    /** Text of the cancel button. Default '取消'. */
    cancelText?: JSX.Element;
    /** Props passed to the confirm Button. */
    okButtonProps?: Partial<ButtonProps>;
    /** Props passed to the cancel Button. */
    cancelButtonProps?: Partial<ButtonProps>;
    /** Custom icon; pass false to hide. Default help icon. */
    icon?: JSX.Element | false;
    onConfirm?: (e?: Event) => void | Promise<unknown>;
    onCancel?: (e?: Event) => void | Promise<unknown>;
    getContainer?: () => HTMLElement;
    overlayClass?: string;
    overlayStyle?: JSX.CSSProperties;
    children: JSX.Element;
    class?: string;
    style?: JSX.CSSProperties;
    ref?: (val: PopconfirmIns) => void;
}
declare const Popconfirm: Component<PopconfirmProps>;
export default Popconfirm;
