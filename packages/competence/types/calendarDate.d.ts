import { default as dayjs, Dayjs } from 'dayjs';
export { dayjs, type Dayjs };
/** Calendar mode — what the whole component shows. */
export type CalendarMode = 'month' | 'year';
/** Source of a select event, antd parity. */
export type CalendarSelectSource = 'year' | 'month' | 'date' | 'customize';
/** One grid cell: a Dayjs anchor plus the flags the renderer styles on. */
export type CalendarCell = {
    date: Dayjs;
    /** True when the cell belongs to the panel's own month/year. */
    inView: boolean;
    isToday: boolean;
    /** Week-of-year for the row this date starts (showWeek column). */
    weekOfYear: number;
};
/** Year/month select option rows (calendar header). */
export type CalendarOption = {
    label: string;
    value: number;
};
export declare const isSameYear: (a?: Dayjs | null, b?: Dayjs | null) => boolean;
export declare const isSameMonth: (a?: Dayjs | null, b?: Dayjs | null) => boolean;
export declare const isSameDate: (a?: Dayjs | null, b?: Dayjs | null) => boolean;
/**
 * First cell of the date grid — rc's getWeekStartDate: align the month's
 * 1st backward to the week's first day, then roll back one more week when
 * that landed inside the SAME month past the 1st (a month starting late in
 * the week still needs 6 rows to cover its tail).
 */
export declare const getWeekStartDate: (monthStart: Dayjs, weekFirstDay: number) => Dayjs;
/**
 * The 7×6 date grid anchored on the panel month. `weekFirstDay` follows
 * dayjs's locale (zh-CN: 1=Monday, en: 0=Sunday).
 */
export declare const buildDateGrid: (pickerValue: Dayjs, today: Dayjs, weekFirstDay: number) => CalendarCell[];
/** The 3×4 month grid anchored on the panel year. */
export declare const buildMonthGrid: (pickerValue: Dayjs, today: Dayjs) => CalendarCell[];
/**
 * Year select options — antd Header: a 20-year window centered-ish on the
 * current year (current-10 .. current+9), or exactly the validRange years
 * when one is given.
 */
export declare const buildYearOptions: (year: number, validRange?: [Dayjs, Dayjs]) => CalendarOption[];
/**
 * Month select options — 0..11, clipped to the validRange when the panel
 * year touches its edges (rc MonthSelect).
 */
export declare const buildMonthOptions: (year: number, months: string[], validRange?: [Dayjs, Dayjs]) => CalendarOption[];
/**
 * Clamp a year/month-picked date into the validRange — rc YearSelect
 * semantics: switching to the range's boundary year pulls the month back
 * inside the range.
 */
export declare const clampDateToRange: (date: Dayjs, validRange?: [Dayjs, Dayjs]) => Dayjs;
/**
 * Date-grid selection: clicking a date in another month keeps the day-of-
 * month (rc setMonth semantics — no day clamping on the picker's own grid
 * cells because every cell is a real date).
 */
export declare const selectMonthKeepingDate: (base: Dayjs, month: number) => Dayjs;
/** Panel-mode mapping: calendar mode 'year' shows months, 'month' shows dates. */
export declare const modeToPanelMode: (mode: CalendarMode) => "date" | "month";
/**
 * Out-of-range test for whole dates — the merged disabled check
 * (validRange OR disabledDate) is the panel machine's job; this is the pure
 * range half.
 */
export declare const isOutOfRange: (date: Dayjs, validRange?: [Dayjs, Dayjs]) => boolean;
/**
 * Month-panel disabled: a month is selectable only when BOTH its first and
 * last days are in range (rc MonthPanel mergedDisabledDate — start AND end
 * must pass the check).
 */
export declare const isMonthOutOfRange: (date: Dayjs, validRange?: [Dayjs, Dayjs]) => boolean;
