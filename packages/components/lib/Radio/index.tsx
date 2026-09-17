import { useComponentProps } from '../ConfigProvider/context'
import { Component, For, Show, createMemo, merge } from 'solid-js'
import { type JSX } from '@solidjs/web'
import { twMerge } from 'tailwind-merge'
import {
  type RadioOption,
  createRadio,
  createRadioGroup,
} from 'upthrust-competence'
import { useFormItem } from '../Input/context'
import {
  radioButtonClass,
  radioButtonGroupClass,
  radioButtonInputClass,
  radioDotClass,
  radioGroupClass,
  radioInputClass,
  radioInnerDotWrapClass,
  radioLabelWrapClass,
  radioWrapperClass,
} from './styles'

export type { RadioOption }

export interface RadioProps {
  /** Controlled checked (standalone usage). */
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  /** Render standalone even inside a RadioGroup. */
  skipGroup?: boolean
  id?: string
  name?: string
  /** The key this radio represents inside a group. */
  value?: string | number
  class?: string
  style?: JSX.CSSProperties
  children?: JSX.Element
  onChange?: (checked: boolean, event?: Event) => void
  ref?: (el: HTMLInputElement) => void
}

/**
 * Radio — the antd-style single picker.
 *
 * The headless createRadio owns the checked machine (controlled or not,
 * disabled gate, never-uncheck-itself). Inside a RadioGroup the value
 * flows through the group's shared selection store (maxSelect: 1 — the
 * same machine Checkbox.Group uses with unlimited cardinality); standalone
 * usage rides the per-radio machine directly.
 */
const Radio: Component<RadioProps> = providedProps => {
  const rawProps = useComponentProps('Radio', providedProps)
  const props = merge({}, rawProps)
  const group = useRadioGroupContext()

  const form = useFormItem({
    get value() { return props.checked },
    get onChange() { return props.onChange },
    get disabled() { return props.disabled },
    get id() { return props.id },
    get size() { return undefined },
    get status() { return undefined },
  })

  const inGroup = () =>
    !!group && props.skipGroup !== true && props.value !== undefined

  const isGroupDisabled = () => group?.isDisabled(props.value as string | number) ?? false
  const groupChecked = () => group?.isSelected(props.value as string | number) ?? false

  const machine = createMemo(() => createRadio({
    get checked() { return inGroup() ? groupChecked() : (form.value() as boolean | undefined) },
    get defaultChecked() { return props.defaultChecked },
    get disabled() { return providedProps.disabled ?? (inGroup() ? isGroupDisabled() : undefined) ?? props.disabled },
  }))

  const checked = () => machine().checked()
  const disabled = () => machine().isDisabled()

  const inputRef: { current?: HTMLInputElement } = {}
  const setRef = (el: HTMLInputElement) => {
    inputRef.current = el
    props.ref?.(el)
  }

  const handleChange = (e: Event) => {
    // Radio inputs only fire change when turning ON — the never-uncheck
    // semantics live in the browser already.
    if (inGroup()) {
      group?.select(props.value as string | number)
      return
    }
    machine().check(e)
    form.onChange(true, e)
  }

  return (
    <label
      class={twMerge(
        radioWrapperClass({ disabled: disabled() }),
        props.class,
      )}
      style={props.style}
    >
      <span
        class={radioDotClass({
          checked: checked(),
          disabled: disabled(),
        })}
      >
        <span class={radioInnerDotWrapClass({ visible: checked(), disabled: disabled() })} />
      </span>
      <input
        ref={setRef}
        type="radio"
        class={radioInputClass()}
        id={form.id()}
        name={props.name ?? group?.name}
        value={props.value}
        checked={checked()}
        disabled={disabled()}
        aria-checked={checked() ? 'true' : 'false'}
        onChange={handleChange}
      />
      <Show when={props.children !== undefined}>
        <span class={radioLabelWrapClass({ disabled: disabled() })}>
          {props.children}
        </span>
      </Show>
    </label>
  )
}

export interface RadioGroupProps {
  /** Controlled selected value (single key). */
  value?: string | number
  defaultValue?: string | number
  options?: RadioOption[]
  disabled?: boolean
  name?: string
  /** Render options as the joined button strip (optionType="button"). */
  optionType?: 'default' | 'button'
  class?: string
  style?: JSX.CSSProperties
  children?: JSX.Element
  onChange?: (value: string | number) => void
}

/**
 * RadioGroup — renders a radio per option and owns the single pick.
 * The headless createRadioGroup rides the SHARED selection store
 * (maxSelect: 1) — the same engine Checkbox.Group and a future Select
 * compose, so pick-one bookkeeping lives in exactly one place.
 */
export const RadioGroup: Component<RadioGroupProps> = providedProps => {
  const rawProps = useComponentProps('RadioGroup', providedProps)
  const props = merge({ optionType: 'default' as const }, rawProps)

  const form = useFormItem({
    get value() { return props.value },
    get onChange() { return props.onChange },
    get disabled() { return props.disabled },
    get id() { return undefined },
    get size() { return undefined },
    get status() { return undefined },
  })

  const machine = createMemo(() => createRadioGroup({
    get value() { return form.value() as string | number | undefined },
    get defaultValue() { return props.defaultValue },
    get options() { return props.options },
    get disabled() { return props.disabled },
    get onChange() { return props.onChange },
  }))

  const ctx: RadioGroupContextValue = {
    isSelected: v => machine().isSelected(v),
    isDisabled: v => machine().isDisabled(v),
    select: v => machine().select(v),
    name: props.name,
  }

  const buttonPosition = (index: number, total: number): 'first' | 'middle' | 'last' => {
    if (index === 0 && total === 1) return 'first'
    if (index === 0) return 'first'
    if (index === total - 1) return 'last'
    return 'middle'
  }

  return (
    <RadioGroupContext value={ctx}>
      <Show
        when={props.optionType === 'button'}
        fallback={
          <div class={radioGroupClass(props.class)} style={props.style} role="radiogroup">
            <For each={machine().options()}>
              {option => (
                <Radio value={option.value} disabled={option.disabled}>
                  {option.label}
                </Radio>
              )}
            </For>
            {props.children}
          </div>
        }
      >
        <div class={radioButtonGroupClass(props.class)} style={props.style} role="radiogroup">
          <For each={machine().options()}>
            {(option, i) => (
              <RadioButton
                value={option.value}
                disabled={option.disabled}
                position={buttonPosition(i(), machine().options().length)}
              >
                {option.label}
              </RadioButton>
            )}
          </For>
        </div>
      </Show>
    </RadioGroupContext>
  )
}

// ---------------------------------------------------------------------------
// Radio.Button — the joined strip variant. Lives in the same group context;
// only the paint differs.
// ---------------------------------------------------------------------------

export interface RadioButtonProps {
  value: string | number
  disabled?: boolean
  /** Corner rounding position in the strip (computed by the group). */
  position?: 'first' | 'middle' | 'last'
  class?: string
  style?: JSX.CSSProperties
  children?: JSX.Element
  onChange?: (checked: boolean, event?: Event) => void
}

const RadioButton: Component<RadioButtonProps> = providedProps => {
  const rawProps = useComponentProps('RadioButton', providedProps)
  const props = merge({ position: 'middle' as const }, rawProps)
  const group = useRadioGroupContext()

  const form = useFormItem({
    get value() { return undefined },
    get onChange() { return props.onChange },
    get disabled() { return props.disabled },
    get id() { return undefined },
    get size() { return undefined },
    get status() { return undefined },
  })

  const checked = () => group?.isSelected(props.value) ?? false
  const disabled = () =>
    providedProps.disabled ?? group?.isDisabled(props.value) ?? props.disabled ?? false

  const handleChange = (e: Event) => {
    group?.select(props.value)
    form.onChange(true, e)
  }

  return (
    <label
      class={twMerge(
        radioButtonClass({
          checked: checked(),
          disabled: disabled(),
          position: props.position,
        }),
        props.class,
      )}
      style={props.style}
    >
      <input
        type="radio"
        class={radioButtonInputClass()}
        name={group?.name}
        value={props.value}
        checked={checked()}
        disabled={disabled()}
        onChange={handleChange}
      />
      <span class="relative z-[0]">{props.children}</span>
    </label>
  )
}

// ---------------------------------------------------------------------------
// Group context — Radio reads it to know membership/disabled; the group
// routes picks through the headless machine. Solid 2 requires a context
// default; null = standalone radio.
// ---------------------------------------------------------------------------
import { createContext, useContext } from 'solid-js'

export type RadioGroupContextValue = {
  isSelected: (value: string | number) => boolean
  isDisabled: (value: string | number) => boolean
  select: (value: string | number) => void
  /** Shared native input name so browser arrow-key radio nav works. */
  name?: string
}

export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null)

export const useRadioGroupContext = () => useContext(RadioGroupContext)

export default Radio
