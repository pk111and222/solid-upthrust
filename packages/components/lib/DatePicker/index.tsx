import { ConfigPortal as Portal } from '../ConfigProvider/Portal'
import { useComponentProps } from '../ConfigProvider/context'
import { Component, For, Show, createEffect, merge } from 'solid-js'
import { type JSX } from '@solidjs/web'
import { twMerge } from 'tailwind-merge'
import {
  createDatePickerAdvanced,
  type DatePickerType,
  type DatePickerTimeConfig,
  type DatePreset,
  createTrigger,
  type MonthCell,
} from 'upthrust-competence'
import RangePicker from './RangePicker'
import type { SizeType } from '../../common/type'
import { useFormItem } from '../Input/context'
import { PickerSuffix } from '../Select/PickerSuffix'
import {
  datePickerCellWrapClass,
  datePickerDropdownClass,
  datePickerFooterClass,
  datePickerGridClass,
  datePickerHeaderClass,
  datePickerHeaderLabelClass,
  datePickerHeaderNavWrapClass,
  datePickerListClass,
  datePickerMonthCellWrapClass,
  datePickerTodayBtnWrapClass,
  datePickerWeekHeaderCellClass,
  datePickerWeekHeaderClass,
} from './styles'

export type { MonthCell, DatePickerType, DatePickerTimeConfig, DatePreset }

const WEEKDAY_LABELS = ['日', '一', '二', '三', '四', '五', '六'] as const
const MONTH_LABELS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'] as const

export interface DatePickerProps {
  picker?: DatePickerType
  showTime?: boolean | DatePickerTimeConfig
  presets?: DatePreset<string, JSX.Element>[]
  /** Controlled 'YYYY-MM-DD' string; null = empty. */
  value?: string | null
  defaultValue?: string | null
  min?: string
  max?: string
  /** Extra disable predicate (per day cell iso). */
  disabledDate?: (iso: string) => boolean
  disabled?: boolean
  /** First day of week: 0=Sunday (default), 1=Monday. */
  weekStart?: 0 | 1
  allowClear?: boolean
  placeholder?: string
  size?: SizeType
  status?: 'error' | 'warning'
  /** Controlled dropdown open. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  id?: string
  name?: string
  class?: string
  style?: JSX.CSSProperties
  onChange?: (value: string | null) => void
  onFocus?: (e: FocusEvent) => void
  onBlur?: (e: FocusEvent) => void
  ref?: (el: HTMLInputElement) => void
}

/**
 * DatePicker — the antd-style date picker (date mode).
 *
 * COMPOSITION: the headless createDatePicker owns the calendar math (pure
 * parse/format/month-matrix functions), the value model ('YYYY-MM-DD'
 * string with blur-snap commit — the TimePicker contract), the panel view
 * (viewDate + date/month/year drill-down), and the active-cell keyboard
 * navigation (the Select contract). The dropdown layer is createTrigger. This
 * layer renders the Input frame + the calendar portal panel.
 */
const DatePicker: Component<DatePickerProps> = providedProps => {
  const rawProps = useComponentProps('DatePicker', providedProps)
  const props = merge({ allowClear: true }, rawProps)

  const form = useFormItem({
    get value() { return props.value },
    get onChange() { return props.onChange },
    get disabled() { return props.disabled },
    get id() { return props.id },
    get size() { return props.size },
    get status() { return props.status },
  })

  const resolvedSize = () => props.size ?? form.size() ?? 'middle'
  const resolvedStatus = () => form.status()
  const resolvedDisabled = () => form.disabled()

  // Created ONCE (the createMemo-wraps-machine pitfall — see Select).
  const machine = createDatePickerAdvanced({
    get picker() { return props.picker },
    get showTime() { return props.showTime },
    get value() { return form.value() as string | null | undefined },
    get defaultValue() { return props.defaultValue },
    get min() { return props.min },
    get max() { return props.max },
    get disabledDate() { return props.disabledDate },
    get disabled() { return resolvedDisabled() },
    get weekStart() { return props.weekStart },
    get onChange() { return (value: string | null) => {
      if (props.onChange) props.onChange(value)
      else form.onChange(value)
    } },
  })

  const trigger = createTrigger({
    get open() { return props.open },
    get disabled() { return resolvedDisabled() },
    action: 'click',
    placement: 'bottomLeft',
    offset: 4,
    get onOpenChange() { return props.onOpenChange },
  })

  const m = () => machine
  const open = () => trigger.open()

  createEffect(() => open(), (isOpen) => {
    machine.setOpen(isOpen)
  })

  const inputRef: { current?: HTMLInputElement } = {}
  const setInputRef = (el: HTMLInputElement) => {
    inputRef.current = el
    props.ref?.(el)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    const mm = m()
    if (resolvedDisabled()) return
    if (!open()) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        trigger.setOpen(true)
      }
      return
    }
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        mm.moveActive(-1, 0)
        return
      case 'ArrowRight':
        e.preventDefault()
        mm.moveActive(1, 0)
        return
      case 'ArrowUp':
        e.preventDefault()
        mm.moveActive(0, -1)
        return
      case 'ArrowDown':
        e.preventDefault()
        mm.moveActive(0, 1)
        return
      case 'PageUp':
        e.preventDefault()
        mm.moveActiveMonth(-1)
        return
      case 'PageDown':
        e.preventDefault()
        mm.moveActiveMonth(1)
        return
      case 'Enter':
        e.preventDefault()
        if (mm.commitActive() && !props.showTime) trigger.setOpen(false)
        inputRef.current?.focus()
        return
      case 'Escape':
        e.preventDefault()
        trigger.setOpen(false)
        return
    }
  }

  // The trigger's NATIVE click on the input stops propagation — the × must
  // use pointerdown (the Select pitfall).
  const clearValue = () => {
    m().clear()
    inputRef.current?.focus()
  }

  // Panel navigation: prev/next by mode (month view ±1 month; year view ±1
  // year; decade view ±10 years).
  const viewStep = () => {
    switch (m().mode()) {
      case 'year': return 12 // decade mode steps 10 years
      case 'month': return 1 // year mode steps 1 year
      default: return 1 // date mode steps 1 month
    }
  }
  const navigate = (delta: number) => {
    const v = m().viewDate()
    const mode = m().mode()
    if (mode === 'date') {
      // ±1 month
      const zero = v.year * 12 + (v.month - 1) + delta
      m().setViewDate(Math.floor(zero / 12), (zero % 12 + 12) % 12 + 1)
    } else if (mode === 'month') {
      // ±1 year
      m().setViewDate(v.year + delta, v.month)
    } else {
      // ±10 years
      m().setViewDate(v.year + delta * 10, v.month)
    }
  }

  const labelFor = (mode: 'month' | 'year') => {
    if (mode === 'month') return `${m().viewMonthLabel()}月`
    return `${m().viewYearLabel()}年`
  }

  const drillMode = (mode: 'month' | 'year' | 'date') => () => {
    m().setMode(mode)
  }

  return (
    <div class={twMerge('relative inline-flex w-full', props.class)} style={props.style}>
      <div
        ref={el => { trigger.triggerRef(el) }}
        class={twMerge(
          'inline-flex items-center w-full min-w-0 bg-surface rounded border border-solid border-outline',
          'transition-upthrust text-on-surface cursor-pointer',
          'hover:border-primary focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10',
          resolvedSize() === 'small' ? 'h-control-sm px-[7px]' : '',
          resolvedSize() === 'middle' ? 'h-control px-[11px]' : '',
          resolvedSize() === 'large' ? 'h-control-lg px-[11px]' : '',
          open() ? '!border-primary ring-2 ring-primary/10' : '',
          resolvedStatus() === 'error' ? '!border-error hover:!border-error focus-within:!border-error focus-within:!ring-error/8' : '',
          resolvedStatus() === 'warning' ? '!border-[#faad14] hover:!border-[#faad14] focus-within:!border-[#faad14] focus-within:!ring-[#faad14]/10' : '',
          resolvedDisabled() ? '!bg-on-surface/4 !border-on-surface/15 cursor-not-allowed hover:!border-on-surface/15 focus-within:!ring-transparent' : '',
        )}
      >
        <input
          ref={setInputRef}
          id={form.id()}
          name={props.name}
          type="text"
          autocomplete="off"
          placeholder={props.placeholder ?? (props.showTime ? 'YYYY-MM-DD HH:mm:ss' : props.picker === 'week' ? '请选择周' : props.picker === 'quarter' ? '请选择季度' : '请选择日期')}
          disabled={resolvedDisabled()}
          class={twMerge(
            'flex-1 min-w-0 bg-transparent outline-none border-none p-0',
            'text-on-surface placeholder:text-on-surface/25 cursor-text',
            resolvedSize() === 'small' ? 'text-[12px]' : '',
            resolvedSize() === 'middle' ? 'text-[14px]' : '',
            resolvedSize() === 'large' ? 'text-[16px]' : '',
          )}
          value={m().textValue()}
          readonly={resolvedDisabled() || undefined}
          onInput={e => m().setInputText((e.target as HTMLInputElement).value)}
          onKeyDown={handleKeyDown}
          onFocus={e => { m().notifyFocus(); props.onFocus?.(e) }}
          onBlur={e => { m().notifyBlur(); props.onBlur?.(e) }}
        />
        <PickerSuffix size={resolvedSize()} allowClear={props.allowClear} hasValue={m().value() !== null} disabled={resolvedDisabled()} icon="i-mdi-calendar-outline" onClear={clearValue} />
      </div>

      <Portal>
        <Show when={trigger.mounted()}>
          <div
            ref={(el) => { trigger.layerRef(el) }}
            class={datePickerDropdownClass({ visible: open(), placement: trigger.actualPlacement() })}
            style={trigger.layerStyle()}
            role="listbox"
            tabindex={-1}
          >
            {/* header */}
            <div class={datePickerHeaderClass()}>
              <span
                class={datePickerHeaderNavWrapClass({ disabled: !m().canPrev() })}
                role="button"
                aria-label="上一年"
                tabindex={-1}
                onClick={() => navigate(m().mode() === 'year' ? -1 : m().mode() === 'month' ? -1 : -1)}
              >
                <span class="i-mdi-chevron-double-left" />
              </span>
              <span
                class={datePickerHeaderNavWrapClass({ disabled: !m().canPrev() })}
                role="button"
                aria-label="上一月"
                tabindex={-1}
                onClick={() => navigate(m().mode() === 'date' ? -1 : 0)}
              >
                <span class="i-mdi-chevron-left" />
              </span>
              <Show
                when={m().mode() === 'date'}
                fallback={
                  <Show
                    when={m().mode() === 'month'}
                    fallback={
                      <span class={datePickerHeaderLabelClass()}>
                        {m().decadeStart()} - {m().decadeEnd()}
                      </span>
                    }
                  >
                    <span
                      class={datePickerHeaderLabelClass()}
                      role="button"
                      tabindex={-1}
                      onClick={drillMode('year')}
                    >
                      {m().viewYearLabel()}年
                    </span>
                  </Show>
                }
              >
                <span class="flex items-center gap-[4px]">
                  <span
                    class={datePickerHeaderLabelClass()}
                    role="button"
                    tabindex={-1}
                    onClick={drillMode('month')}
                  >
                    {m().viewMonthLabel()}月
                  </span>
                  <span
                    class={datePickerHeaderLabelClass()}
                    role="button"
                    tabindex={-1}
                    onClick={drillMode('year')}
                  >
                    {m().viewYearLabel()}年
                  </span>
                </span>
              </Show>
              <span
                class={datePickerHeaderNavWrapClass({ disabled: !m().canNext() })}
                role="button"
                aria-label="下一月"
                tabindex={-1}
                onClick={() => navigate(m().mode() === 'date' ? 1 : 0)}
              >
                <span class="i-mdi-chevron-right" />
              </span>
              <span
                class={datePickerHeaderNavWrapClass({ disabled: !m().canNext() })}
                role="button"
                aria-label="下一年"
                tabindex={-1}
                onClick={() => navigate(1)}
              >
                <span class="i-mdi-chevron-double-right" />
              </span>
            </div>

            {/* body per mode */}
            <Show
              when={m().mode() === 'date'}
              fallback={
                <Show
                  when={m().mode() === 'month'}
                  fallback={
                    // year list
                    <div class={datePickerListClass()}>
                      <For each={Array.from({ length: 12 }, (_, i) => m().decadeStart() + i)}>
                        {year => (
                          <span
                            class={datePickerMonthCellWrapClass({
                              selected: m().yearCellState(year).selected,
                              disabled: m().yearCellState(year).disabled,
                            })}
                            role="option"
                            aria-selected={m().yearCellState(year).selected ? 'true' : 'false'}
                            onClick={() => { if (m().pickYear(year) && !props.showTime) trigger.setOpen(false) }}
                          >
                            {year}
                          </span>
                        )}
                      </For>
                    </div>
                  }
                >
                  {/* month list */}
                  <div class={datePickerListClass()}>
                    <For each={props.picker === 'quarter' ? [1, 4, 7, 10] : Array.from({ length: 12 }, (_, i) => i + 1)}>
                      {month => (
                        <span
                          class={datePickerMonthCellWrapClass({
                            selected: m().monthCellState(month).selected,
                            disabled: m().monthCellState(month).disabled,
                          })}
                          role="option"
                          aria-selected={m().monthCellState(month).selected ? 'true' : 'false'}
                          onClick={() => { if (m().pickMonth(month) && !props.showTime) trigger.setOpen(false) }}
                        >
                          {props.picker === 'quarter' ? `第${Math.floor((month - 1) / 3) + 1}季度` : MONTH_LABELS[month - 1]}
                        </span>
                      )}
                    </For>
                  </div>
                </Show>
              }
            >
              {/* weekday header */}
              <div class={datePickerWeekHeaderClass()}>
                <For each={m().weekHeaderValues()}>
                  {wd => (
                    <span class={datePickerWeekHeaderCellClass()}>{WEEKDAY_LABELS[wd]}</span>
                  )}
                </For>
              </div>
              {/* day grid */}
              <div class={datePickerGridClass()}>
                <For each={m().monthMatrix().flat()}>
                  {cell => (
                    <span
                      class={datePickerCellWrapClass({
                        // INLINE reads (not a captured const): the class/aria
                        // bindings re-evaluate when value() flips, tracking
                        // through cellState's internals.
                        selected: m().cellState(cell).selected,
                        today: m().cellState(cell).today,
                        adjacent: m().cellState(cell).adjacent,
                        disabled: m().cellState(cell).disabled,
                        active: !m().cellState(cell).selected && m().activeIso() === cell.iso,
                      })}
                      role="option"
                      aria-selected={m().cellState(cell).selected ? 'true' : 'false'}
                      aria-disabled={m().cellState(cell).disabled ? 'true' : 'false'}
                      onClick={() => { if (m().cellState(cell).disabled) return; m().pickDay(cell); if (!props.showTime) trigger.setOpen(false) }}
                      onMouseEnter={() => m().setActiveIso(cell.iso)}
                    >
                      {cell.day}
                    </span>
                  )}
                </For>
              </div>
            </Show>

            <Show when={props.presets?.length}>
              <div class="flex flex-wrap gap-2 p-2 border-t border-solid border-outline-variant">
                <For each={props.presets}>{preset => <button type="button" class="border-0 bg-transparent text-primary cursor-pointer" onClick={() => {
                  const next = typeof preset.value === 'function' ? preset.value() : preset.value
                  if (m().setValue(next)) trigger.setOpen(false)
                }}>{preset.label}</button>}</For>
              </div>
            </Show>
            <Show when={props.showTime}>
              <div class="flex items-center justify-between gap-2 p-2 border-t border-solid border-outline-variant">
                <input type="time" aria-label="选择时间" step={typeof props.showTime === 'object' && props.showTime.format === 'HH:mm' ? 60 : 1}
                  class="bg-transparent border border-solid border-outline rounded p-1 text-on-surface" value={m().timeValue()} onInput={e => m().setTime(e.currentTarget.value)} />
                <button type="button" class="border-0 bg-primary text-on-primary rounded px-3 py-1 cursor-pointer" disabled={!m().value()} onClick={() => trigger.setOpen(false)}>确定</button>
              </div>
            </Show>
            {/* footer */}
            <div class={datePickerFooterClass()}>
              <span
                class={datePickerTodayBtnWrapClass()}
                role="button"
                tabindex={-1}
                onClick={() => {
                  m().goToday()
                  if (!props.showTime) trigger.setOpen(false)
                  inputRef.current?.focus()
                }}
              >
                今天
              </span>
            </div>
          </div>
        </Show>
      </Portal>
    </div>
  )
}

const DatePickerWithRange = Object.assign(DatePicker, { RangePicker })

export default DatePickerWithRange
export { RangePicker }
export type { RangePickerProps, RangePickerValue } from './RangePicker'
