import { Component, For, Show, createMemo, createSignal, merge } from 'solid-js'
import type { JSX } from '@solidjs/web'
import dayjs, { type Dayjs } from 'dayjs'
import {
  createCalendarPanel, type CalendarMode, type CalendarPanelIns, type CalendarSelectSource,
} from 'upthrust-competence'
import { weekFirstDayOf } from '../../common/calendar'
import Dropdown, { type DropdownMenuItem } from '../Dropdown'
import {
  calendarRootClass, calendarHeaderClass, calendarSelectClass,
  calendarModeSwitchClass, calendarModeButtonClass, calendarPanelClass,
  calendarWeekdayClass, calendarWeekdayRowClass, calendarWeekdayRowPlaceholderClass, calendarGridClass,
  calendarFullDateClass, calendarFullDateValueClass, calendarFullDateContentClass,
  calendarMiniDateClass, calendarFullMonthClass, calendarMiniMonthClass,
  calendarWeekRowClass,
  CALENDAR_SELECT_ICON, CALENDAR_PREV_MONTH_ICON, CALENDAR_NEXT_MONTH_ICON,
} from './styles'
import { twMerge } from 'tailwind-merge'

/** Language pack for the calendar UI (antd Calendar locale.lang subset). */
export interface CalendarLang {
  /** Month names shown in the year-mode grid / month select (short form). */
  shortMonths: string[]
  shortWeekDays: string[]
  month: string
  year: string
  /** Overridden per locale: zh-CN shows 年 suffix in the year select. */
  yearSuffix?: string
}

export const CALENDAR_ZH_CN: CalendarLang = {
  shortMonths: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
  shortWeekDays: ['日','一','二','三','四','五','六'],
  month: '月',
  year: '年',
  yearSuffix: '年',
}

export const CALENDAR_EN_US: CalendarLang = {
  shortMonths: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  shortWeekDays: ['Su','Mo','Tu','We','Th','Fr','Sa'],
  month: 'Month',
  year: 'Year',
}

/** What the cell renderer is asked about (antd CellRenderInfo.type subset). */
export type CalendarCellType = 'date' | 'month'

export interface CalendarCellRenderInfo {
  type: CalendarCellType
  today: Dayjs
  /** Locale month/weekday names for custom cells. */
  lang: CalendarLang
}

export interface CalendarHeaderRenderConfig {
  value: Dayjs
  mode: CalendarMode
  onChange: (date: Dayjs) => void
  onTypeChange: (mode: CalendarMode) => void
}

export interface CalendarProps {
  /** Controlled selected date. */
  value?: Dayjs
  defaultValue?: Dayjs
  /** Controlled mode: 'month' = date grid, 'year' = month grid. */
  mode?: CalendarMode
  defaultMode?: CalendarMode
  /** Selectable range; cells outside are disabled. */
  validRange?: [Dayjs, Dayjs]
  disabledDate?: (date: Dayjs) => boolean
  /** Full-screen (120px cells) or mini (24px cells). Default true. */
  fullscreen?: boolean
  /** Show the week-number column (date grid only). */
  showWeek?: boolean
  /** Custom cell content under the date number / beside the month name. */
  cellRender?: (date: Dayjs, info: CalendarCellRenderInfo) => JSX.Element
  /** Replace the whole header (selectors + mode switch). */
  headerRender?: (config: CalendarHeaderRenderConfig) => JSX.Element
  locale?: CalendarLang
  onChange?: (date: Dayjs) => void
  onSelect?: (date: Dayjs, source: CalendarSelectSource) => void
  onPanelChange?: (date: Dayjs, mode: CalendarMode) => void
  /** Semantic slots, antd parity. */
  classNames?: Partial<Record<'root' | 'header' | 'body' | 'content' | 'item' | 'itemContent', string>>
  styles?: Partial<Record<'root' | 'header' | 'body' | 'content' | 'item' | 'itemContent', JSX.CSSProperties>>
  class?: string
  style?: JSX.CSSProperties
  /** Headless instance ref (controlled value still wins). */
  ref?: (ins: CalendarPanelIns) => void
}

/**
 * Merged cell state key — a single variant key per visual state, UnoCSS
 * scannable (never compoundVariants for visual classes).
 */
type CellState =
  | 'idle' | 'prev-next' | 'today' | 'today-prev-next'
  | 'selected' | 'selected-prev-next' | 'disabled'

const resolveCellState = (
  inView: boolean, isToday: boolean, selected: boolean, disabled: boolean,
): CellState => {
  if (disabled) return 'disabled'
  let state: CellState = 'idle'
  if (selected) state = 'selected'
  else if (isToday) state = 'today'
  if (!inView && state !== 'idle') {
    state = state === 'selected' ? 'selected-prev-next'
      : state === 'today' ? 'today-prev-next' : 'prev-next'
  } else if (!inView) {
    state = 'prev-next'
  }
  return state
}

const Calendar: Component<CalendarProps> = (rawProps) => {
  const props = merge(
    { fullscreen: true, showWeek: false, locale: CALENDAR_ZH_CN } as Partial<CalendarProps>,
    rawProps,
  )

  const lang = createMemo(() => props.locale ?? CALENDAR_ZH_CN)

  const cal = createCalendarPanel({
    get value() { return props.value },
    get defaultValue() { return props.defaultValue },
    get mode() { return props.mode },
    get defaultMode() { return props.defaultMode },
    get validRange() { return props.validRange },
    get disabledDate() { return props.disabledDate },
    get onChange() { return props.onChange },
    get onSelect() { return props.onSelect },
    get onPanelChange() { return props.onPanelChange },
  })
  props.ref?.(cal)

  const [yearOpen, setYearOpen] = createSignal(false)
  const [monthOpen, setMonthOpen] = createSignal(false)

  // The locale's week-first-day (zh-CN Monday, en Sunday). CalendarPanel
  // derives the same value internally for grid math; this copy feeds the
  // weekday header row labels.
  const weekFirstDay = createMemo(() => weekFirstDayOf(dayjs()))
  const weekLabels = createMemo(() => cal.weekLabels(lang().shortWeekDays, weekFirstDay()))

  const headerSize = () => props.fullscreen ? 'middle' : 'small'

  // ---- header selects (Dropdown stand-in until Select material lands) ----
  const yearItems = createMemo<DropdownMenuItem[]>(() =>
    cal.yearOptions().map(o => ({
      key: String(o.value),
      label: `${o.label}${lang().yearSuffix ?? ''}`,
    })))

  const monthItems = createMemo<DropdownMenuItem[]>(() =>
    cal.monthOptions(lang().shortMonths).map(o => ({
      key: String(o.value),
      label: lang().shortMonths[o.value] ?? String(o.value + 1),
    })))

  const onYearSelect = (key: string) => {
    const year = Number(key)
    // Keep the current month, clamp into range, move the panel.
    cal.setPickerValue(cal.pickerValue().year(year), 'year')
  }

  const onMonthSelect = (key: string) => {
    cal.setPickerValue(cal.pickerValue().month(Number(key)), 'month')
  }

  // Prev/next month arrows (mini mode only; full mode uses the selects).
  const shiftMonth = (delta: number) => {
    cal.setPickerValue(cal.pickerValue().add(delta, 'month'), 'month')
  }

  const header = () => props.headerRender ? props.headerRender({
    value: cal.value(),
    mode: cal.mode(),
    onChange: (date) => cal.selectDate(date, 'customize'),
    onTypeChange: (mode) => cal.setMode(mode),
  }) : (
    <div class={twMerge(calendarHeaderClass({ fullscreen: props.fullscreen }), props.classNames?.header)} style={props.styles?.header}>
      <Show when={!props.fullscreen}>
        <button
          type="button"
          class={twMerge(calendarModeButtonClass({ size: headerSize(), active: false }), 'px-[4px]')}
          aria-label="上一月"
          onClick={() => shiftMonth(-1)}
        >
          <span class={CALENDAR_PREV_MONTH_ICON} />
        </button>
        <button
          type="button"
          class={twMerge(calendarModeButtonClass({ size: headerSize(), active: false }), 'px-[4px]')}
          aria-label="下一月"
          onClick={() => shiftMonth(1)}
        >
          <span class={CALENDAR_NEXT_MONTH_ICON} />
        </button>
      </Show>
      <Dropdown
        menu={{ items: yearItems(), onClick: onYearSelect }}
        trigger="click"
        open={yearOpen()}
        onOpenChange={setYearOpen}
        placement="bottomLeft"
        overlayClass="max-h-[264px] overflow-y-auto"
      >
        <button type="button" class={calendarSelectClass({ size: headerSize() })}>
          {cal.pickerValue().year()}
          {lang().yearSuffix ?? ''}
          <span class={CALENDAR_SELECT_ICON} />
        </button>
      </Dropdown>
      <Show when={cal.mode() === 'month'}>
        <Dropdown
          menu={{ items: monthItems(), onClick: onMonthSelect }}
          trigger="click"
          open={monthOpen()}
          onOpenChange={setMonthOpen}
          placement="bottomLeft"
          overlayClass="max-h-[176px] overflow-y-auto"
        >
          <button type="button" class={calendarSelectClass({ size: headerSize() })}>
            {lang().shortMonths[cal.pickerValue().month()]}
            <span class={CALENDAR_SELECT_ICON} />
          </button>
        </Dropdown>
      </Show>
      <div class={calendarModeSwitchClass()}>
        <For each={['month', 'year'] as CalendarMode[]}>
          {(m) => (
            <button
              type="button"
              class={twMerge(
                calendarModeButtonClass({ size: headerSize(), active: false }),
                cal.mode() === m ? 'bg-primary/10 text-primary font-medium' : '',
              )}
              aria-pressed={cal.mode() === m ? 'true' : 'false'}
              onClick={() => cal.setMode(m)}
            >
              {m === 'month' ? lang().month : lang().year}
            </button>
          )}
        </For>
      </div>
    </div>
  )

  // ---- date grid -----------------------------------------------------------
  // disabled/selected MUST be derived inside JSX attribute expressions (or
  // memos) — values computed in the render-function body are captured once
  // by the compiled effects and never re-read, so the selected cell would
  // never move (the classic non-reactive-let pitfall).
  const renderDateCell = (cell: { date: Dayjs; inView: boolean; isToday: boolean; weekOfYear: number }) => {
    const cellRenderInfo = { type: 'date' as const, today: cal.today(), lang: lang() }

    if (props.fullscreen) {
      return (
        <div
          class={twMerge(
            calendarFullDateClass({
              state: resolveCellState(cell.inView, cell.isToday, cal.isDateSelected(cell.date), cal.isCellDisabled(cell.date)),
            }),
            props.classNames?.item,
          )}
          style={props.styles?.item}
          title={cell.date.format('YYYY-MM-DD')}
          onClick={() => cal.selectDate(cell.date)}
        >
          <div class={calendarFullDateValueClass({ selected: cal.isDateSelected(cell.date) })}>
            {String(cell.date.date()).padStart(2, '0')}
          </div>
          <div class={twMerge(calendarFullDateContentClass(), props.classNames?.itemContent)} style={props.styles?.itemContent}>
            {props.cellRender?.(cell.date, cellRenderInfo)}
          </div>
        </div>
      )
    }
    return (
      <div
        class={twMerge(
          calendarMiniDateClass({
            state: resolveCellState(cell.inView, cell.isToday, cal.isDateSelected(cell.date), cal.isCellDisabled(cell.date)),
          }),
          props.classNames?.item,
        )}
        style={props.styles?.item}
        title={cell.date.format('YYYY-MM-DD')}
        onClick={() => cal.selectDate(cell.date)}
      >
        {cell.date.date()}
        {/* cellRender in mini mode is a CORNER overlay (antd's notification
            demo: badges ride the top-right corner of the number). The anchor
            pulls the content fully outside the 24px box so a 20px Badge pill
            never covers the digit. */}
        {props.cellRender && (
          <span class="absolute -top-[10px] -right-[10px] flex items-center justify-center">
            {props.cellRender(cell.date, cellRenderInfo)}
          </span>
        )}
      </div>
    )
  }

  const renderWeekRow = (rowIndex: number, weekOfYear: number) => (
    <div class={calendarWeekRowClass()}>{weekOfYear}周</div>
  )

  // ---- month grid (year mode) ----------------------------------------------
  // Same reactive-derivation rule as renderDateCell (see the note there).
  const renderMonthCell = (cell: { date: Dayjs; isToday: boolean }) => {
    const cellRenderInfo = { type: 'month' as const, today: cal.today(), lang: lang() }
    const label = lang().shortMonths[cell.date.month()]

    if (props.fullscreen) {
      return (
        <div
          class={twMerge(
            calendarFullMonthClass({
              state: resolveCellState(true, cell.isToday, cal.isMonthSelected(cell.date), cal.isCellDisabled(cell.date)),
            }),
            props.classNames?.item,
          )}
          style={props.styles?.item}
          onClick={() => cal.selectMonth(cell.date)}
        >
          {label}
          {props.cellRender?.(cell.date, cellRenderInfo)}
        </div>
      )
    }
    return (
      <div
        class={twMerge(
          calendarMiniMonthClass({
            state: resolveCellState(true, cell.isToday, cal.isMonthSelected(cell.date), cal.isCellDisabled(cell.date)),
          }),
          props.classNames?.item,
        )}
        style={props.styles?.item}
        onClick={() => cal.selectMonth(cell.date)}
      >
        {label}
      </div>
    )
  }

  return (
    <div
      class={twMerge(calendarRootClass({ fullscreen: props.fullscreen }), props.class, props.classNames?.root)}
      style={{ ...props.styles?.root, ...props.style }}
    >
      {header()}
      <div class={twMerge(calendarPanelClass({ fullscreen: props.fullscreen }), props.classNames?.body)} style={props.styles?.body}>
        <Show
          when={cal.panelMode() === 'date'}
          fallback={
            <div class={twMerge(calendarGridClass({ layout: 'month' }), props.classNames?.content)} style={props.styles?.content}>
              <For each={cal.monthGrid()}>{renderMonthCell}</For>
            </div>
          }
        >
          {/* Weekday header: the SAME grid template as the date grid below
              (mini grid centers 24px cells in 1fr tracks; full right-aligns
              to the cells' px-[8px] padding) — a flex row drifts off the
              grid's column tracks whenever cell content widens a column. */}
          <div class={calendarWeekdayRowClass({
            layout: props.fullscreen
              ? (props.showWeek ? 'full-week' : 'full')
              : (props.showWeek ? 'mini-week' : 'mini'),
          })}>
            <Show when={props.showWeek}>
              <div class={calendarWeekdayRowPlaceholderClass()} />
            </Show>
            <For each={weekLabels()}>
              {(label) => (
                <div class={calendarWeekdayClass({ fullscreen: props.fullscreen })}>{label}</div>
              )}
            </For>
          </div>
          <Show when={props.showWeek} fallback={
            <div class={twMerge(calendarGridClass({ layout: 'date' }), props.classNames?.content)} style={props.styles?.content}>
              <For each={cal.dateGrid()}>{renderDateCell}</For>
            </div>
          }>
            <div class={twMerge(calendarGridClass({ layout: 'date-week' }), props.classNames?.content)} style={props.styles?.content}>
              <For each={cal.dateGrid()}>
                {(cell, i) => (
                  <>
                    <Show when={i() % 7 === 0}>{renderWeekRow(i() / 7, cell.weekOfYear)}</Show>
                    {renderDateCell(cell)}
                  </>
                )}
              </For>
            </div>
          </Show>
        </Show>
      </div>
    </div>
  )
}

export default Calendar
