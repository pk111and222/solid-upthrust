import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
export interface CollapseItem {
    /** Unique key; auto-indexed when omitted. */
    key?: string | number;
    /** Header label. */
    label?: JSX.Element;
    /** Panel body. */
    children?: JSX.Element;
    /** Disable this panel's toggling. */
    disabled?: boolean;
    /** Force-hide the expand icon (antd showExpandIcon=false per item). */
    showExpandIcon?: boolean;
    /** Panel-level extra node rendered at the header's right (before the icon). */
    extra?: JSX.Element;
    /** Custom expand icon renderer; receives the open state. */
    expandIcon?: (props: {
        isActive: boolean;
    }) => JSX.Element;
    /** Custom header content renderer; receives the open state. */
    labelRender?: (props: {
        isActive: boolean;
    }) => JSX.Element;
    class?: string;
    style?: JSX.CSSProperties;
}
export interface CollapseProps {
    items: CollapseItem[];
    /** Currently open panel keys (controlled). */
    activeKey?: Array<string | number>;
    /** Initial open keys (uncontrolled). */
    defaultActiveKey?: Array<string | number>;
    /** Open callback (fires on every toggle). */
    onChange?: (activeKey: Array<string | number>) => void;
    /** Accordion mode: at most one panel open at a time. */
    accordion?: boolean;
    /** Borderless, transparent background mode. */
    ghost?: boolean;
    /** Allow panels to collapse (clicking an open header closes it). Default true. */
    collapsible?: boolean;
    /** Global custom expand icon renderer. */
    expandIcon?: (props: {
        isActive: boolean;
    }) => JSX.Element;
    /** Expand icon position: after the label (end, default) or before it (start). */
    expandIconPosition?: 'start' | 'end';
    class?: string;
    style?: JSX.CSSProperties;
}
declare const Collapse: Component<CollapseProps>;
export default Collapse;
