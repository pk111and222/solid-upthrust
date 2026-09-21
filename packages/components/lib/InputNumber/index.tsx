import { useComponentProps } from '../ConfigProvider/context'
import { Component, Show, merge, untrack } from 'solid-js'
import { type JSX } from '@solidjs/web'
import { twMerge } from 'tailwind-merge'
import {
  type InputNumberFormatter,
  type InputNumberParser,
  createInputNumber,
  inputNumberSplits,
} from 'upthrust-competence'
import type { SizeType } from '../../common/type'
import { useFormItem } from '../Input/context'
import {
  inputNumberActionWrapClass,
  inputNumberActionsWrapClass,
  inputNumberAffixWrapClass,
  inputNumberClass,
  inputNumberInputWrapClass,
} from './styles'

export type { InputNumberFormatter, InputNumberParser }

export interface InputNumberProps {
  /** Controlled numeric value; null clears. */
  value?: number | null
  defaultValue?: number | null
  min?: number
  max?: number
  /** Increment per step. Default 1. */
  step?: number | number[]
  /** Multiplier when stepping with Shift. Default 10. */
  shiftMultiplier?: number
  /** Explicit decimals; otherwise preserves value and step precision. */
  precision?: number
  /** Strips non-numeric text BEFORE parsing (e.g. remove '$'). */
  parser?: InputNumberParser
  /** Renders the display text (e.g. add a unit). */
  formatter?: InputNumberFormatter
  prefix?: JSX.Element
  suffix?: JSX.Element
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  id?: string
  name?: string
  size?: SizeType
  status?: 'error' | 'warning'
  controls?: boolean
  class?: string
  style?: JSX.CSSProperties
  onChange?: (value: number | null) => void
  onStep?: (value: number, info: { offset: number; type: 'up' | 'down' }) => void
  onPressEnter?: (e: KeyboardEvent) => void
  onFocus?: (e: FocusEvent) => void
  onBlur?: (e: FocusEvent) => void
  ref?: (el: HTMLInputElement) => void
}

/**
 * InputNumber — numeric input with embedded up/down steppers.
 *
 * The headless createInputNumber owns the buffer/parse/step/clamp machine;
 * this layer renders the antd-style frame: an inline-flex wrapper with a
 * borderless inner input and a hover-revealed actions column. Form.Item
 * integration follows the Input contract (value-first onChange, context
 * fills value/status/id/disabled/size).
 */
const InputNumber: Component<InputNumberProps> = providedProps => {
  const rawProps = useComponentProps('InputNumber', providedProps)
  // No `size`/`status` defaults in merge — a filled default would shadow
  // undefined and BLOCK the FormItem context injection (the merge-default
  // pitfall; the resolved chain below carries the defaults instead).
  const props = merge({ type: 'text' }, rawProps)

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

  const machine = createInputNumber({
    get value() { return form.value() as number | null },
    get defaultValue() { return props.defaultValue },
    get min() { return props.min },
    get max() { return props.max },
    get step() { return props.step },
    get shiftMultiplier() { return props.shiftMultiplier },
    get precision() { return props.precision },
    get parser() { return props.parser },
    get formatter() { return props.formatter },
    get disabled() { return resolvedDisabled() },
    get readonly() { return props.readonly },
    get onChange() { return form.onChange },
    get onStep() { return props.onStep },
  })

  const inputRef: { current?: HTMLInputElement } = {}
  let composing = false
  const setInputRef = (el: HTMLInputElement) => {
    inputRef.current = el
    untrack(() => props.ref?.(el))
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (composing || e.isComposing) return
    const m = machine
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      m.up(e.shiftKey)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      m.down(e.shiftKey)
    } else if (e.key === 'Enter') {
      props.onPressEnter?.(e)
    }
  }

  const handleFocus = (e: FocusEvent) => {
    machine.notifyFocus()
    props.onFocus?.(e)
  }

  const handleBlur = (e: FocusEvent) => {
    composing = false
    machine.commit()
    props.onBlur?.(e)
  }

  const handleChange = (e: Event) => {
    if (composing) return
    machine.setInputText((e.target as HTMLInputElement).value)
  }

  // untrack-free: these fire inside event handlers (already untracked).
  const stepUp = (e: MouseEvent) => { e.preventDefault(); e.stopPropagation(); inputRef.current?.focus(); machine.up(e.shiftKey) }
  const stepDown = (e: MouseEvent) => { e.preventDefault(); e.stopPropagation(); inputRef.current?.focus(); machine.down(e.shiftKey) }

  const showControls = () => (props.controls !== false) && !machine.isDisabled() && !machine.isReadonly()

  return (
    <span
      class={twMerge(
        'group/inputnum',
        'inline-flex',
        'relative',
        inputNumberClass({
          size: resolvedSize(),
          status: resolvedStatus(),
          disabled: !!resolvedDisabled(),
          readonly: !!props.readonly,
        }),
        props.class,
      )}
      style={props.style}
    >
      <Show when={props.prefix !== undefined}>
        <span class={inputNumberAffixWrapClass({ side: 'prefix', size: resolvedSize() })}>
          {props.prefix}
        </span>
      </Show>
      <input
        ref={setInputRef}
        id={form.id()}
        name={props.name}
        type="text"
        inputmode="decimal"
        role="spinbutton"
        aria-invalid={resolvedStatus() === 'error' || machine.outOfRange() ? 'true' : undefined}
        aria-valuenow={machine.value() ?? undefined}
        aria-valuemin={props.min}
        aria-valuemax={props.max}
        value={machine.displayValue()}
        placeholder={props.placeholder}
        disabled={resolvedDisabled()}
        readonly={props.readonly || undefined}
        autocomplete="off"
        class={inputNumberInputWrapClass({
          size: resolvedSize(),
          outOfRange: machine.outOfRange(),
          disabled: !!resolvedDisabled(),
        })}
        onInput={handleChange}
        onCompositionStart={() => { composing = true }}
        onCompositionEnd={e => { composing = false; handleChange(e) }}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      <Show when={props.suffix !== undefined}>
        <span class={inputNumberAffixWrapClass({ side: 'suffix', size: resolvedSize() })}>
          {props.suffix}
        </span>
      </Show>
      <Show when={showControls()}>
        <span class={inputNumberActionsWrapClass({ hidden: false })}>
          <button
            type="button"
            onMouseDown={e => e.preventDefault()}
            class={inputNumberActionWrapClass({ direction: 'up', disabled: !machine.canUp() })}
            role="button"
            aria-label="increase"
            disabled={!machine.canUp()}
            aria-disabled={!machine.canUp() ? 'true' : 'false'}
            tabindex={-1}
            onClick={stepUp}
          >
            <span class="block i-mdi-chevron-up" aria-hidden="true" />
          </button>
          <button
            type="button"
            onMouseDown={e => e.preventDefault()}
            class={inputNumberActionWrapClass({ direction: 'down', disabled: !machine.canDown() })}
            role="button"
            aria-label="decrease"
            disabled={!machine.canDown()}
            aria-disabled={!machine.canDown() ? 'true' : 'false'}
            tabindex={-1}
            onClick={stepDown}
          >
            <span class="block i-mdi-chevron-down" aria-hidden="true" />
          </button>
        </span>
      </Show>
    </span>
  )
}

export default InputNumber

// Keep the splits export referenced so bundlers don't drop the headless
// contract (also re-exported for splitProps consumers).
export { inputNumberSplits }
