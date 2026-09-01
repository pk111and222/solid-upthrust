/**
 * Headless logic for Badge — the display state machine antd's Badge.js
 * derives inline: overflow formatting, zero suppression, status/color
 * priority over counts, dot gating, and the multi-character pill flag.
 * Pure derivation (the createDialog/createSkeleton family), so the UI layer
 * only decides how to render the returned fields.
 */
export type BadgeStatus = 'success' | 'processing' | 'default' | 'error' | 'warning';
export type BadgeConfig = {
    /** Count content: a number gets overflow formatting; JSX = custom badge node. */
    count?: number | string | {
        node?: unknown;
    };
    /** Cap for numeric counts; above shows `${overflowCount}+`. Default 99. */
    overflowCount?: number;
    /** Zero counts stay hidden unless true. */
    showZero?: boolean;
    /** Red dot mode — no number, and zero still hides. */
    dot?: boolean;
    status?: BadgeStatus;
    color?: string;
    /** Status text shown beside the dot (status mode). */
    text?: string | number;
};
export type BadgeDisplayState = {
    /** Formatted count: `${overflowCount}+` above the cap; '0' suppression is `hidden`'s job. */
    displayCount: number | string | undefined;
    /** True when count (or text) resolves to zero. */
    isZero: boolean;
    /** Count null or zero-suppressed. */
    ignoreCount: boolean;
    /** status/color present AND count is ignored — the status dot takes over. */
    hasStatus: boolean;
    /** dot mode with a non-zero payload. */
    showAsDot: boolean;
    /** Nothing to render at all. */
    hidden: boolean;
    /** Multi-character pill (adds horizontal padding). */
    multipleWords: boolean;
    /** Status text is renderable (antd: text===0 needs showZero, '' hides). */
    textVisible: boolean;
};
/**
 * Pure display derivation — exported for tests. Mirrors antd's
 * numberedDisplayCount/isZero/ignoreCount/hasStatus/showAsDot/isHidden
 * chain, minus the count-caching refs (those exist to freeze the number
 * during rc-motion's leave animation, which this library replaces with a
 * plain CSS transition on a persistent node).
 */
export declare const resolveBadgeDisplay: (config: BadgeConfig) => BadgeDisplayState;
/**
 * Pure offset style — antd parses the x entry with parseInt (so '10px'
 * works, and a negative x MOVES the badge further out: the style is
 * insetInlineEnd: -x) and passes y through as marginTop verbatim.
 * Returns undefined for a missing offset.
 */
export declare const badgeOffsetStyle: (offset?: [number | string, number | string]) => Record<string, string> | undefined;
export type BadgeIns = {
    display: () => BadgeDisplayState;
};
export declare const createBadge: (config?: BadgeConfig) => BadgeIns;
export declare const badgeSplits: (keyof BadgeConfig)[];
