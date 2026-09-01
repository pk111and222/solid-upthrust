/**
 * Headless logic for Watermark — derives the tile options for the UI
 * layer: text layout (multi-line), font shorthand, and the repeating
 * background-image CSS value from an inline SVG data URI.
 *
 * The UI renders a full-size absolutely-positioned div whose background
 * repeats this tile; pointer events pass through by default.
 */
export type WatermarkConfig = {
    /** Watermark text; multi-line supported via array (antd: `content`). */
    content?: string | string[];
    /** Between 0 and 1, applied to the tile opacity. */
    opacity?: number;
    zIndex?: number;
    rotate?: number;
    width?: number;
    height?: number;
    /** Tile gap, px. antd: [gapX, gapY]; single number applies to both. */
    gap?: number | [number, number];
    offset?: [number, number];
    /** CSS font shorthand pieces. */
    fontColor?: string;
    fontSize?: number | string;
    fontWeight?: number | string;
    fontStyle?: string;
    fontFamily?: string;
};
export type WatermarkTile = {
    /** Full background-image value: url("data:image/svg+xml,...") */
    backgroundImage: string;
    backgroundSize: string;
    width: number;
    height: number;
    rotate: number;
    zIndex: number;
};
export declare const createWatermark: (config?: WatermarkConfig) => {
    lines: import('solid-js').SourceAccessor<string[]>;
    tile: import('solid-js').SourceAccessor<WatermarkTile>;
};
export declare const watermarkSplits: (keyof WatermarkConfig)[];
