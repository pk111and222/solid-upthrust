import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { ImageIns } from 'upthrust-competence';
export interface ImageProps {
    /** Image source URL. */
    src?: string;
    /** Replacement src when the primary one fails to load. */
    fallback?: string;
    /** Alt text. */
    alt?: string;
    /** Box width, px or CSS length. */
    width?: number | string;
    /** Box height, px or CSS length. */
    height?: number | string;
    /** Enable the click-to-preview fullscreen overlay. Default true. */
    preview?: boolean;
    /** Controlled preview open state. */
    previewVisible?: boolean;
    defaultPreviewVisible?: boolean;
    onPreviewVisibleChange?: (open: boolean) => void;
    /** Custom loading placeholder node; default renders a spinner. */
    placeholder?: JSX.Element;
    /** Custom error node; default renders a broken-image glyph. */
    errorRender?: JSX.Element;
    /** Zoom bounds / steps for the preview toolbar. */
    minScale?: number;
    maxScale?: number;
    scaleStep?: number;
    rotateStep?: number;
    class?: string;
    style?: JSX.CSSProperties;
    ref?: (val: ImageIns) => void;
}
declare const Image: Component<ImageProps>;
export default Image;
export type { ImagePreviewGroupProps } from './PreviewGroup';
