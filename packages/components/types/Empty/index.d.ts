import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
export declare const PRESENTED_IMAGE_DEFAULT: Component;
export declare const PRESENTED_IMAGE_SIMPLE: Component;
export interface EmptyProps {
    /** Custom image node; false disables the image entirely */
    image?: JSX.Element | false;
    /** Inline styles applied to the image wrapper */
    imageStyle?: JSX.CSSProperties;
    /** Description text; false hides it */
    description?: JSX.Element | false;
    /** Footer content (e.g. action buttons) */
    children?: JSX.Element;
    class?: string;
    style?: JSX.CSSProperties;
}
declare const Empty: Component<EmptyProps>;
export default Empty;
