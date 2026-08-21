import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
export interface RowProps {
    gutter?: number | [number, number];
    justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';
    align?: 'top' | 'middle' | 'bottom' | 'stretch';
    wrap?: boolean;
    class?: string;
    style?: JSX.CSSProperties;
    children?: JSX.Element;
}
export interface ColProps {
    span?: number;
    offset?: number;
    push?: number;
    pull?: number;
    order?: number;
    flex?: string | number;
    class?: string;
    style?: JSX.CSSProperties;
    children?: JSX.Element;
}
export declare const Row: Component<RowProps>;
export declare const Col: Component<ColProps>;
declare const Grid: {
    Row: Component<RowProps>;
    Col: Component<ColProps>;
};
export default Grid;
