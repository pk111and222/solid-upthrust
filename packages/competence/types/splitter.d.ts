/**
 * Panel size in px (`number`, e.g. `240`) or percent (`` `${number}%` ``).
 */
export type SplitterSize = number | `${number}%`;
export type SplitterPanelConfig = {
    defaultSize?: SplitterSize;
    min?: SplitterSize;
    max?: SplitterSize;
    resizable?: boolean;
};
export type SplitterPanelHandle = {
    /** Reactive index inside the current panel registry (-1 once disposed). */
    index: () => number;
    dispose: () => void;
};
export type SplitterConfig = {
    layout?: 'horizontal' | 'vertical';
    keyboardStep?: number;
    onResize?: (sizes: number[]) => void;
    onResizeEnd?: (sizes: number[]) => void;
};
export type SplitterIns = {
    /** Panel sizes in px; empty until the container is first measured. */
    sizes: () => number[];
    panels: () => SplitterPanelConfig[];
    isHorizontal: () => boolean;
    register: (panel: SplitterPanelConfig) => SplitterPanelHandle;
    /** Bar after panel `barIndex` is disabled when either neighbor is non-resizable. */
    isBarDisabled: (barIndex: number) => boolean;
    /** Report the measured container size (px). First call normalizes sizes; later calls rescale. */
    setContainerSize: (px: number) => void;
    /** Positive delta grows panel `barIndex`, shrinking the next one; preserves the pair sum. */
    resizeBy: (barIndex: number, deltaPx: number) => boolean;
    /** Arrow keys step by `keyboardStep`; Home/End jump to the panel min/max. Returns handled. */
    keyboardResize: (barIndex: number, key: string) => boolean;
    endResize: () => void;
    aria: (barIndex: number) => {
        valueNow: number;
        valueMin: number;
        valueMax: number;
    };
};
export declare const splitterSplits: (keyof SplitterConfig)[];
export declare const createSplitter: (config?: SplitterConfig) => SplitterIns;
