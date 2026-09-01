import { Dayjs } from 'dayjs';
import { CalendarCell, CalendarMode, CalendarOption, CalendarSelectSource } from './calendarDate';
/**
 * Headless state machine for the Calendar panel — the generateCalendar /
 * rc-PickerPanel control core:
 *
 *  - controlled-or-uncontrolled `value` (defaults to now) and `mode`
 *  - `pickerValue` — the month/year the GRID displays (follows value when
 *    uncontrolled and untouched, antd/rc semantics)
 *  - event routing with antd parity: every cell click fires onSelect; a
 *    CHANGED value additionally fires onChange; a month-crossing date click
 *    (date panel) or year-crossing month click (month panel) also fires
 *    onPanelChange
 *  - disabled gating: validRange OR the consumer's disabledDate, where a
 *    month cell needs its whole span selectable
 *
 * No date math lives here — every derivation delegates to calendarDate.
 */
export type CalendarPanelConfig = {
    /** Controlled selected date. */
    value?: Dayjs;
    defaultValue?: Dayjs;
    /** Injected clock for tests. Default dayjs(). */
    now?: Dayjs;
    /** Controlled calendar mode. */
    mode?: CalendarMode;
    defaultMode?: CalendarMode;
    validRange?: [Dayjs, Dayjs];
    disabledDate?: (date: Dayjs) => boolean;
    onChange?: (date: Dayjs) => void;
    onSelect?: (date: Dayjs, source: CalendarSelectSource) => void;
    onPanelChange?: (date: Dayjs, mode: CalendarMode) => void;
};
export type CalendarPanelIns = {
    /** Selected date (controlled value wins). */
    value: () => Dayjs;
    /** Calendar mode: 'month' shows the date grid, 'year' shows months. */
    mode: () => CalendarMode;
    /** Grid mode: mode 'year' → 'month' cells, else 'date' cells. */
    panelMode: () => 'date' | 'month';
    /** The month/year the grid displays (not the selection). */
    pickerValue: () => Dayjs;
    today: () => Dayjs;
    /** 7×6 date grid (panelMode 'date'). */
    dateGrid: () => CalendarCell[];
    /** 3×4 month grid (panelMode 'month'). */
    monthGrid: () => CalendarCell[];
    /** Full disabled check for a grid cell (validRange OR disabledDate). */
    isCellDisabled: (date: Dayjs) => boolean;
    isDateSelected: (date: Dayjs) => boolean;
    isMonthSelected: (date: Dayjs) => boolean;
    /** Grid cell click — routes onSelect/onChange/onPanelChange. */
    selectDate: (date: Dayjs, source?: CalendarSelectSource) => void;
    /** Month cell click in month panel (mode 'year'). */
    selectMonth: (date: Dayjs, source?: CalendarSelectSource) => void;
    /** Move the displayed panel (header year/month select, prev/next). */
    setPickerValue: (date: Dayjs, source?: CalendarSelectSource) => void;
    /** Switch calendar mode (fires onPanelChange with the current value). */
    setMode: (mode: CalendarMode) => void;
    /** Header select options. */
    yearOptions: () => CalendarOption[];
    monthOptions: (months: string[]) => CalendarOption[];
    /** Day-of-week labels, rotated by the locale's week-first-day. */
    weekLabels: (shortWeekDays: string[], weekFirstDay: number) => string[];
};
export declare const createCalendarPanel: (config?: CalendarPanelConfig) => CalendarPanelIns;
export declare const calendarSplits: (keyof CalendarPanelConfig)[];
