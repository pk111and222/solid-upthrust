import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { DatePickerTimeConfig, DatePreset } from 'upthrust-competence';
import { SizeType } from '../../common/type';
export type RangePickerValue = [string, string];
export interface RangePickerProps {
    showTime?: boolean | DatePickerTimeConfig;
    presets?: DatePreset<RangePickerValue, JSX.Element>[];
    /** Controlled ['YYYY-MM-DD','YYYY-MM-DD']; null = empty. */
    value?: RangePickerValue | null;
    defaultValue?: RangePickerValue | null;
    min?: string;
    max?: string;
    /** Extra disable predicate (per day cell iso). */
    disabledDate?: (iso: string) => boolean;
    disabled?: boolean;
    /** First day of week: 0=Sunday (default), 1=Monday. */
    weekStart?: 0 | 1;
    allowClear?: boolean;
    /** Per-end placeholders. */
    placeholder?: [string, string];
    size?: SizeType;
    status?: 'error' | 'warning';
    /** Controlled dropdown open. */
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    id?: string;
    name?: string;
    class?: string;
    style?: JSX.CSSProperties;
    onChange?: (value: RangePickerValue | null) => void;
    onFocus?: (e: FocusEvent) => void;
    onBlur?: (e: FocusEvent) => void;
    /** Receives the START input element. */
    ref?: (el: HTMLInputElement) => void;
}
/**
 * RangePicker — the antd-style date range picker.
 *
 * COMPOSITION: the headless createDateRangePicker owns the pair value model
 * (start<=end invariant, pending seed + restart semantics), the active-end
 * pick flow, the hover preview, and the two-panel views (right = left+1
 * month). The dropdown layer is ONE createTrigger anchored on the shared
 * input frame; this layer renders two inputs joined by "~" and the
 * two-month portal panel.
 */
declare const RangePicker: Component<RangePickerProps>;
export default RangePicker;
