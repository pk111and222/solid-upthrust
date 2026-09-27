import { Accessor } from 'solid-js';
/**
 * Panel size: px as a number (`240`) or a numeric string (`'240'`), or a
 * percentage of the container (`'30%'`).
 */
export type SplitterSize = number | `${number}%` | `${number}`;
export type SplitterOrientation = 'horizontal' | 'vertical';
/** Collapse-button visibility: `true` always, `false` never, `'auto'` on hover / focus. */
export type SplitterCollapsibleIconMode = boolean | 'auto';
export type SplitterPanelCollapsible = boolean | {
    start?: boolean;
    end?: boolean;
    showCollapsibleIcon?: SplitterCollapsibleIconMode;
};
export type SplitterPanelConfig = {
    /** Controlled size. When ANY panel has `size`, every panel is controlled (unset ones share the rest). */
    size?: SplitterSize;
    defaultSize?: SplitterSize;
    min?: SplitterSize;
    max?: SplitterSize;
    resizable?: boolean;
    collapsible?: SplitterPanelCollapsible;
};
export type SplitterPanelHandle = {
    /** Reactive index inside the current panel registry (-1 once disposed). */
    index: () => number;
    dispose: () => void;
};
export type SplitterCollapseType = 'start' | 'end';
/** Per-bar capabilities derived from both neighbours (antd `useResizable`). */
export type SplitterBarInfo = {
    /** Both neighbours are resizable and neither is collapsed below its `min`. */
    resizable: boolean;
    /** The "start" button is available (collapses the previous panel, or expands a collapsed next one). */
    startCollapsible: boolean;
    /** The "end" button is available (collapses the next panel, or expands a collapsed previous one). */
    endCollapsible: boolean;
    showStartCollapsibleIcon: SplitterCollapsibleIconMode;
    showEndCollapsibleIcon: SplitterCollapsibleIconMode;
};
export type SplitterConfig = {
    orientation?: SplitterOrientation;
    /** Shorthand for `orientation="vertical"`; ignored when `orientation` is set. */
    vertical?: boolean;
    /** @deprecated use `orientation`. */
    layout?: SplitterOrientation;
    /**
     * Panel list. When omitted, panels come from `register()`. Keep the entries
     * referentially stable — dragged sizes are remembered per entry.
     */
    items?: readonly SplitterPanelConfig[];
    /** Arrow-key step in px (default 16). */
    keyboardStep?: number;
    onResizeStart?: (sizes: number[]) => void;
    onResize?: (sizes: number[]) => void;
    onResizeEnd?: (sizes: number[]) => void;
    /** Fired after a collapse button toggles; `collapsed[i]` is true for zero-size panels. */
    onCollapse?: (collapsed: boolean[], sizes: number[]) => void;
};
export type SplitterAria = {
    valueNow: number;
    valueMin: number;
    valueMax: number;
};
export type SplitterIns = {
    /** Panel sizes in px; empty until the container is first measured. */
    sizes: Accessor<number[]>;
    /**
     * Sizes to render: px once measured; before that (SSR / first frame) the raw
     * `size ?? defaultSize` so the markup can use it as `flex-basis` (`undefined` = auto).
     */
    panelSizes: Accessor<(number | string | undefined)[]>;
    panels: Accessor<readonly SplitterPanelConfig[]>;
    orientation: Accessor<SplitterOrientation>;
    isHorizontal: Accessor<boolean>;
    containerSize: Accessor<number>;
    /** Bar index being dragged (after direction confirmation), `undefined` when idle. */
    movingIndex: Accessor<number | undefined>;
    register: (panel: SplitterPanelConfig) => SplitterPanelHandle;
    barInfo: (barIndex: number) => SplitterBarInfo;
    /** Shorthand for `!barInfo(barIndex).resizable`. */
    isBarDisabled: (barIndex: number) => boolean;
    /** Report the measured container size (px); values <= 0 are ignored (hidden container). */
    setContainerSize: (px: number) => void;
    /** Begin a drag session on a bar. Returns false (and does nothing) when the bar is not resizable. */
    startResize: (barIndex: number) => boolean;
    /**
     * Move the bar by `offset` px measured from where the drag STARTED (not
     * incremental). Commits and fires `onResize`. Returns the new sizes.
     */
    updateResize: (barIndex: number, offset: number) => number[];
    /**
     * Finish the drag and fire `onResizeEnd`. With `lazyOffset` (lazy mode) the
     * offset is applied once here instead of during the drag.
     */
    endResize: (lazyOffset?: number) => void;
    /** Incremental low-level resize from the current sizes (fires `onResize` only). Returns whether sizes changed. */
    resizeBy: (barIndex: number, deltaPx: number) => boolean;
    /** Arrow keys step by `keyboardStep`; Home/End move as far as the limits allow. Returns handled. */
    keyboardResize: (barIndex: number, key: string) => boolean;
    /** Toggle via the bar's start / end collapse button. Returns false when that button is unavailable. */
    collapse: (barIndex: number, type: SplitterCollapseType) => boolean;
    /** Bar position and its movable range, as rounded percentages of the container. */
    aria: (barIndex: number) => SplitterAria;
    /** Clamp a raw drag offset (px) to the range the bar can actually move — used by the lazy preview. */
    constrainOffset: (barIndex: number, offset: number) => number;
};
export declare const splitterSplits: (keyof SplitterConfig)[];
/** `orientation` wins, then a boolean `vertical`, then the deprecated `layout`; default horizontal. */
export declare const resolveSplitterOrientation: (orientation?: SplitterOrientation, vertical?: boolean, layout?: SplitterOrientation) => SplitterOrientation;
/** Resolve a size to px against `total`; `undefined` for missing or unparsable values. */
export declare const resolveSplitterSize: (size: SplitterSize | string | undefined | null, total: number) => number | undefined;
export type SplitterNormalizedCollapsible = {
    start: boolean;
    end: boolean;
    showCollapsibleIcon: SplitterCollapsibleIconMode;
};
/** `true` → both directions; an object keeps its flags; the icon mode defaults to `'auto'`. */
export declare const normalizeCollapsible: (collapsible: SplitterPanelCollapsible | undefined) => SplitterNormalizedCollapsible;
/**
 * Fill undefined sizes so the list sums to `total` (px port of antd's
 * `autoPtgSizes`):
 * - all defined → scale to `total` (all zero → equal split);
 * - defined ones already overflow → scale them, undefined get 0;
 * - otherwise share the rest evenly when that respects every free panel's
 *   limits, else fill greedily (min first, then up to max, in order).
 * Unlike antd a final pass clamps defined sizes into their own min/max too.
 */
export declare const autoSplitterSizes: (sizes: readonly (number | undefined)[], mins: readonly (number | undefined)[], maxs: readonly (number | undefined)[], total: number) => number[];
export declare const createSplitter: (config?: SplitterConfig) => SplitterIns;
