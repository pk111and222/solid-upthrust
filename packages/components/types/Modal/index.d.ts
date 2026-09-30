import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { DialogIns, ResponsiveValue } from 'upthrust-competence';
import { ButtonProps, ButtonType } from '../Button';
import { SemanticInput } from '../../common/semantic';
import { DialogFocusable, DialogMaskConfig } from '../_dialogLayer';
export type { ModalStaticConfig, ModalStaticResult } from './static';
export type { DialogMaskConfig as ModalMaskConfig, DialogFocusable as ModalFocusable } from '../_dialogLayer';
export interface ModalClosableConfig {
    closeIcon?: JSX.Element;
    disabled?: boolean;
    /** Fires after the close animation (in addition to afterClose). */
    afterClose?: () => void;
    /** Fires when the × button is clicked, before onCancel. */
    onClose?: () => void;
}
export interface ModalSemanticClassNames {
    root?: string;
    mask?: string;
    wrapper?: string;
    container?: string;
    header?: string;
    title?: string;
    body?: string;
    footer?: string;
    close?: string;
}
export interface ModalSemanticStyles {
    root?: JSX.CSSProperties;
    mask?: JSX.CSSProperties;
    wrapper?: JSX.CSSProperties;
    container?: JSX.CSSProperties;
    header?: JSX.CSSProperties;
    title?: JSX.CSSProperties;
    body?: JSX.CSSProperties;
    footer?: JSX.CSSProperties;
    close?: JSX.CSSProperties;
}
export interface ModalSemanticInfo {
    props: ModalProps;
}
export interface ModalFooterExtra {
    OkBtn: Component;
    CancelBtn: Component;
}
export interface ModalProps {
    open?: boolean;
    /** Uncontrolled initial open. */
    defaultOpen?: boolean;
    title?: JSX.Element;
    /** Body content. */
    children?: JSX.Element;
    /**
     * Footer. undefined renders the default Cancel / OK row; null / false hides
     * it; a function receives the default row and the two buttons.
     */
    footer?: JSX.Element | null | false | ((originNode: JSX.Element, extra: ModalFooterExtra) => JSX.Element);
    okText?: JSX.Element;
    cancelText?: JSX.Element;
    /** OK button type. Default 'primary'. */
    okType?: ButtonType;
    /** @deprecated Use okType / okButtonProps. */
    okVariant?: 'solid' | 'outlined' | 'text' | 'dashed' | 'link';
    okButtonProps?: Partial<ButtonProps>;
    cancelButtonProps?: Partial<ButtonProps>;
    /** Loading state of the OK button. */
    confirmLoading?: boolean;
    /** OK intent. Return false / a rejecting promise to stay open; a promise holds the OK loading. */
    onOk?: (e: MouseEvent) => void | boolean | Promise<unknown>;
    /** Cancel intent (mask / Escape / × / Cancel). Same veto rules as onOk. */
    onCancel?: (e: MouseEvent | KeyboardEvent) => void | boolean | Promise<unknown>;
    afterClose?: () => void;
    afterOpenChange?: (open: boolean) => void;
    /** Mask: boolean or { enabled, blur, closable }. Default true. */
    mask?: boolean | DialogMaskConfig;
    /** @deprecated Use mask.closable. Close on mask click. Default true. */
    maskClosable?: boolean;
    /** Close on Escape. Default true. */
    keyboard?: boolean;
    /** Show the × button; an object customises it. Default true. */
    closable?: boolean | ModalClosableConfig;
    /** Custom × icon; null / false hides the button. */
    closeIcon?: JSX.Element | null | false;
    /** Vertically center the panel. Default false (100px from the top). */
    centered?: boolean;
    /** Panel width: px, CSS length or a breakpoint map. Default 520. */
    width?: number | string | ResponsiveValue<number | string>;
    /** Show a skeleton instead of the body and hide the footer. */
    loading?: boolean;
    /** Unmount the DOM after close. Default false (kept alive, hidden). */
    destroyOnHidden?: boolean;
    /** Render the DOM before the first open. */
    forceRender?: boolean;
    /** Focus trap and restore. Default { trap: true, focusTriggerAfterClose: true }. */
    focusable?: DialogFocusable;
    /** Wrap the container node (e.g. to make it draggable). */
    modalRender?: (node: JSX.Element) => JSX.Element;
    /** Lock body scroll while open. Default true. */
    scrollLock?: boolean;
    zIndex?: number;
    /** Portal target; false renders in place. */
    getContainer?: (() => HTMLElement) | false;
    /** Class on the panel (antd className). */
    class?: string;
    /** Style on the panel. */
    style?: JSX.CSSProperties;
    /** Class on the root layer. */
    rootClass?: string;
    rootStyle?: JSX.CSSProperties;
    /** Class on the scroll wrapper (antd wrapClassName). */
    wrapClass?: string;
    classNames?: SemanticInput<ModalSemanticClassNames, ModalSemanticInfo>;
    styles?: SemanticInput<ModalSemanticStyles, ModalSemanticInfo>;
    ref?: (val: DialogIns) => void;
}
declare const Modal: Component<ModalProps> & {
    confirm: (config: import('./static').ModalStaticConfig) => import('./static').ModalStaticResult;
    info: (config: import('./static').ModalStaticConfig) => import('./static').ModalStaticResult;
    success: (config: import('./static').ModalStaticConfig) => import('./static').ModalStaticResult;
    warning: (config: import('./static').ModalStaticConfig) => import('./static').ModalStaticResult;
    error: (config: import('./static').ModalStaticConfig) => import('./static').ModalStaticResult;
    destroyAll: () => void;
};
export default Modal;
