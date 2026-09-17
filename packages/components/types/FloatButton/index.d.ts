import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { FloatButtonIns } from 'upthrust-competence';
import { default as BackTop } from './BackTop';
import { default as FloatButtonGroup } from './Group';
export interface FloatButtonProps {
    /** Icon node (antd `icon`). */
    icon?: JSX.Element;
    /** BackTop mode: up glyph + click scrolls to top. */
    backTop?: boolean;
    /** Controlled visibility. */
    visible?: boolean;
    /** Show after this many scrolled px (BackTop default 400). */
    visibilityHeight?: number;
    /** Scroll target when BackTop (defaults to window). */
    target?: () => HTMLElement | Window | undefined;
    /** Click handler. */
    onClick?: (e?: Event) => void;
    /** Tooltip on hover (antd renders a Tooltip around the button). */
    tooltip?: JSX.Element;
    shape?: 'circle' | 'square';
    size?: 'middle' | 'large';
    /** Corner anchor. Default 'rt'. */
    placement?: 'rt' | 'rb' | 'lt' | 'lb';
    disabled?: boolean;
    class?: string;
    style?: JSX.CSSProperties;
    ref?: (machine: FloatButtonIns) => void;
}
export { BackTop, FloatButtonGroup as Group };
export type { BackTopProps } from './BackTop';
export type { FloatButtonGroupProps } from './Group';
declare const FloatButtonCompound: Component<FloatButtonProps> & {
    BackTop: Component<import('./BackTop').BackTopProps>;
    Group: Component<import('./Group').FloatButtonGroupProps>;
};
export default FloatButtonCompound;
