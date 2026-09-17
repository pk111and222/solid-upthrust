import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { TimePickerUnit } from 'upthrust-competence';
import { default as RangePicker } from './RangePicker';
import { SizeType } from '../../common/type';
export type { TimePickerUnit };
export interface TimePickerProps {
    /** Controlled time string ('HH:mm' or 'HH:mm:ss' per format). */
    value?: string | null;
    defaultValue?: string | null;
    /** 'HH:mm' (default) or 'HH:mm:ss'. */
    format?: 'HH:mm' | 'HH:mm:ss';
    min?: string;
    max?: string;
    hourStep?: number;
    minuteStep?: number;
    secondStep?: number;
    disabled?: boolean;
    /** Allow clearing with the × button. Default true (antd). */
    allowClear?: boolean;
    placeholder?: string;
    size?: SizeType;
    status?: 'error' | 'warning';
    /** Controlled dropdown open. */
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    id?: string;
    name?: string;
    class?: string;
    style?: JSX.CSSProperties;
    onChange?: (value: string | null) => void;
    onFocus?: (e: FocusEvent) => void;
    onBlur?: (e: FocusEvent) => void;
    ref?: (el: HTMLInputElement) => void;
}
declare const TimePickerWithRange: Component<TimePickerProps> & {
    RangePicker: Component<import('./RangePicker').TimeRangePickerProps>;
};
export default TimePickerWithRange;
export { RangePicker };
export type { TimeRangePickerProps, TimeRangePickerValue } from './RangePicker';
