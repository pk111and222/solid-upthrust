import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { SplitterSize } from 'upthrust-competence';
export interface SplitterPanelProps {
    defaultSize?: SplitterSize;
    min?: SplitterSize;
    max?: SplitterSize;
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
/**
 * Panels register their config into the splitter through this context (Solid
 * resolves children before the parent can inspect them, so props can only
 * travel up via registration). Each panel renders itself plus the bar that
 * follows it.
 */
export declare const Panel: Component<SplitterPanelProps>;
declare const Splitter: Component<SplitterProps> & {
    Panel: Component<SplitterPanelProps>;
};
export default Splitter;
