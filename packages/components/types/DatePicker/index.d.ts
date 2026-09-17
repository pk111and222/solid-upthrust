import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { DatePickerType, DatePickerTimeConfig, DatePreset, MonthCell } from 'upthrust-competence';
import { default as RangePicker } from './RangePicker';
import { SizeType } from '../../common/type';
export type { MonthCell, DatePickerType, DatePickerTimeConfig, DatePreset };
export interface DatePickerProps {
    picker?: DatePickerType;
    showTime?: boolean | DatePickerTimeConfig;
    presets?: DatePreset<string, JSX.Element>[];
    /** Controlled 'YYYY-MM-DD' string; null = empty. */
    value?: string | null;
    defaultValue?: string | null;
    min?: string;
    max?: string;
    /** Extra disable predicate (per day cell iso). */
    disabledDate?: (iso: string) => boolean;
    disabled?: boolean;
    /** First day of week: 0=Sunday (default), 1=Monday. */
    weekStart?: 0 | 1;
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
declare const DatePickerWithRange: Component<DatePickerProps> & {
    RangePicker: Component<import('./RangePicker').RangePickerProps>;
};
export default DatePickerWithRange;
export { RangePicker };
export type { RangePickerProps, RangePickerValue } from './RangePicker';
