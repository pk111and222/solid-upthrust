/**
 * Responsive breakpoint constants (px), shared by Sider breakpoint collapsing
 * and Masonry responsive columns. Values follow standard breakpoint spec.
 */
export declare const BREAKPOINTS: {
    readonly xs: 480;
    readonly sm: 576;
    readonly md: 768;
    readonly lg: 992;
    readonly xl: 1200;
    readonly xxl: 1600;
};
export type Breakpoint = keyof typeof BREAKPOINTS;
export declare const BREAKPOINT_KEYS: Breakpoint[];
/**
 * Screen keys used by Grid (Row responsive props, Col xs..xxxl, useBreakpoint),
 * ordered narrow → wide. Unlike BREAKPOINTS (Sider/Masonry thresholds, where
 * xs=480 is a min-width), `xs` here is the "below sm" screen — matching the
 * standard grid semantics — and `xxxl` (≥1920) extends the scale.
 */
export declare const SCREEN_KEYS: readonly ["xs", "sm", "md", "lg", "xl", "xxl", "xxxl"];
export type Screen = (typeof SCREEN_KEYS)[number];
/** Min-width (px) of every screen above xs. */
export declare const SCREEN_MIN_WIDTHS: {
    readonly sm: 576;
    readonly md: 768;
    readonly lg: 992;
    readonly xl: 1200;
    readonly xxl: 1600;
    readonly xxxl: 1920;
};
/** Media query per screen; xs uses a fractional max-width so no width falls between xs and sm. */
export declare const SCREEN_QUERIES: Record<Screen, string>;
