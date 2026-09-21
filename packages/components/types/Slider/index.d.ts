import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { SliderMark } from 'upthrust-competence';
export type { SliderMark };
export interface SliderProps {
    /** Controlled value (single thumb). */
    value?: number;
    defaultValue?: number;
    /** Controlled [start, end] — enables two-thumb range mode. */
    rangeValue?: [number, number];
    defaultRangeValue?: [number, number];
    min?: number;
    max?: number;
    /** Step between values; null = free (mark-only snapping). */
    step?: number | null;
    precision?: number;
    disabled?: boolean;
    /** Right-to-left track. */
    reverse?: boolean;
    /** Vertical track. */
    vertical?: boolean;
    /** Value/label ticks; with marksOnly they become the pickable lattice. */
    marks?: SliderMark[];
    marksOnly?: boolean;
    id?: string;
    /** Accessible name; range handles append 起点/终点. */
    'aria-label'?: string;
    'aria-labelledby'?: string;
    class?: string;
    style?: JSX.CSSProperties;
    onChange?: (value: number) => void;
    onRangeChange?: (value: [number, number]) => void;
    onAfterChange?: (value: number | [number, number]) => void;
    ref?: (el: HTMLDivElement) => void;
}
/**
 * Slider — the antd-style track picker.
 *
 * The headless createSlider owns value/clamp/snap/drag, using the shared
 * numeric core for start-value storage.
 * This layer renders the track and feeds pointer events in: percent ←
 * clientX against the rail's bounding rect; the keyboard rides stepHandle.
 */
declare const Slider: Component<SliderProps>;
export default Slider;
