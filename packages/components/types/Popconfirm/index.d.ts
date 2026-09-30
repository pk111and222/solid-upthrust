import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { PopconfirmIns, TriggerPlacement, TriggerAction } from 'upthrust-competence';
import { ButtonProps, ButtonType } from '../Button';
import { SemanticInput } from '../../common/semantic';
export type { PopconfirmIns } from 'upthrust-competence';
export type PopconfirmPlacement = TriggerPlacement;
export type PopconfirmTrigger = TriggerAction;
/** antd LegacyButtonType: a Button type, or 'danger' (default-type danger button). */
export type PopconfirmOkType = ButtonType | 'danger';
export interface PopconfirmSemanticClassNames {
    root?: string;
    container?: string;
    arrow?: string;
    icon?: string;
    title?: string;
    /** The description block. */
    content?: string;
}
export interface PopconfirmSemanticStyles {
    root?: JSX.CSSProperties;
    container?: JSX.CSSProperties;
    arrow?: JSX.CSSProperties;
    icon?: JSX.CSSProperties;
    title?: JSX.CSSProperties;
    content?: JSX.CSSProperties;
}
export interface PopconfirmSemanticInfo {
    props: PopconfirmProps;
}
export interface PopconfirmProps {
    /** Confirmation question. A function is called at render time (antd RenderFunction). */
    title?: JSX.Element | (() => JSX.Element);
    /** Additional description under the title. */
    description?: JSX.Element | (() => JSX.Element);
    /** Default 'click'. */
    trigger?: PopconfirmTrigger;
    /** Default 'top'. */
    placement?: PopconfirmPlacement;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** Clicking the trigger does not open the popconfirm. */
    disabled?: boolean;
    /** Default '确定'. */
    okText?: JSX.Element;
    /** Default 'primary'. */
    okType?: PopconfirmOkType;
    /** Default '取消'. */
    cancelText?: JSX.Element;
    okButtonProps?: Partial<ButtonProps>;
    cancelButtonProps?: Partial<ButtonProps>;
    /** Show the cancel button. Default true. */
    showCancel?: boolean;
    /** Custom icon; null / false hides it. Default ExclamationCircleFilled (warning color). */
    icon?: JSX.Element | false;
    /** Sync: closes at once. Promise: loading OK button, closes on resolve, stays open on reject. */
    onConfirm?: (e?: Event) => void | Promise<unknown>;
    /** Closes the panel, then fires. */
    onCancel?: (e?: Event) => void;
    /** Click anywhere inside the popup content. */
    onPopupClick?: (e: MouseEvent) => void;
    /** Show the pointing arrow. Default true; the arrow always points at the trigger center. */
    arrow?: boolean | {
        pointAtCenter?: boolean;
    };
    /** Hover open delay (hover trigger), ms. Default 100. */
    mouseEnterDelay?: number;
    /** Hover close delay, ms. Default 100. */
    mouseLeaveDelay?: number;
    /** Default 1060 (antd zIndexPopupBase + 60). */
    zIndex?: number;
    getContainer?: () => HTMLElement;
    classNames?: SemanticInput<PopconfirmSemanticClassNames, PopconfirmSemanticInfo>;
    styles?: SemanticInput<PopconfirmSemanticStyles, PopconfirmSemanticInfo>;
    /** @deprecated Use classNames.root. */
    overlayClass?: string;
    /** @deprecated Use styles.root. */
    overlayStyle?: JSX.CSSProperties;
    children: JSX.Element;
    class?: string;
    style?: JSX.CSSProperties;
    ref?: (val: PopconfirmIns) => void;
}
declare const Popconfirm: Component<PopconfirmProps>;
export default Popconfirm;
