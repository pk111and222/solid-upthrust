import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { SizeType } from '../../common/type';
export type TimeRangePickerValue = [string, string];
export interface TimeRangePickerProps {
    /** Controlled ['HH:mm[:ss]','HH:mm[:ss]']; null = empty. */
    value?: TimeRangePickerValue | null;
    defaultValue?: TimeRangePickerValue | null;
    /** 'HH:mm' (default) or 'HH:mm:ss' for BOTH ends. */
    format?: 'HH:mm' | 'HH:mm:ss';
    /** Ordered per end (start <= end is enforced on blur commit). */
    min?: string;
    max?: string;
    hourStep?: number;
    minuteStep?: number;
    secondStep?: number;
    disabled?: boolean;
    allowClear?: boolean;
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
    onChange?: (value: TimeRangePickerValue | null) => void;
    onFocus?: (e: FocusEvent) => void;
    onBlur?: (e: FocusEvent) => void;
    ref?: (el: HTMLInputElement) => void;
}
/**
 * TimePicker.RangePicker — the antd-style time range picker.
 *
 * COMPOSITION: two INDEPENDENT createTimePicker machines (start/end)
 * plus a thin range layer in the component: the pair invariant
 * start <= end (enforced on change/commit — an inverted pick swaps the
 * ends), and the shared value shape ['HH:mm', 'HH:mm'] | null that clears
 * both ends together. The dropdown is ONE createTrigger on the shared
 * input frame rendering both column groups side by side.
 */
declare const TimeRangePicker: Component<TimeRangePickerProps>;
export default TimeRangePicker;
