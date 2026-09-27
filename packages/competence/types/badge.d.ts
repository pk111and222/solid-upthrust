import { PresetColor } from './presetColors';
/**
 * Headless logic for Badge — the display state machine antd's Badge.tsx
 * (6.6.5) derives inline: overflow formatting, zero suppression, status/color
 * priority over counts, dot gating, status-badge selection and the
 * multi-character pill flag. Pure derivation, so the UI layer only decides
 * how to render the returned fields.
 */
export type BadgeStatus = 'success' | 'processing' | 'default' | 'error' | 'warning';
export type BadgeConfig = {
    /** number/string get overflow formatting; any object (a DOM node) is a custom indicator. */
    count?: unknown;
    /** Cap for numeric counts; above shows `${overflowCount}+`. Default 99. */
    overflowCount?: number;
    /** Zero counts stay hidden unless true. */
    showZero?: boolean;
    /** Red dot mode — no number, and zero still hides. */
    dot?: boolean;
    status?: BadgeStatus | null;
    color?: string | null;
    /** Status text (resolved). Only truthiness and the 0 / '0' values matter here. */
    text?: unknown;
    /** Whether the badge wraps renderable children (antd `!children`). */
    hasChildren?: boolean;
};
export type BadgeDisplayState = {
    /** Formatted count: `${overflowCount}+` above the cap; undefined for dot/empty. */
    displayCount: unknown;
    /** True when the displayed count OR the text is zero (antd isZero). */
    isZero: boolean;
    /** Count null or zero-suppressed. */
    ignoreCount: boolean;
    /** status/color present AND count is ignored — the status dot takes over. */
    hasStatus: boolean;
    /** Renders as a standalone status badge (dot + text, no indicator motion). */
    isStatusBadge: boolean;
    /** dot mode with a non-zero payload. */
    showAsDot: boolean;
    /** Indicator is hidden (zoomed out). */
    hidden: boolean;
    /** Count is a custom node rendered without the pill. */
    isCustom: boolean;
    /** Multi-character pill (adds horizontal padding). */
    multipleWords: boolean;
    /** Status text is renderable (antd: text===0 needs showZero, booleans hide). */
    textVisible: boolean;
};
/**
 * Pure display derivation — mirrors antd's numberedDisplayCount / isZero /
 * ignoreCount / hasStatus / isStatusBadge / showAsDot / isHidden chain,
 * minus the count-caching refs (the UI caches the last visible content so
 * the leave animation doesn't change what is shown).
 */
export declare const resolveBadgeDisplay: (config: BadgeConfig) => BadgeDisplayState;
/** Indicator color key: a status, a preset palette, the library's 'gray', 'custom' or the default 'error'. */
export type BadgeColorKey = BadgeStatus | 'gray' | 'custom' | 'primary' | PresetColor;
/**
 * antd color precedence per indicator:
 * - count pill: status is ignored (its class only applies under a status root);
 *   custom color (inline) > preset palette > default red.
 * - dot / status dot: custom color (inline) > status > preset palette > default.
 */
export declare const resolveBadgeColorKey: (kind: "count" | "dot" | "status", status?: BadgeStatus | null, color?: string | null) => BadgeColorKey;
/**
 * Pure offset style — antd parses the x entry with parseFloat (so '10px'
 * works, and a positive x MOVES the badge further out: the style is
 * insetInlineEnd: -x) and passes y through as marginTop (numbers are px).
 * Returns undefined for a missing offset.
 */
export declare const badgeOffsetStyle: (offset?: [number | string, number | string]) => Record<string, string> | undefined;
export type BadgeIns = {
    display: () => BadgeDisplayState;
};
export declare const createBadge: (config?: BadgeConfig) => BadgeIns;
export declare const badgeSplits: (keyof BadgeConfig)[];
