/**
 * Headless logic for Progress — percent normalization, stroke-path
 * geometry for the circle variant, and step-index derivation. Pure math +
 * derived state; the UI layer renders from these.
 */
export type ProgressConfig = {
    /** 0–100; clamped. Values outside range are coerced. */
    percent?: number;
    /** Line success threshold — at/above shows success color. */
    success?: {
        percent?: number;
        strokeColor?: string;
    };
    status?: 'success' | 'exception' | 'normal' | 'active';
    /** Circle radius, px. Default 120 (antd's SVG viewport math). */
    size?: number | [number, number];
    /** Circle stroke width, px. Default 6. */
    strokeWidth?: number;
    steps?: number;
    /** Trail/stroke colors as raw CSS color strings. */
    strokeColor?: string | {
        from?: string;
        to?: string;
        direction?: string;
    };
    trailColor?: string;
};
export type ProgressIns = {
    percent: () => number;
    status: () => NonNullable<ProgressConfig['status']>;
    successPercent: () => number | undefined;
};
export declare const clampPercent: (v: number | undefined) => number;
export declare const createProgress: (config?: ProgressConfig) => {
    percent: import('solid-js').SourceAccessor<number>;
    status: import('solid-js').SourceAccessor<"active" | "success" | "exception" | "normal">;
    successPercent: import('solid-js').SourceAccessor<number | undefined>;
    circleGeometry: import('solid-js').SourceAccessor<{
        size: number;
        strokeWidth: number;
        radius: number;
        circumference: number;
        offset: number;
    }>;
    stepIndex: import('solid-js').SourceAccessor<number | undefined>;
    refs: ProgressIns;
};
/**
 * Circle arc path in the 100×100 viewBox space. Pure.
 * Full circle from 12 o'clock, clockwise, via two EXACT半圆 arcs (the
 * `cx - 0.01` hack renders as a degenerate arc in some engines and makes
 * the whole stroke vanish). Two half-circles join at 3 and 9 o'clock.
 */
export declare const circlePath: (radius: number) => string;
export declare const progressSplits: (keyof ProgressConfig)[];
