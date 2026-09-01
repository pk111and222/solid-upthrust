import { Dayjs } from 'dayjs';
/**
 * The locale's week-first-day offset (0=Sunday, 1=Monday). The Calendar
 * component reads it for the weekday header row; the headless layer derives
 * its own copy inside the panel machine.
 */
export declare const weekFirstDayOf: (date?: Dayjs) => number;
