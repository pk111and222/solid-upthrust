import { DatePickerConfig, DateRangePickerConfig, DateRangeValue, DateParts, MonthCell, RangeActiveEnd } from './datePicker';
export type DatePickerType = 'date' | 'week' | 'month' | 'quarter' | 'year';
export interface DatePickerTimeConfig {
    defaultValue?: string;
    format?: 'HH:mm' | 'HH:mm:ss';
}
export interface DatePickerAdvancedConfig extends DatePickerConfig {
    picker?: DatePickerType;
    showTime?: boolean | DatePickerTimeConfig;
}
export interface DateRangePickerAdvancedConfig extends DateRangePickerConfig {
    showTime?: boolean | DatePickerTimeConfig;
}
export interface DatePreset<T, Label = string> {
    label: Label;
    value: T | (() => T);
}
export declare const normalizeTime: (value: string) => string | null;
export declare function startOfPickerPeriod(value: string, picker?: DatePickerType, weekStart?: 0 | 1): string | null;
/** Adds period/time value semantics while reusing the calendar/navigation state machine. */
export declare function createDatePickerAdvanced(config?: DatePickerAdvancedConfig): {
    value: import('solid-js').SourceAccessor<string | null>;
    canSelect: (input: string) => boolean;
    setValue: (input: string | null) => boolean;
    setTime: (time: string) => boolean;
    timeValue: () => string;
    clear: () => void;
    textValue: () => string;
    setInputText: (text: string) => void;
    commit: () => void;
    notifyBlur: () => void;
    pickMonth: (month: number) => boolean;
    pickYear: (year: number) => boolean;
    yearCellState: (year: number) => {
        disabled: boolean;
        selected: boolean;
    };
    monthCellState: (month: number) => {
        disabled: boolean;
        selected: boolean;
    };
    cellState: (cell: MonthCell) => {
        selected: boolean;
        disabled: boolean;
        today: boolean;
        adjacent: boolean;
    };
    commitActive: () => boolean;
    moveActive: (x: number, y: number) => void;
    setOpen: (open: boolean) => void;
    parts: () => DateParts | null;
    isDisabled: () => boolean;
    notifyFocus: () => void;
    isFocused: () => boolean;
    viewDate: () => {
        year: number;
        month: number;
    };
    setViewDate: (year: number, month: number) => void;
    mode: () => import('./datePicker').DatePickerMode;
    setMode: (mode: import('./datePicker').DatePickerMode) => void;
    monthMatrix: () => MonthCell[][];
    weekHeaderValues: () => number[];
    pickDay: (cell: MonthCell) => void;
    viewYearLabel: () => number;
    viewMonthLabel: () => number;
    decadeStart: () => number;
    decadeEnd: () => number;
    canPrev: () => boolean;
    canNext: () => boolean;
    activeIso: () => string | undefined;
    moveActiveMonth: (delta: number) => void;
    setActiveIso: (iso: string) => void;
    isOpen: () => boolean;
    goToday: () => void;
};
export declare function createDateRangePickerAdvanced(config?: DateRangePickerAdvancedConfig): {
    value: import('solid-js').SourceAccessor<DateRangeValue | null>;
    canSelect: (pair: DateRangeValue) => boolean;
    setValue: (pair: DateRangeValue | null) => boolean;
    setTime: (end: RangeActiveEnd, time: string) => boolean;
    startValue: () => string | null;
    endValue: () => string | null;
    timeValue: (end: RangeActiveEnd) => string;
    clear: () => void;
    textValue: (end: RangeActiveEnd) => string;
    setInputText: (end: RangeActiveEnd, text: string) => void;
    commit: (end: RangeActiveEnd) => void;
    notifyBlur: (end: RangeActiveEnd) => void;
    activeEnd: () => RangeActiveEnd;
    isComplete: () => boolean;
    isDisabled: () => boolean;
    notifyFocus: (end: RangeActiveEnd) => void;
    isFocused: () => boolean;
    leftView: () => {
        year: number;
        month: number;
    };
    rightView: () => {
        year: number;
        month: number;
    };
    setLeftView: (year: number, month: number) => void;
    leftMatrix: () => MonthCell[][];
    rightMatrix: () => MonthCell[][];
    monthMatrix: (panel: "left" | "right") => MonthCell[][];
    weekHeaderValues: () => number[];
    rangeCellState: (cell: MonthCell) => import('./datePicker').RangeCellState;
    pickDay: (cell: MonthCell) => void;
    hoverReport: (iso: string | null) => void;
    hoverIso: () => string | null;
    activeIso: () => string | undefined;
    moveActive: (deltaX: number, deltaY: number) => void;
    moveActiveMonth: (delta: number) => void;
    setActiveIso: (iso: string) => void;
    commitActive: () => void;
    canPrev: () => boolean;
    canNext: () => boolean;
    isOpen: () => boolean;
    setOpen: (open: boolean) => void;
    focusEnd: (end: RangeActiveEnd) => void;
};
