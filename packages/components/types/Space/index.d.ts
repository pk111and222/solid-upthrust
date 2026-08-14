import { Component, JSX } from 'solid-js';

type SpaceSize = 'small' | 'middle' | 'large' | number;
export interface SpaceProps {
    direction?: 'horizontal' | 'vertical';
    size?: SpaceSize | [SpaceSize, SpaceSize];
    align?: 'start' | 'center' | 'end' | 'baseline';
    wrap?: boolean;
    split?: JSX.Element;
    block?: boolean;
    class?: string;
    style?: JSX.CSSProperties;
    children?: JSX.Element;
}
export interface CompactProps {
    direction?: 'horizontal' | 'vertical';
    block?: boolean;
    class?: string;
    style?: JSX.CSSProperties;
    children?: JSX.Element;
}
declare const Space: Component<SpaceProps>;
export declare const Compact: Component<CompactProps>;
export default Space;
