import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { SizeType } from '../../common/type';
type SpaceSize = SizeType | number;
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
export declare const Compact: Component<CompactProps>;
declare const Space: Component<SpaceProps> & {
    Compact: Component<CompactProps>;
};
export default Space;
