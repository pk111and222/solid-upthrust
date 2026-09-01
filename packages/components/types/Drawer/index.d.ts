import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { DialogIns } from 'upthrust-competence';
import { ButtonProps } from '../Button';
export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom';
export interface DrawerProps {
    open?: boolean;
    defaultOpen?: boolean;
    /** Which screen edge the panel hugs. Default 'right'. */
    placement?: DrawerPlacement;
    title?: JSX.Element;
    children?: JSX.Element;
    /** Custom footer; null hides it, undefined renders default ok/cancel row. */
    footer?: JSX.Element | null;
    okText?: JSX.Element;
    cancelText?: JSX.Element;
    okButtonProps?: Partial<ButtonProps>;
    cancelButtonProps?: Partial<ButtonProps>;
    onClose?: (e: MouseEvent | KeyboardEvent) => void | Promise<unknown>;
    afterClose?: () => void;
    afterOpenChange?: (open: boolean) => void;
    /** Close on mask click. Default true. */
    maskClosable?: boolean;
    /** Close on Escape. Default true. */
    keyboard?: boolean;
    /** Show the × button. Default true. */
    closable?: boolean;
    /** Render the mask scrim. Default true. */
    mask?: boolean;
    /** Panel size: named preset or explicit px. Horizontal = width, vertical = height. */
    size?: 'default' | 'large';
    width?: number | string;
    height?: number | string;
    /**
     * Push the drawer aside when a higher-layer drawer opens on top (antd
     * push). Default true; false disables the offset. A number sets the
     * distance in px (default 180).
     */
    push?: boolean | number;
    /** Unmount the panel after close. Default false. */
    destroyOnHidden?: boolean;
    zIndex?: number;
    getContainer?: () => HTMLElement;
    class?: string;
    /** Extra class on the panel element. */
    panelClass?: string;
    style?: JSX.CSSProperties;
    ref?: (val: DialogIns) => void;
}
declare const Drawer: Component<DrawerProps>;
export default Drawer;
