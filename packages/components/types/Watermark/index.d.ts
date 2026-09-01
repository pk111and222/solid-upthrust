import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
export interface WatermarkProps {
    /** Watermark text; array renders multi-line. */
    content?: string | string[];
    /** Tile opacity 0–1. */
    opacity?: number;
    zIndex?: number;
    /** Rotation degrees; default -22 (antd parity). */
    rotate?: number;
    /** Tile width/height px. */
    width?: number;
    height?: number;
    /** Tile gap; [x, y] or single number. */
    gap?: number | [number, number];
    offset?: [number, number];
    fontColor?: string;
    fontSize?: number | string;
    fontWeight?: number | string;
    fontStyle?: string;
    fontFamily?: string;
    /**
     * Content covered by the watermark (the layer sits on top; pointer events
     * pass through). Not a custom tile — custom text goes through `content`.
     */
    children?: JSX.Element;
    class?: string;
    style?: JSX.CSSProperties;
}
declare const Watermark: Component<WatermarkProps>;
export default Watermark;
