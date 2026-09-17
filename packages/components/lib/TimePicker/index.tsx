import { ConfigPortal as Portal } from '../ConfigProvider/Portal'
import { useComponentProps } from '../ConfigProvider/context'
import { Component, For, Show, createEffect, createSignal, merge } from 'solid-js'
import { type JSX } from '@solidjs/web'
import { twMerge } from 'tailwind-merge'
import {
  createOwnerCleanup,
  createTimePicker,
  createTrigger,
  type TimePickerUnit,
} from 'upthrust-competence'
import RangePicker from './RangePicker'
import type { SizeType } from '../../common/type'
import { useFormItem } from '../Input/context'
import {
  timePickerClearWrapClass,
  timePickerColumnClass,
  timePickerColumnsClass,
  timePickerDropdownClass,
  timePickerIconClass,
  timePickerOptionWrapClass,
  timePickerSuffixClass,
} from './styles'

export type { TimePickerUnit }

export interface TimePickerProps {
  /** Controlled time string ('HH:mm' or 'HH:mm:ss' per format). */
  value?: string | null
  defaultValue?: string | null
  /** 'HH:mm' (default) or 'HH:mm:ss'. */
  format?: 'HH:mm' | 'HH:mm:ss'
  min?: string
  max?: string
  hourStep?: number
  minuteStep?: number
  secondStep?: number
  disabled?: boolean
  /** Allow clearing with the × button. Default true (antd). */
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
 * TimePicker — the antd-style time picker.
 *
 * COMPOSITION: the headless createTimePicker owns the time value model
 * (parse/format/clamp/lattice pure functions + controlled-or-uncontrolled
 * string), the input buffer with blur-snap commit (the InputNumber
 * contract), the per-unit stepper, and the panel's per-column active
 * option (the Select contract). The dropdown layer is createTrigger. This
 * layer renders the Input frame (with a segmented text input) and the
 * 2-3 column portal panel.
 */
const TimePicker: Component<TimePickerProps> = providedProps => {
  const rawProps = useComponentProps('TimePicker', providedProps)
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
  const machine = createTimePicker({
    get value() { return form.value() as string | null | undefined },
    get defaultValue() { return props.defaultValue },
    get format() { return props.format },
    get min() { return props.min },
    get max() { return props.max },
    get hourStep() { return props.hourStep },
    get minuteStep() { return props.minuteStep },
    get secondStep() { return props.secondStep },
    get disabled() { return resolvedDisabled() },
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

  const inputRef: { current?: HTMLInputElement } = {}
  const setInputRef = (el: HTMLInputElement) => {
    inputRef.current = el
    props.ref?.(el)
  }

  // Scroll the selected option of each column into view when the panel opens.
  const columnRefs: Record<string, HTMLDivElement | undefined> = {}
  const setColumnRef = (unit: string) => (el: HTMLDivElement) => {
    columnRefs[unit] = el
  }
  // The effect's dual-function form runs its CLEANUP callback outside the
  // effect's owner context in this Solid 2 rc — plain onCleanup there warns
  // [NO_OWNER_CLEANUP] and never runs. Bind to the component owner instead.
  const onOwnerCleanup = createOwnerCleanup()
  createEffect(() => open(), (isOpen) => {
    if (!isOpen) return
    const t = setTimeout(() => {
      for (const unit of m().units()) {
        const col = columnRefs[unit]
        if (!col) continue
        const selected = col.querySelector('[data-selected="true"]')
        selected?.scrollIntoView({ block: 'center' })
      }
    }, 60)
    onOwnerCleanup(() => clearTimeout(t))
  })

  // Which input segment is focused (h/m/s) — derived from the caret.
  const [focusedUnit, setFocusedUnit] = createSignal<TimePickerUnit>('hour')
  const unitAtCaret = (text: string, caret: number): TimePickerUnit => {
    // HH:mm[:ss] — segments at fixed offsets: 0-2 hour, 3-5 minute, 6-8 second.
    if (caret <= 2) return 'hour'
    if (caret <= 5) return 'minute'
    return 'second'
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    const mm = m()
    if (resolvedDisabled()) return
    const unit = focusedUnit()
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault()
        mm.stepSelected(1, unit)
        return
      case 'ArrowDown':
        e.preventDefault()
        mm.stepSelected(-1, unit)
        return
      case 'Enter':
        if (open()) {
          e.preventDefault()
          // Enter commits the panel's active option of the focused column.
          const active = mm.activeValue(unit)
          if (active !== undefined) mm.pickUnit(unit, active)
          trigger.setOpen(false)
          inputRef.current?.focus()
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

  // The trigger's NATIVE click on the input stops propagation — the × must
  // use pointerdown (the Select pitfall).
  const handleClearPointerDown = (e: PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    m().clear()
    inputRef.current?.focus()
  }

  const displayText = () => m().textValue()

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
          inputmode="numeric"
          autocomplete="off"
          placeholder={props.placeholder ?? '请选择时间'}
          disabled={resolvedDisabled()}
          class={twMerge(
            'flex-1 min-w-0 bg-transparent outline-none border-none p-0',
            'text-on-surface placeholder:text-on-surface/25 tabular-nums cursor-text',
            resolvedSize() === 'small' ? 'text-[12px]' : '',
            resolvedSize() === 'middle' ? 'text-[14px]' : '',
            resolvedSize() === 'large' ? 'text-[16px]' : '',
          )}
          value={displayText()}
          readonly={resolvedDisabled() || undefined}
          onInput={e => m().setInputText((e.target as HTMLInputElement).value)}
          onKeyDown={handleKeyDown}
          onFocus={e => {
            m().notifyFocus()
            props.onFocus?.(e)
          }}
          onBlur={e => {
            m().notifyBlur()
            props.onBlur?.(e)
          }}
          onClick={e => {
            const el = e.currentTarget as HTMLInputElement
            setFocusedUnit(unitAtCaret(el.value, el.selectionStart ?? 0))
          }}
          onKeyUp={e => {
            const el = e.currentTarget as HTMLInputElement
            setFocusedUnit(unitAtCaret(el.value, el.selectionStart ?? 0))
          }}
        />
        <span class={timePickerSuffixClass()}>
          <Show when={props.allowClear && m().value() !== null}>
            <span
              class={timePickerClearWrapClass({ visible: m().value() !== null && !resolvedDisabled() })}
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
            class={timePickerDropdownClass({ visible: open(), placement: trigger.actualPlacement() })}
            style={trigger.layerStyle()}
            role="listbox"
            tabindex={-1}
          >
            <div class={timePickerColumnsClass()}>
              <For each={m().units()}>
                {unit => (
                  <div ref={setColumnRef(unit)} class={timePickerColumnClass()}>
                    <For each={m().columnOptions(unit)}>
                      {opt => (
                        <div
                          class={timePickerOptionWrapClass({
                            selected: m().parts()?.[unit] === opt.value,
                            active: m().activeValue(unit) === opt.value,
                            disabled: m().isOptionDisabled(unit, opt.value),
                          })}
                          role="option"
                          aria-selected={m().parts()?.[unit] === opt.value ? 'true' : 'false'}
                          data-selected={m().parts()?.[unit] === opt.value ? 'true' : 'false'}
                          onClick={() => m().pickUnit(unit, opt.value)}
                          onMouseEnter={() => m().setActiveValue(unit, opt.value)}
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
        </Show>
      </Portal>
    </div>
  )
}

const TimePickerWithRange = Object.assign(TimePicker, { RangePicker })

export default TimePickerWithRange
export { RangePicker }
export type { TimeRangePickerProps, TimeRangePickerValue } from './RangePicker'
