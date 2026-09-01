/**
 * Headless logic for Image — the loading state machine plus the preview
 * state, mirroring rc-image's useStatus/useMergedState pair:
 *
 *  - LOAD status: 'loading' → 'normal' on the img's load event, or 'error'
 *    when the src fails (Image() probe AND the onerror path both land there).
 *    A src change resets to loading; switching back to a previously-failed
 *    src retries (status leaves 'error').
 *  - `fallback`: when set and the primary src errors, the RENDERER renders
 *    the fallback src instead (this layer only reports status; effectiveSrc
 *    picks the src to paint).
 *  - PREVIEW: controlled-or-uncontrolled open state with the standard
 *    value/onChange surface.
 *  - PREVIEW TRANSFORM: zoom (scale) + rotate counters with clamping —
 *    antd's operations bar (zoom in / zoom out / rotate left / right /
 *    reset). Pure arithmetic, no DOM.
 */
export type ImageStatus = 'loading' | 'normal' | 'error';
export type ImageConfig = {
    src?: string;
    /** Replacement src painted when the primary one errors. */
    fallback?: string;
    /**
     * @deprecated Unused by the state machine (initial status is always
     * 'loading'). Kept in the config surface for splitProps compatibility;
     * placeholder UI selection is a renderer concern.
     */
    hasPlaceholder?: boolean;
    /** Controlled preview open. */
    previewVisible?: boolean;
    defaultPreviewVisible?: boolean;
    onPreviewVisibleChange?: (open: boolean) => void;
    /** Zoom bounds for the preview transform. Defaults 1..32 (antd family). */
    minScale?: number;
    maxScale?: number;
    /** Scale increment per zoom step. Default 0.5 (antd). */
    scaleStep?: number;
    /** Rotation increment per click, degrees. Default 90 (antd). */
    rotateStep?: number;
};
export type ImagePreviewTransform = {
    scale: number;
    rotate: number;
};
export type ImageIns = {
    /** Load lifecycle: loading → normal | error. */
    status: () => ImageStatus;
    /** True while the src hasn't loaded (drives the placeholder). */
    isLoading: () => boolean;
    /** True after a load error (drives the error fallback UI). */
    isError: () => boolean;
    /** The src the renderer should paint (fallback on error). */
    effectiveSrc: () => string | undefined;
    /** Renderer calls this from the img's load event. */
    notifyLoaded: () => void;
    /** Renderer calls this from the img's error event. */
    notifyError: () => void;
    /** Preview open state (controlled value wins). */
    previewOpen: () => boolean;
    setPreviewOpen: (open: boolean) => void;
    togglePreview: () => void;
    /** Preview transform (zoom/rotate) + operations. */
    transform: () => ImagePreviewTransform;
    zoomIn: () => void;
    zoomOut: () => void;
    rotateLeft: () => void;
    rotateRight: () => void;
    resetTransform: () => void;
};
export declare const createImage: (config?: ImageConfig) => ImageIns;
export declare const imageSplits: (keyof ImageConfig)[];
