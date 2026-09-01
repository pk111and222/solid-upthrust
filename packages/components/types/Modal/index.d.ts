import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { DialogIns } from 'upthrust-competence';
import { ButtonProps } from '../Button';
export interface ModalProps {
    open?: boolean;
    /** Uncontrolled initial open. */
    defaultOpen?: boolean;
    title?: JSX.Element;
    /** Body content. */
    children?: JSX.Element;
    /** Custom footer; null hides it, undefined renders default ok/cancel row. */
    footer?: JSX.Element | null;
    okText?: JSX.Element;
    cancelText?: JSX.Element;
    /** Button variant of the OK button. Default 'solid' (primary). */
    okVariant?: 'solid' | 'outlined' | 'text' | 'dashed' | 'link';
    okButtonProps?: Partial<ButtonProps>;
    cancelButtonProps?: Partial<ButtonProps>;
    /** Loading state of the OK button while an async onOk is pending. */
    confirmLoading?: boolean;
    /** Fires on every closing intent BEFORE the close (veto with false). */
    onOk?: (e: MouseEvent) => void | Promise<unknown>;
    onCancel?: (e: MouseEvent | KeyboardEvent) => void | Promise<unknown>;
    afterClose?: () => void;
    afterOpenChange?: (open: boolean) => void;
    /** Close on mask click. Default true. */
    maskClosable?: boolean;
    /** Close on Escape. Default true. */
    keyboard?: boolean;
    /** Show the × button. Default true. */
    closable?: boolean;
    /** Vertically center the panel. Default false (antd top-aligned 100px). */
    centered?: boolean;
    /** Panel width, px. Default 520 (antd). */
    width?: number | string;
    /** Render the mask scrim. Default true. */
    mask?: boolean;
    /** Unmount the panel after close. Default false. */
    destroyOnHidden?: boolean;
    zIndex?: number;
    getContainer?: () => HTMLElement;
    class?: string;
    /** Extra class on the panel element. */
    wrapClass?: string;
    style?: JSX.CSSProperties;
    ref?: (val: DialogIns) => void;
}
declare const Modal: Component<ModalProps>;
export default Modal;
