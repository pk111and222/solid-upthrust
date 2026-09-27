import { Accessor } from 'solid-js';
import { ResponsiveValue, ScreenMap } from './responsive';
/** Column count, fixed or per screen (`{ xs: 1, md: 2, xl: 4 }`, Grid screen semantics). */
export type MasonryColumns = number | ResponsiveValue<number>;
export type MasonryConfig = {
    /** Default 3. A responsive map falls back to `xs`, then 1, when no defined screen matches. */
    columns?: MasonryColumns;
    /**
     * Extension (not in antd): assign items to columns in reading order with
     * balanced counts (12 items / 5 columns → 3,3,2,2,2) instead of "shortest column first".
     */
    sequential?: boolean;
    /** Dependency injection for tests / non-browser environments. */
    matchMedia?: (query: string) => MediaQueryList;
};
export type MasonryIns<T = unknown> = {
    columnCount: Accessor<number>;
    /** Current screen map (shared breakpoint observer) — lets the UI resolve other responsive props such as gutter. */
    screens: Accessor<ScreenMap | null>;
    /** Split items into columns without measuring: round-robin, or balanced sequential when `sequential`. */
    distribute: (items: readonly T[]) => T[][];
};
export type MasonryPosition = {
    column: number;
    top: number;
};
export type MasonryLayout = {
    positions: MasonryPosition[];
    /** Container height: the tallest column, without the trailing vertical gutter. */
    height: number;
};
export declare const DEFAULT_MASONRY_COLUMNS = 3;
/**
 * Resolve the column count for the current screens: numbers pass through; a
 * map takes the widest matching screen that defines a value, else `xs`, else 1.
 */
export declare const resolveMasonryColumns: (columns: MasonryColumns | undefined, screens: ScreenMap | null) => number;
/** One gutter direction: px, a size name (small 8 / middle 16 / large 24), or a per-screen map of those. */
export type MasonryGutterValue = number | 'small' | 'middle' | 'large';
export type MasonryGutter = MasonryGutterValue | ResponsiveValue<MasonryGutterValue>;
/**
 * Resolve `[horizontal, vertical]` px gutters for the current screens (antd useGutter
 * semantics): a single value applies to both directions; an unresolved vertical
 * value falls back to the horizontal one; the default is 0.
 */
export declare const resolveMasonryGutter: (gutter: MasonryGutter | [MasonryGutter, MasonryGutter] | undefined, screens: ScreenMap | null) => [number, number];
/**
 * Place items top-down: each goes to the currently shortest column (the first
 * one on ties) unless `pins[i]` fixes its column (clamped into range). Stable
 * by order — a later item never moves an earlier one.
 */
export declare const computeMasonryLayout: (heights: readonly number[], columnCount: number, verticalGap: number, pins?: readonly (number | undefined)[]) => MasonryLayout;
/** Balanced sequential column per item: earlier columns take the remainder (12 / 5 → 3,3,2,2,2). */
export declare const sequentialColumns: (itemCount: number, columnCount: number) => number[];
export declare const createMasonry: <T = unknown>(config?: MasonryConfig) => MasonryIns<T>;
export declare const masonrySplits: (keyof MasonryConfig)[];
