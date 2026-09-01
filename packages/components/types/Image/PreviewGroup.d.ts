import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { ImageGroupIns } from 'upthrust-competence';
export interface ImagePreviewGroupProps {
    /** Controlled group preview open state. */
    previewVisible?: boolean;
    defaultPreviewVisible?: boolean;
    onPreviewVisibleChange?: (open: boolean) => void;
    /** Controlled current image index. */
    current?: number;
    defaultCurrent?: number;
    /** Switch callback (current, prev) — antd preview.onChange signature. */
    onChange?: (current: number, prev: number) => void;
    /** Wrap around at the ends. Default true. */
    infinite?: boolean;
    /** Custom count badge renderer; default shows `${current} / ${total}`. */
    countRender?: (current: number, total: number) => JSX.Element;
    class?: string;
    children?: JSX.Element;
    ref?: (val: ImageGroupIns) => void;
}
/**
 * Group preview context: member Images render their own thumbnail + hover
 * mask but hand the OPEN gesture to the group (openAt) and skip their own
 * fullscreen overlay — the group renders ONE shared overlay.
 */
export type ImageGroupContextValue = {
    group: ImageGroupIns;
};
export declare const ImageGroupContext: import('solid-js').Context<ImageGroupContextValue | null>;
declare const ImagePreviewGroup: Component<ImagePreviewGroupProps>;
export default ImagePreviewGroup;
