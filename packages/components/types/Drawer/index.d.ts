import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { DialogIns } from 'upthrust-competence';
import { SemanticInput } from '../../common/semantic';
import { DialogFocusable, DialogMaskConfig } from '../_dialogLayer';
export type { DialogMaskConfig as DrawerMaskConfig, DialogFocusable as DrawerFocusable } from '../_dialogLayer';
export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom';
export interface DrawerClosableConfig {
    closeIcon?: JSX.Element;
    disabled?: boolean;
    /** Close button position relative to the title. Default 'start'. */
    placement?: 'start' | 'end';
}
export interface DrawerResizableConfig {
    onResizeStart?: () => void;
    onResize?: (size: number) => void;
    onResizeEnd?: () => void;
}
export interface DrawerSemanticClassNames {
    root?: string;
    mask?: string;
    wrapper?: string;
    section?: string;
    header?: string;
    title?: string;
    extra?: string;
    body?: string;
    footer?: string;
    dragger?: string;
    close?: string;
}
export interface DrawerSemanticStyles {
    root?: JSX.CSSProperties;
    mask?: JSX.CSSProperties;
    wrapper?: JSX.CSSProperties;
    section?: JSX.CSSProperties;
    header?: JSX.CSSProperties;
    title?: JSX.CSSProperties;
    extra?: JSX.CSSProperties;
    body?: JSX.CSSProperties;
    footer?: JSX.CSSProperties;
    dragger?: JSX.CSSProperties;
    close?: JSX.CSSProperties;
}
export interface DrawerSemanticInfo {
    props: DrawerProps;
}
export interface DrawerProps {
    open?: boolean;
    defaultOpen?: boolean;
    /** Which screen edge the panel hugs. Default 'right'. */
    placement?: DrawerPlacement;
    title?: JSX.Element;
    /** Operations at the right of the header. */
    extra?: JSX.Element;
    children?: JSX.Element;
    /** Footer; nothing is rendered when omitted. */
    footer?: JSX.Element | null;
    /** Every close intent (mask / Escape / ×). A promise holds the drawer; false or a rejection keeps it open. */
    onClose?: (e: MouseEvent | KeyboardEvent) => void | boolean | Promise<unknown>;
    afterClose?: () => void;
    afterOpenChange?: (open: boolean) => void;
    /** Mask: boolean or { enabled, blur, closable }. Default true. */
    mask?: boolean | DialogMaskConfig;
    /** @deprecated Use mask.closable. Close on mask click. Default true. */
    maskClosable?: boolean;
    /** Close on Escape. Default true. */
    keyboard?: boolean;
    /** Show the × button; an object customises it. Default true. */
    closable?: boolean | DrawerClosableConfig;
    /** Custom × icon; null / false hides the button. */
    closeIcon?: JSX.Element | null | false;
    /** Preset ('default' 378 / 'large' 736), px or CSS length. Width for left/right, height for top/bottom. */
    size?: 'default' | 'large' | number | string;
    /** @deprecated Use size. */
    width?: number | string;
    /** @deprecated Use size. */
    height?: number | string;
    /** Upper bound of a resizable drawer, px. */
    maxSize?: number;
    /** Drag the inner edge to resize. */
    resizable?: boolean | DrawerResizableConfig;
    /** Nested-drawer push. Default { distance: 180 }; a number sets the distance. */
    push?: boolean | number | {
        distance?: number | string;
    };
    /** Show a skeleton instead of the body. */
    loading?: boolean;
    /** Unmount the DOM after close. Default false (kept alive, hidden). */
    destroyOnHidden?: boolean;
    /** Render the DOM before the first open. */
    forceRender?: boolean;
    /** Focus trap and restore. Default { trap: true, focusTriggerAfterClose: true }. */
    focusable?: DialogFocusable;
    /** Wrap the section node. */
    drawerRender?: (node: JSX.Element) => JSX.Element;
    zIndex?: number;
    /** Portal target; false renders in place (the parent must be positioned). */
    getContainer?: (() => HTMLElement) | false;
    /** Class on the section (antd className). */
    class?: string;
    /** Style on the section. */
    style?: JSX.CSSProperties;
    rootClass?: string;
    rootStyle?: JSX.CSSProperties;
    /** @deprecated Use class. */
    panelClass?: string;
    classNames?: SemanticInput<DrawerSemanticClassNames, DrawerSemanticInfo>;
    styles?: SemanticInput<DrawerSemanticStyles, DrawerSemanticInfo>;
    ref?: (val: DialogIns) => void;
}
declare const Drawer: Component<DrawerProps>;
export default Drawer;
