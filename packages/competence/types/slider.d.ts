import { NumericValueIns } from './selection';
import { FormFieldRule } from './formField';
export type SliderMark = {
    value: number;
    label?: string;
};
export type SliderConfig = {
    /** Controlled value (single number) — use `rangeValue` for two thumbs. */
    value?: number;
    defaultValue?: number;
    /** Controlled [start, end] pair (enables range mode). */
    rangeValue?: [number, number];
    defaultRangeValue?: [number, number];
    min?: number;
    max?: number;
    /** Step between values. Default 1; null = free values. marksOnly enables mark snapping. */
    step?: number | null;
    /** Explicit decimals to round to; default derives from step. */
    precision?: number;
    disabled?: boolean;
    /** Render the track right-to-left. */
    reverse?: boolean;
    /** Render the track vertically (affects point↔percent math only). */
    vertical?: boolean;
    /** Value labels on the marks. */
    marks?: SliderMark[];
    /** Only pickable values are the marks' (rc-slider marks-only mode). */
    marksOnly?: boolean;
    /** Gate every write (drag/keyboard/pointer). */
    readonly?: boolean;
    onChange?: (value: number) => void;
    onRangeChange?: (value: [number, number]) => void;
    /** Fired when a drag/keyboard interaction ENDS (antd onAfterChange). */
    onAfterChange?: (value: number | null | [number, number]) => void;
    /** Form integration: rules for the enclosing Item. */
    rules?: FormFieldRule[];
};
export type SliderIns = {
    /** Single value (range mode: reports the PAIR through rangeValue). */
    value: () => number;
    /** The [start, end] pair — single mode is [value, value]-tracked. */
    rangeValue: () => [number, number];
    /** True when configured for two thumbs. */
    isRange: () => boolean;
    min: () => number;
    max: () => number;
    step: () => number;
    isDisabled: () => boolean;
    /** 0..100 position of a VALUE on the track (reverse aware). */
    percentOf: (value: number) => number;
    /** Inverse: value at a 0..100 track position (step-snapped unless free). */
    valueAt: (percent: number) => number;
    /** Which thumb a track position is closest to (0 = start, 1 = end). */
    nearestHandle: (percent: number) => 0 | 1;
    /** Begin a drag at a percent; returns the handle being dragged. */
    beginDrag: (percent: number, handle?: 0 | 1) => 0 | 1;
    /** Pointer moved to a new percent (snaps before notifying). */
    dragTo: (percent: number) => void;
    /** Drag ended: fire onAfterChange with the accepted value. */
    endDrag: () => void;
    /** Cancel without a completion callback (unmount/pointer cancellation). */
    cancelDrag: () => void;
    /** Complete a keyboard interaction using the accepted value. */
    finishInteraction: () => void;
    isDragging: () => boolean;
    draggingHandle: () => 0 | 1 | null;
    /** Keyboard: step count, including accelerated steps; Home/End snap. */
    stepHandle: (handle: 0 | 1, steps: number) => void;
    snapToMin: (handle: 0 | 1) => void;
    snapToMax: (handle: 0 | 1) => void;
    /** Imperative single-value write (renderer-facing). */
    setValue: (value: number) => void;
    setRangeValue: (value: [number, number]) => void;
    /** Sorted marks + membership test (tick rendering). */
    marks: () => SliderMark[];
    isMarkAt: (value: number) => boolean;
    /** The shared numeric machine (advanced composition). */
    core: () => NumericValueIns;
};
export declare const createSlider: (config?: SliderConfig) => SliderIns;
export declare const sliderSplits: (keyof SliderConfig)[];
