import { Component, JSX } from 'solid-js';

export interface SplitterPanelProps {
    defaultSize?: number;
    min?: number;
    max?: number;
    collapsible?: boolean;
    resizable?: boolean;
    class?: string;
    style?: JSX.CSSProperties;
    children?: JSX.Element;
}
export interface SplitterProps {
    layout?: 'horizontal' | 'vertical';
    onResize?: (sizes: number[]) => void;
    onResizeEnd?: (sizes: number[]) => void;
    class?: string;
    style?: JSX.CSSProperties;
    children?: JSX.Element;
}
export declare const Panel: Component<SplitterPanelProps>;
declare const _default: Component<SplitterProps> & {
    Panel: Component<SplitterPanelProps>;
};
export default _default;
