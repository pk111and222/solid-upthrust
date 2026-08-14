import { Component, JSX } from 'solid-js';

export interface MasonryProps {
    columns?: number | Record<string, number>;
    gutter?: number | [number, number];
    sequential?: boolean;
    class?: string;
    style?: JSX.CSSProperties;
    children?: JSX.Element;
}
declare const Masonry: Component<MasonryProps>;
export default Masonry;
