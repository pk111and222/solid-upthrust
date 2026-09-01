import dayjs, { type Dayjs } from 'dayjs'
import localeData from 'dayjs/plugin/localeData.js'

// Idempotent registration (competence's calendarDate does the same set).
dayjs.extend(localeData)

/**
 * The locale's week-first-day offset (0=Sunday, 1=Monday). The Calendar
 * component reads it for the weekday header row; the headless layer derives
 * its own copy inside the panel machine.
 */
export const weekFirstDayOf = (date: Dayjs = dayjs()): number =>
  date.localeData().firstDayOfWeek()
