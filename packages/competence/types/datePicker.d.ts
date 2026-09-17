import { FormFieldRule } from './formField';
export type DatePickerMode = 'date' | 'month' | 'year';
export type DatePickerConfig = {
    /** Controlled 'YYYY-MM-DD' string; null/undefined = empty. */
    value?: string | null;
    defaultValue?: string | null;
    /** Earliest pickable date (inclusive), 'YYYY-MM-DD'. */
    min?: string;
    /** Latest pickable date (inclusive), 'YYYY-MM-DD'. */
    max?: string;
    /** Extra disable predicate (per day cell). */
    disabledDate?: (iso: string) => boolean;
    disabled?: boolean;
    /** First day of week: 0=Sunday (default), 1=Monday. */
    weekStart?: 0 | 1;
    /** Controlled panel open (mirrors the UI trigger). */
    open?: boolean;
    onChange?: (value: string | null) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    /** Form integration: rules for the enclosing Item. */
    rules?: FormFieldRule[];
};
export type DateParts = {
    year: number;
    month: number;
    day: number;
};
/** 'YYYY-MM-DD' → parts; null when unparseable/empty/invalid. */
export declare const parseDate: (value: string | null | undefined) => DateParts | null;
/** parts → 'YYYY-MM-DD' (zero-padded). */
export declare const formatDate: (parts: DateParts) => string;
export declare const daysInMonth: (year: number, month: number) => number;
export declare const isLeapYear: (year: number) => boolean;
/** Today's parts (local time). */
export declare const todayParts: () => DateParts;
/** Compare two parts (negative when a < b). */
export declare const compareParts: (a: DateParts, b: DateParts) => number;
export declare const isSameDay: (a: DateParts | null, b: DateParts | null) => boolean;
/** parts → weekday 0-6 (0=Sunday), local time. */
export declare const weekdayOf: (p: DateParts) => number;
/**
 * The month matrix: 6 rows × 7 cols covering the whole visible grid.
 * Cells carry `current: false` for the spillover days and `iso` for the
 * full date string (spill days belong to adjacent months). `weekStart`
 * shifts the column order.
 */
export type MonthCell = {
    year: number;
    month: number;
    day: number;
    iso: string;
    current: boolean;
    weekday: number;
};
export declare const getMonthMatrix: (year: number, month: number, // 1-12, the view month
weekStart?: 0 | 1) => MonthCell[][];
/** The weekday header labels' absolute weekday values, respecting weekStart. */
export declare const weekHeaders: (weekStart?: 0 | 1) => number[];
/** Navigation on {year, month} (month 1-12). */
export declare const addMonths: (year: number, month: number, delta: number) => {
    year: number;
    month: number;
};
/** Clamp day into the month's length (Jan 31 + 1mo → Feb 28/29). */
export declare const clampDay: (p: DateParts) => DateParts;
export declare const addDays: (p: DateParts, delta: number) => DateParts;
/** The 10-year window the year panel shows (antd decade view). */
export declare const decadeRange: (year: number) => {
    start: number;
    end: number;
};
export type DatePickerIns = {
    /** The effective 'YYYY-MM-DD' (controlled wins), null when empty. */
    value: () => string | null;
    /** The parsed parts (null when empty). */
    parts: () => DateParts | null;
    isDisabled: () => boolean;
    /** Replace the RAW INPUT text (typing); commits when parseable. */
    setInputText: (text: string) => void;
    /** The raw buffer — what the input shows. */
    textValue: () => string;
    /** Blur-time snap: parse + clamp the buffer (typing-only, guarded). */
    commit: () => void;
    notifyFocus: () => void;
    notifyBlur: () => void;
    isFocused: () => boolean;
    /** Imperative value write (programmatic/API). */
    setValue: (value: string | null) => void;
    clear: () => void;
    /** The calendar month being viewed ({year, month: 1-12}). */
    viewDate: () => {
        year: number;
        month: number;
    };
    /** Jump the view (prev/next buttons). */
    setViewDate: (year: number, month: number) => void;
    /** Panel mode: date grid / month list / year list. */
    mode: () => DatePickerMode;
    setMode: (mode: DatePickerMode) => void;
    /** The 6×7 matrix for the date grid. */
    monthMatrix: () => MonthCell[][];
    /** Weekday header values (respecting weekStart). */
    weekHeaderValues: () => number[];
    /** Day-cell state derivation. */
    cellState: (cell: MonthCell) => {
        selected: boolean;
        today: boolean;
        disabled: boolean;
        adjacent: boolean;
    };
    /** Month-cell state for the month panel (month 1-12 of view year). */
    monthCellState: (month: number) => {
        selected: boolean;
        disabled: boolean;
    };
    /** Year-cell state for the year panel. */
    yearCellState: (year: number) => {
        selected: boolean;
        disabled: boolean;
    };
    /** Pick a day cell (adjacent cells shift the view too). */
    pickDay: (cell: MonthCell) => void;
    /** Pick a month (month panel) — drills into the date grid. */
    pickMonth: (month: number) => void;
    /** Pick a year (year panel) — drills into the month list. */
    pickYear: (year: number) => void;
    /** Header labels. */
    viewYearLabel: () => number;
    viewMonthLabel: () => number;
    decadeStart: () => number;
    decadeEnd: () => number;
    /** Whether prev/next navigation is allowed at the current view/mode. */
    canPrev: () => boolean;
    canNext: () => boolean;
    /** The active cell (keyboard nav) as iso; undefined = none. */
    activeIso: () => string | undefined;
    moveActive: (deltaX: number, deltaY: number) => void;
    moveActiveMonth: (delta: number) => void;
    setActiveIso: (iso: string) => void;
    /** Keyboard: commit the active cell per mode. */
    commitActive: () => void;
    /** Panel open state (the UI trigger owns the DOM; this mirrors). */
    isOpen: () => boolean;
    setOpen: (open: boolean) => void;
    /** Jump the view to today (antd "Today" button). */
    goToday: () => void;
};
export declare const createDatePicker: (config?: DatePickerConfig) => DatePickerIns;
export declare const datePickerSplits: (keyof DatePickerConfig)[];
/**
 * Headless logic for RangePicker — TWO coupled createDatePicker values.
 *
 * ARCHITECTURE: a range is [start, end] 'YYYY-MM-DD' strings with the
 * invariant start <= end. Rather than reimplementing calendar math, this
 * machine COMPOSES two createDatePicker instances and adds the range glue:
 *
 *   - ACTIVE END: which input the next pick lands in ('start' | 'end').
 *     antd/rc-picker semantics: pick start → active flips to end → pick
 *     end → closes. The active end's view is the LEFT panel; the other
 *     panel shows the following month.
 *   - VALUE ORDER: picking a date BEFORE the current start while the end
 *     is empty/active RESTARTS the range at that date (rc-picker's
 *     re-select behavior).
 *   - ORDERING SWAP: both ends always satisfy start <= end — a pick that
 *     inverts the pair swaps it.
 *   - HOVER PREVIEW: while the end is pending, hoverReport marks the
 *     would-be range cells (in-range + endpoint) for the UI highlight.
 *   - DISABLE CLOSURE: with a start selected, dates before it are
 *     disabled for the end pick (antd default; see `allowEmpty` for the
 *     future). min/max/disabledDate apply to BOTH ends.
 *
 * The UI layer renders two inputs + a shared two-month panel (createTrigger).
 */
export type DateRangeValue = [string, string];
export type RangeActiveEnd = 'start' | 'end';
export type DateRangePickerConfig = {
    /** Controlled ['YYYY-MM-DD','YYYY-MM-DD']; null = empty. */
    value?: DateRangeValue | null;
    defaultValue?: DateRangeValue | null;
    min?: string;
    max?: string;
    disabledDate?: (iso: string) => boolean;
    disabled?: boolean;
    weekStart?: 0 | 1;
    /** Controlled panel open (mirrors the UI trigger). */
    open?: boolean;
    onChange?: (value: DateRangeValue | null) => void;
    onFocus?: () => void;
    onBlur?: () => void;
};
export type RangeCellState = {
    selected: boolean;
    today: boolean;
    disabled: boolean;
    adjacent: boolean;
    /** Inside the committed [start, end] range (exclusive of endpoints). */
    inRange: boolean;
    /** Inside the hover-preview range (endpoint-style highlight on the ends). */
    hoverInRange: boolean;
    /** This cell IS the hovered endpoint preview. */
    hoverEndpoint: boolean;
    'range-start': boolean;
    'range-end': boolean;
};
export type DateRangePickerIns = {
    /** The effective pair (controlled wins), null when empty. */
    value: () => DateRangeValue | null;
    /** The individual end values (null when that end is unset). */
    startValue: () => string | null;
    endValue: () => string | null;
    /** Which input receives the next pick. */
    activeEnd: () => RangeActiveEnd;
    /** Both-end picks done? (drives the UI's "close panel" decision). */
    isComplete: () => boolean;
    isDisabled: () => boolean;
    setInputText: (end: RangeActiveEnd, text: string) => void;
    /** The raw buffer per end. */
    textValue: (end: RangeActiveEnd) => string;
    /** Blur-time snap for the typed end. */
    commit: (end: RangeActiveEnd) => void;
    notifyFocus: (end: RangeActiveEnd) => void;
    notifyBlur: (end: RangeActiveEnd) => void;
    isFocused: () => boolean;
    setValue: (value: DateRangeValue | null) => void;
    clear: () => void;
    /** The LEFT panel's view ({year, month: 1-12}). */
    leftView: () => {
        year: number;
        month: number;
    };
    rightView: () => {
        year: number;
        month: number;
    };
    /** Set the LEFT view directly; the right follows (left + 1 month). */
    setLeftView: (year: number, month: number) => void;
    /** Month matrices for the two panels (never overlapping — right = left+1). */
    leftMatrix: () => MonthCell[][];
    rightMatrix: () => MonthCell[][];
    monthMatrix: (panel: 'left' | 'right') => MonthCell[][];
    weekHeaderValues: () => number[];
    /** Day-cell derivation including range highlighting. */
    rangeCellState: (cell: MonthCell) => RangeCellState;
    /** Pick a day into the ACTIVE end (the range state machine). */
    pickDay: (cell: MonthCell) => void;
    /** Report hover for the pending-end preview (null clears). */
    hoverReport: (iso: string | null) => void;
    /** The hovered iso driving the preview. */
    hoverIso: () => string | null;
    /** Keyboard active cell for the active end's panel. */
    activeIso: () => string | undefined;
    moveActive: (deltaX: number, deltaY: number) => void;
    moveActiveMonth: (delta: number) => void;
    setActiveIso: (iso: string) => void;
    commitActive: () => void;
    /** Whether the prev/next navigation escapes [min, max]. */
    canPrev: () => boolean;
    canNext: () => boolean;
    isOpen: () => boolean;
    setOpen: (open: boolean) => void;
    /** Focus an input end (switches the pick target). */
    focusEnd: (end: RangeActiveEnd) => void;
};
export declare const createDateRangePicker: (config?: DateRangePickerConfig) => DateRangePickerIns;
export declare const dateRangePickerSplits: (keyof DateRangePickerConfig)[];
