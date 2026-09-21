import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { SegmentedIns, SegmentedOption } from 'upthrust-competence';
import { SizeType } from '../../common/type';
export type { SegmentedOption };
/** antd allows either { label, value } items or bare strings/numbers. */
export type SegmentedItem = string | number | SegmentedOption;
export interface SegmentedProps {
    /** Controlled selected value. */
    value?: string | number;
    defaultValue?: string | number;
    /** Options (or bare values normalized into options). */
    options?: SegmentedItem[];
    disabled?: boolean;
    /** Stretch to full width; items share it evenly. */
    block?: boolean;
    size?: SizeType;
    status?: 'error' | 'warning';
    id?: string;
    class?: string;
    style?: JSX.CSSProperties;
    'aria-label'?: string;
    'aria-labelledby'?: string;
    onChange?: (value: string | number) => void;
    /** Escape hatch: the raw machine (imperative focus/measure control). */
    ref?: (machine: SegmentedIns) => void;
}
/**
 * Segmented — the antd-style pill picker with a sliding thumb.
 *
 * COMPOSITION: the value layer is the shared createSelection store (radio
 * semantics — maxSelect 1, clicking the selected item keeps it) riding
 * behind createSegmented; the thumb is measured geometry: every item
 * reports its offsetLeft/offsetWidth through a merged ref, the machine
 * derives the thumb box from the SELECTED (or keyboard-FOCUSED — antd
 * slides the thumb to the traversal candidate before commit) item, and
 * the renderer paints one absolutely positioned chip with a transition.
 */
declare const Segmented: Component<SegmentedProps>;
export default Segmented;
