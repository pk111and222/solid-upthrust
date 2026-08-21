import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
export interface DividerProps {
    type?: 'horizontal' | 'vertical';
    dashed?: boolean;
    orientation?: 'left' | 'center' | 'right';
    orientationMargin?: string | number;
    plain?: boolean;
    class?: string;
    style?: JSX.CSSProperties;
    children?: JSX.Element;
}
declare const Divider: Component<DividerProps>;
export default Divider;
