import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
type FlexGap = 'small' | 'middle' | 'large' | number | string;
export interface FlexProps {
    vertical?: boolean;
    wrap?: 'wrap' | 'nowrap' | 'wrap-reverse';
    justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly' | 'normal';
    align?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline' | 'normal';
    flex?: string | number;
    gap?: FlexGap;
    inline?: boolean;
    component?: string;
    class?: string;
    style?: JSX.CSSProperties;
    children?: JSX.Element;
}
declare const Flex: Component<FlexProps>;
export default Flex;
