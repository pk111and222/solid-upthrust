/**
 * Responsive breakpoint constants (px), shared by Sider breakpoint collapsing
 * and Masonry responsive columns. Values follow the antd spec.
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
