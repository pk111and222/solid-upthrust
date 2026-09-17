import { useComponentProps } from '../ConfigProvider/context'
import { ConfigPortal as Portal } from '../ConfigProvider/Portal'
import { Component, For, Show, createEffect, merge } from 'solid-js'
import { type JSX } from '@solidjs/web'
import { twMerge } from 'tailwind-merge'
import {
  createDateRangePickerAdvanced,
  type DatePickerTimeConfig,
  type DatePreset,
  createTrigger,
  type MonthCell,
} from 'upthrust-competence'
import type { SizeType } from '../../common/type'
import { useFormItem } from '../Input/context'
import {
  datePickerGridClass,
  datePickerHeaderClass,
  datePickerHeaderLabelClass,
  datePickerHeaderNavWrapClass,
  datePickerWeekHeaderCellClass,
  datePickerWeekHeaderClass,
} from './styles'
import {
  rangePickerCellWrapClass,
  rangePickerClearWrapClass,
  rangePickerDropdownClass,
  rangePickerInputClass,
  rangePickerPanelClass,
  rangePickerPanelsClass,
  rangePickerSeparatorClass,
  rangePickerSuffixClass,
} from './rangeStyles'

const WEEKDAY_LABELS = ['日', '一', '二', '三', '四', '五', '六'] as const

export type RangePickerValue = [string, string]

export interface RangePickerProps {
  showTime?: boolean | DatePickerTimeConfig
  presets?: DatePreset<RangePickerValue, JSX.Element>[]
  /** Controlled ['YYYY-MM-DD','YYYY-MM-DD']; null = empty. */
  value?: RangePickerValue | null
  defaultValue?: RangePickerValue | null
  min?: string
  max?: string
  /** Extra disable predicate (per day cell iso). */
  disabledDate?: (iso: string) => boolean
  disabled?: boolean
  /** First day of week: 0=Sunday (default), 1=Monday. */
  weekStart?: 0 | 1
  allowClear?: boolean
  /** Per-end placeholders. */
  placeholder?: [string, string]
  size?: SizeType
  status?: 'error' | 'warning'
  /** Controlled dropdown open. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  id?: string
  name?: string
  class?: string
  style?: JSX.CSSProperties
  onChange?: (value: RangePickerValue | null) => void
  onFocus?: (e: FocusEvent) => void
  onBlur?: (e: FocusEvent) => void
  /** Receives the START input element. */
  ref?: (el: HTMLInputElement) => void
}

/**
 * RangePicker — the antd-style date range picker.
 *
 * COMPOSITION: the headless createDateRangePicker owns the pair value model
 * (start<=end invariant, pending seed + restart semantics), the active-end
 * pick flow, the hover preview, and the two-panel views (right = left+1
 * month). The dropdown layer is ONE createTrigger anchored on the shared
 * input frame; this layer renders two inputs joined by "~" and the
 * two-month portal panel.
 */
const RangePicker: Component<RangePickerProps> = providedProps => {
  const rawProps = useComponentProps('DateRangePicker', providedProps)
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
  const machine = createDateRangePickerAdvanced({
    get showTime() { return props.showTime },
    get value() { return form.value() as RangePickerValue | null | undefined },
    get defaultValue() { return props.defaultValue },
    get min() { return props.min },
    get max() { return props.max },
    get disabledDate() { return props.disabledDate },
    get disabled() { return resolvedDisabled() },
    get weekStart() { return props.weekStart },
    get onChange() { return props.onChange },
    get onFocus() { return props.onFocus ? () => props.onFocus?.(undefined as unknown as FocusEvent) : undefined },
    get onBlur() { return props.onBlur ? () => props.onBlur?.(undefined as unknown as FocusEvent) : undefined },
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

  const startInputRef: { current?: HTMLInputElement } = {}
  const endInputRef: { current?: HTMLInputElement } = {}
  const setStartInputRef = (el: HTMLInputElement) => {
    startInputRef.current = el
    props.ref?.(el)
  }
  const setEndInputRef = (el: HTMLInputElement) => {
    endInputRef.current = el
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
        mm.commitActive()
        // Close only when the pair is complete after this commit.
        if (!props.showTime && m().isComplete()) {
          trigger.setOpen(false)
          startInputRef.current?.focus()
        }
        return
      case 'Escape':
        e.preventDefault()
        trigger.setOpen(false)
        return
    }
  }

  // The trigger's NATIVE click on the frame stops propagation — the × must
  // use pointerdown (the Select pitfall).
  const handleClearPointerDown = (e: PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    m().clear()
    startInputRef.current?.focus()
  }

  // Panel navigation: ±1 month steps the LEFT view (right follows).
  const navigate = (delta: number) => {
    const v = m().leftView()
    const zero = v.year * 12 + (v.month - 1) + delta
    m().setLeftView(Math.floor(zero / 12), (zero % 12 + 12) % 12)
  }

  /** One month panel's day grid (shared by the left/right panels). */
  const PanelGrid: Component<{ panel: 'left' | 'right' }> = (p) => {
    return (
      <div class={rangePickerPanelClass()}>
        {/* header */}
        <div class={datePickerHeaderClass()}>
          <Show when={p.panel === 'left'} fallback={<span class="w-[48px]" />}>
            <span
              class={datePickerHeaderNavWrapClass({ disabled: !m().canPrev() })}
              role="button"
              aria-label="上一月"
              tabindex={-1}
              onClick={() => navigate(-1)}
            >
              <span class="i-mdi-chevron-left" />
            </span>
          </Show>
          <span class={datePickerHeaderLabelClass()}>
            {(p.panel === 'left' ? m().leftView() : m().rightView()).year}年
            {(p.panel === 'left' ? m().leftView() : m().rightView()).month}月
          </span>
          <Show when={p.panel === 'right'} fallback={<span class="w-[24px]" />}>
            <span
              class={datePickerHeaderNavWrapClass({ disabled: !m().canNext() })}
              role="button"
              aria-label="下一月"
              tabindex={-1}
              onClick={() => navigate(1)}
            >
              <span class="i-mdi-chevron-right" />
            </span>
          </Show>
        </div>
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
          <For each={m().monthMatrix(p.panel).flat()}>
            {cell => (
              <span
                class={rangePickerCellWrapClass({
                  // INLINE reads (not a captured const): the class/aria
                  // bindings re-evaluate when value() flips.
                  selected: m().rangeCellState(cell).selected,
                  today: m().rangeCellState(cell).today,
                  adjacent: m().rangeCellState(cell).adjacent,
                  disabled: m().rangeCellState(cell).disabled,
                  active: !m().rangeCellState(cell).selected && m().activeIso() === cell.iso,
                  inRange: m().rangeCellState(cell).inRange,
                  hoverInRange: m().rangeCellState(cell).hoverInRange,
                  hoverEndpoint: m().rangeCellState(cell).hoverEndpoint,
                  'range-start': m().rangeCellState(cell)['range-start'],
                  'range-end': m().rangeCellState(cell)['range-end'],
                })}
                role="option"
                aria-selected={m().rangeCellState(cell).selected ? 'true' : 'false'}
                aria-disabled={m().rangeCellState(cell).disabled ? 'true' : 'false'}
                onClick={() => {
                  const wasPending = m().activeEnd() === 'end'
                  m().pickDay(cell)
                  // Close when the END pick completes a PENDING pair (the
                  // pick flow's terminal step). Editing a complete pair's
                  // single end stays open (antd keeps the panel for review).
                  if (!props.showTime && wasPending && m().isComplete() && m().hoverIso() === null) {
                    trigger.setOpen(false)
                    startInputRef.current?.focus()
                  }
                }}
                onMouseEnter={() => {
                  m().setActiveIso(cell.iso)
                  m().hoverReport(m().rangeCellState(cell).disabled ? null : cell.iso)
                }}
              >
                {cell.day}
              </span>
            )}
          </For>
        </div>
      </div>
    )
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
          ref={setStartInputRef}
          id={form.id() ? `${form.id()}-start` : undefined}
          name={props.name}
          type="text"
          autocomplete="off"
          placeholder={props.placeholder?.[0] ?? '开始日期'}
          disabled={resolvedDisabled()}
          class={rangePickerInputClass({ size: resolvedSize() })}
          value={m().textValue('start')}
          readonly={resolvedDisabled() || undefined}
          onInput={e => m().setInputText('start', (e.target as HTMLInputElement).value)}
          onKeyDown={handleKeyDown}
          onFocus={e => { m().notifyFocus('start'); props.onFocus?.(e) }}
          onBlur={e => { m().notifyBlur('start'); props.onBlur?.(e) }}
        />
        <span class={rangePickerSeparatorClass()}>~</span>
        <input
          ref={setEndInputRef}
          id={form.id() ? `${form.id()}-end` : undefined}
          type="text"
          autocomplete="off"
          placeholder={props.placeholder?.[1] ?? '结束日期'}
          disabled={resolvedDisabled()}
          class={rangePickerInputClass({ size: resolvedSize() })}
          value={m().textValue('end')}
          readonly={resolvedDisabled() || undefined}
          onInput={e => m().setInputText('end', (e.target as HTMLInputElement).value)}
          onKeyDown={handleKeyDown}
          onFocus={e => { m().notifyFocus('end'); props.onFocus?.(e) }}
          onBlur={e => { m().notifyBlur('end'); props.onBlur?.(e) }}
        />
        <span class={rangePickerSuffixClass()}>
          <Show when={props.allowClear && m().value() !== null}>
            <span
              class={rangePickerClearWrapClass({ visible: m().value() !== null && !resolvedDisabled() })}
              role="button"
              aria-label="清空"
              tabindex={-1}
              onPointerDown={handleClearPointerDown}
            >
              <span class="i-mdi-close-circle-outline" />
            </span>
          </Show>
          <span class="text-[12px] flex items-center pointer-events-none">
            <span class="i-mdi-calendar-outline" />
          </span>
        </span>
      </div>

      <Portal>
        <Show when={trigger.mounted()}>
          <div
            ref={(el) => { trigger.layerRef(el) }}
            class={rangePickerDropdownClass({ visible: open(), placement: trigger.actualPlacement() })}
            style={trigger.layerStyle()}
            role="listbox"
            tabindex={-1}
            onMouseLeave={() => m().hoverReport(null)}
          >
            <Show when={props.presets?.length}>
              <div class="flex flex-wrap gap-2 p-2 border-b border-solid border-outline-variant">
                <For each={props.presets}>{preset => <button type="button" class="border-0 bg-transparent text-primary cursor-pointer" onClick={() => {
                  const next = typeof preset.value === 'function' ? preset.value() : preset.value
                  if (m().setValue(next)) trigger.setOpen(false)
                }}>{preset.label}</button>}</For>
              </div>
            </Show>
            <div class={rangePickerPanelsClass()}>
              <PanelGrid panel="left" />
              <PanelGrid panel="right" />
            </div>
            <Show when={props.showTime}>
              <div class="flex items-center justify-end gap-3 p-2 border-t border-solid border-outline-variant">
                <For each={['start', 'end'] as const}>{end => <label class="flex items-center gap-1 text-[12px]">
                  {end === 'start' ? '开始时间' : '结束时间'}
                  <input type="time" aria-label={end === 'start' ? '开始时间' : '结束时间'} step={typeof props.showTime === 'object' && props.showTime.format === 'HH:mm' ? 60 : 1}
                    class="bg-transparent border border-solid border-outline rounded p-1 text-on-surface" disabled={!m().value()}
                    value={m().timeValue(end)} onInput={e => m().setTime(end, e.currentTarget.value)} />
                </label>}</For>
                <button type="button" class="border-0 bg-primary text-on-primary rounded px-3 py-1 cursor-pointer" disabled={!m().isComplete()} onClick={() => trigger.setOpen(false)}>确定</button>
              </div>
            </Show>
          </div>
        </Show>
      </Portal>
    </div>
  )
}

export default RangePicker
