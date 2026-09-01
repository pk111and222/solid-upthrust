import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { Dayjs } from 'dayjs';
import { CalendarMode, CalendarPanelIns, CalendarSelectSource } from 'upthrust-competence';
/** Language pack for the calendar UI (antd Calendar locale.lang subset). */
export interface CalendarLang {
    /** Month names shown in the year-mode grid / month select (short form). */
    shortMonths: string[];
    shortWeekDays: string[];
    month: string;
    year: string;
    /** Overridden per locale: zh-CN shows 年 suffix in the year select. */
    yearSuffix?: string;
}
export declare const CALENDAR_ZH_CN: CalendarLang;
export declare const CALENDAR_EN_US: CalendarLang;
/** What the cell renderer is asked about (antd CellRenderInfo.type subset). */
export type CalendarCellType = 'date' | 'month';
export interface CalendarCellRenderInfo {
    type: CalendarCellType;
    today: Dayjs;
    /** Locale month/weekday names for custom cells. */
    lang: CalendarLang;
}
export interface CalendarHeaderRenderConfig {
    value: Dayjs;
    mode: CalendarMode;
    onChange: (date: Dayjs) => void;
    onTypeChange: (mode: CalendarMode) => void;
}
export interface CalendarProps {
    /** Controlled selected date. */
    value?: Dayjs;
    defaultValue?: Dayjs;
    /** Controlled mode: 'month' = date grid, 'year' = month grid. */
    mode?: CalendarMode;
    defaultMode?: CalendarMode;
    /** Selectable range; cells outside are disabled. */
    validRange?: [Dayjs, Dayjs];
    disabledDate?: (date: Dayjs) => boolean;
    /** Full-screen (120px cells) or mini (24px cells). Default true. */
    fullscreen?: boolean;
    /** Show the week-number column (date grid only). */
    showWeek?: boolean;
    /** Custom cell content under the date number / beside the month name. */
    cellRender?: (date: Dayjs, info: CalendarCellRenderInfo) => JSX.Element;
    /** Replace the whole header (selectors + mode switch). */
    headerRender?: (config: CalendarHeaderRenderConfig) => JSX.Element;
    locale?: CalendarLang;
    onChange?: (date: Dayjs) => void;
    onSelect?: (date: Dayjs, source: CalendarSelectSource) => void;
    onPanelChange?: (date: Dayjs, mode: CalendarMode) => void;
    /** Semantic slots, antd parity. */
    classNames?: Partial<Record<'root' | 'header' | 'body' | 'content' | 'item' | 'itemContent', string>>;
    styles?: Partial<Record<'root' | 'header' | 'body' | 'content' | 'item' | 'itemContent', JSX.CSSProperties>>;
    class?: string;
    style?: JSX.CSSProperties;
    /** Headless instance ref (controlled value still wins). */
    ref?: (ins: CalendarPanelIns) => void;
}
declare const Calendar: Component<CalendarProps>;
export default Calendar;
