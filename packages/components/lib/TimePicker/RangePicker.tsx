import { useComponentProps } from '../ConfigProvider/context'
import { ConfigPortal as Portal } from '../ConfigProvider/Portal'
import { Component, For, Show, createEffect, merge } from 'solid-js'
import { type JSX } from '@solidjs/web'
import { twMerge } from 'tailwind-merge'
import {
  createOwnerCleanup,
  createTimePicker,
  createTrigger,
  type TimePickerUnit,
} from 'upthrust-competence'
import type { SizeType } from '../../common/type'
import { useFormItem } from '../Input/context'
import {
  timePickerClearWrapClass,
  timePickerColumnClass,
  timePickerIconClass,
  timePickerOptionWrapClass,
} from './styles'
import {
  timeRangePickerColumnsClass,
  timeRangePickerDropdownClass,
  timeRangePickerInputClass,
  timeRangePickerPanelClass,
  timeRangePickerPanelsClass,
  timeRangePickerSeparatorClass,
  timeRangePickerSuffixClass,
} from './rangeStyles'

export type TimeRangePickerValue = [string, string]

export interface TimeRangePickerProps {
  /** Controlled ['HH:mm[:ss]','HH:mm[:ss]']; null = empty. */
  value?: TimeRangePickerValue | null
  defaultValue?: TimeRangePickerValue | null
  /** 'HH:mm' (default) or 'HH:mm:ss' for BOTH ends. */
  format?: 'HH:mm' | 'HH:mm:ss'
  /** Ordered per end (start <= end is enforced on blur commit). */
  min?: string
  max?: string
  hourStep?: number
  minuteStep?: number
  secondStep?: number
  disabled?: boolean
  allowClear?: boolean
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
  onChange?: (value: TimeRangePickerValue | null) => void
  onFocus?: (e: FocusEvent) => void
  onBlur?: (e: FocusEvent) => void
  ref?: (el: HTMLInputElement) => void
}

/**
 * TimePicker.RangePicker — the antd-style time range picker.
 *
 * COMPOSITION: two INDEPENDENT createTimePicker machines (start/end)
 * plus a thin range layer in the component: the pair invariant
 * start <= end (enforced on change/commit — an inverted pick swaps the
 * ends), and the shared value shape ['HH:mm', 'HH:mm'] | null that clears
 * both ends together. The dropdown is ONE createTrigger on the shared
 * input frame rendering both column groups side by side.
 */
const TimeRangePicker: Component<TimeRangePickerProps> = providedProps => {
  const rawProps = useComponentProps('TimeRangePicker', providedProps)
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

  const rawPair = (): TimeRangePickerValue | null | undefined =>
    form.value() as TimeRangePickerValue | null | undefined

  const pair = (): TimeRangePickerValue | null => {
    const v = rawPair()
    if (v === undefined) return null
    if (!v) return null
    return v
  }

  const emitPair = (next: TimeRangePickerValue | null) => {
    props.onChange?.(next)
  }

  // The two machines — created ONCE (the createMemo-wraps-machine pitfall).
  const startMachine = createTimePicker({
    get value() { return pair()?.[0] ?? null },
    get format() { return props.format },
    get min() { return props.min },
    get max() { return props.max },
    get hourStep() { return props.hourStep },
    get minuteStep() { return props.minuteStep },
    get secondStep() { return props.secondStep },
    get disabled() { return resolvedDisabled() },
    // Route both ends' changes through the range layer (the pair invariant).
    get onChange() { return (v: string | null) => handleEndChange('start', v) },
    get onFocus() { return props.onFocus ? () => props.onFocus?.(undefined as unknown as FocusEvent) : undefined },
    get onBlur() { return props.onBlur ? () => props.onBlur?.(undefined as unknown as FocusEvent) : undefined },
  })

  const endMachine = createTimePicker({
    get value() { return pair()?.[1] ?? null },
    get format() { return props.format },
    get min() { return props.min },
    get max() { return props.max },
    get hourStep() { return props.hourStep },
    get minuteStep() { return props.minuteStep },
    get secondStep() { return props.secondStep },
    get disabled() { return resolvedDisabled() },
    get onChange() { return (v: string | null) => handleEndChange('end', v) },
    get onFocus() { return props.onFocus ? () => props.onFocus?.(undefined as unknown as FocusEvent) : undefined },
    get onBlur() { return props.onBlur ? () => props.onBlur?.(undefined as unknown as FocusEvent) : undefined },
  })

  /** Range layer: one end changed — keep start <= end (swap on inversion). */
  const handleEndChange = (end: 'start' | 'end', v: string | null) => {
    const cur = pair()
    if (v === null) {
      // Clearing one end clears the pair (antd keeps no half-range).
      if (cur !== null) emitPair(null)
      return
    }
    if (cur === null) {
      emitPair(end === 'start' ? [v, v] : [v, v])
      return
    }
    if (end === 'start') {
      emitPair(v <= cur[1] ? [v, cur[1]] : [v, v])
    } else {
      emitPair(cur[0] <= v ? [cur[0], v] : [v, v])
    }
  }

  const machines = (): Array<['start' | 'end', typeof startMachine]> => [
    ['start', startMachine],
    ['end', endMachine],
  ]

  const trigger = createTrigger({
    get open() { return props.open },
    get disabled() { return resolvedDisabled() },
    action: 'click',
    placement: 'bottomLeft',
    offset: 4,
    get onOpenChange() { return props.onOpenChange },
  })

  const open = () => trigger.open()

  createEffect(() => open(), (isOpen) => {
    startMachine.setOpen(isOpen)
    endMachine.setOpen(isOpen)
  })

  const startInputRef: { current?: HTMLInputElement } = {}
  const setStartInputRef = (el: HTMLInputElement) => {
    startInputRef.current = el
    props.ref?.(el)
  }
  const endInputRef: { current?: HTMLInputElement } = {}
  const setEndInputRef = (el: HTMLInputElement) => {
    endInputRef.current = el
  }

  // Scroll the selected option of each column into view when the panel opens.
  const columnRefs: Record<string, HTMLDivElement | undefined> = {}
  const setColumnRef = (key: string) => (el: HTMLDivElement) => {
    columnRefs[key] = el
  }
  // The effect's dual-function form runs its CLEANUP callback outside the
  // effect's owner context in this Solid 2 rc — plain onCleanup there warns
  // [NO_OWNER_CLEANUP] and never runs. Bind to the component owner instead.
  const onOwnerCleanup = createOwnerCleanup()
  createEffect(() => open(), (isOpen) => {
    if (!isOpen) return
    const t = setTimeout(() => {
      for (const key of Object.keys(columnRefs)) {
        const col = columnRefs[key]
        if (!col) continue
        const selected = col.querySelector('[data-selected="true"]')
        selected?.scrollIntoView({ block: 'center' })
      }
    }, 60)
    onOwnerCleanup(() => clearTimeout(t))
  })

  const handleClearPointerDown = (e: PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    handleEndChange('start', null)
    startInputRef.current?.focus()
  }

  const handleKeyDown = (machine: typeof startMachine) => (e: KeyboardEvent) => {
    if (resolvedDisabled()) return
    void machine
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        if (!open()) {
          e.preventDefault()
          trigger.setOpen(true)
          return
        }
        return
      case 'Enter':
        if (open()) {
          e.preventDefault()
          trigger.setOpen(false)
          startInputRef.current?.focus()
        }
        return
      case 'Escape':
        if (open()) {
          e.preventDefault()
          trigger.setOpen(false)
        }
        return
    }
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
          inputmode="numeric"
          autocomplete="off"
          placeholder={props.placeholder?.[0] ?? '开始时间'}
          disabled={resolvedDisabled()}
          class={timeRangePickerInputClass({ size: resolvedSize() })}
          value={startMachine.textValue()}
          readonly={resolvedDisabled() || undefined}
          onInput={e => startMachine.setInputText((e.target as HTMLInputElement).value)}
          onKeyDown={handleKeyDown(startMachine)}
          onFocus={e => { startMachine.notifyFocus(); props.onFocus?.(e) }}
          onBlur={e => { startMachine.notifyBlur(); props.onBlur?.(e) }}
        />
        <span class={timeRangePickerSeparatorClass()}>~</span>
        <input
          ref={setEndInputRef}
          id={form.id() ? `${form.id()}-end` : undefined}
          type="text"
          inputmode="numeric"
          autocomplete="off"
          placeholder={props.placeholder?.[1] ?? '结束时间'}
          disabled={resolvedDisabled()}
          class={timeRangePickerInputClass({ size: resolvedSize() })}
          value={endMachine.textValue()}
          readonly={resolvedDisabled() || undefined}
          onInput={e => endMachine.setInputText((e.target as HTMLInputElement).value)}
          onKeyDown={handleKeyDown(endMachine)}
          onFocus={e => { endMachine.notifyFocus(); props.onFocus?.(e) }}
          onBlur={e => { endMachine.notifyBlur(); props.onBlur?.(e) }}
        />
        <span class={timeRangePickerSuffixClass()}>
          <Show when={props.allowClear && pair() !== null}>
            <span
              class={timePickerClearWrapClass({ visible: pair() !== null && !resolvedDisabled() })}
              role="button"
              aria-label="清空"
              tabindex={-1}
              onPointerDown={handleClearPointerDown}
            >
              <span class="i-mdi-close-circle-outline" />
            </span>
          </Show>
          <span class={timePickerIconClass()}>
            <span class="i-mdi-clock-outline" />
          </span>
        </span>
      </div>

      <Portal>
        <Show when={trigger.mounted()}>
          <div
            ref={(el) => { trigger.layerRef(el) }}
            class={timeRangePickerDropdownClass({ visible: open(), placement: trigger.actualPlacement() })}
            style={trigger.layerStyle()}
            role="listbox"
            tabindex={-1}
          >
            <div class={timeRangePickerPanelsClass()}>
              <For each={machines()}>
                {([endKey, machine]) => (
                  <div class={timeRangePickerPanelClass()}>
                    <div class={timeRangePickerColumnsClass()}>
                      <For each={machine.units()}>
                        {unit => (
                          <div
                            ref={setColumnRef(`${endKey}-${unit}`)}
                            class={timePickerColumnClass()}
                          >
                            <For each={machine.columnOptions(unit)}>
                              {opt => (
                                <div
                                  class={timePickerOptionWrapClass({
                                    selected: machine.parts()?.[unit] === opt.value,
                                    active: machine.activeValue(unit) === opt.value,
                                    disabled: machine.isOptionDisabled(unit, opt.value),
                                  })}
                                  role="option"
                                  aria-selected={machine.parts()?.[unit] === opt.value ? 'true' : 'false'}
                                  data-selected={machine.parts()?.[unit] === opt.value ? 'true' : 'false'}
                                  onClick={() => machine.pickUnit(unit, opt.value)}
                                  onMouseEnter={() => machine.setActiveValue(unit, opt.value)}
                                >
                                  {String(opt.value).padStart(2, '0')}
                                </div>
                              )}
                            </For>
                          </div>
                        )}
                      </For>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </div>
        </Show>
      </Portal>
    </div>
  )
}

export default TimeRangePicker
