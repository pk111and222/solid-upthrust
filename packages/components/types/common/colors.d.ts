/**
 * Semantic status colors that the MD3 palette does not provide (it has no
 * success/warning tokens — only error). These antd values are used by
 * Alert, Result, and Progress so the three stay in sync.
 *
 * TODO(theme): promote these to `upthrust-unocss-preset` tokens so theme
 * overrides apply. The MD3 source (solid-material-color) can't supply them;
 * they would need custom palette entries.
 */
export declare const STATUS_COLORS: {
    readonly success: "#52c41a";
    readonly successBg: "#f6ffed";
    readonly warning: "#faad14";
    readonly warningBg: "#fffbe6";
};
