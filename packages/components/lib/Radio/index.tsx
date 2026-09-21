import { useComponentProps } from '../ConfigProvider/context'
import { Component, For, Show, createUniqueId, merge, onCleanup, untrack } from 'solid-js'
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
 * flows through the group's shared selection store (maxSelect: 1); standalone
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

  const machine = createRadio({
    get checked() { return inGroup() ? groupChecked() : (form.value() as boolean | undefined) },
    get defaultChecked() { return props.defaultChecked },
    get disabled() { return inGroup() ? isGroupDisabled() || !!props.disabled : !!form.disabled() },
    onChange: (next, event) => form.onChange(next, event),
  })

  const checked = () => machine.checked()
  const disabled = () => machine.isDisabled()

  const inputRef: { current?: HTMLInputElement } = {}
  let unregisterInput: (() => void) | undefined
  onCleanup(() => unregisterInput?.())
  const setRef = (el: HTMLInputElement) => {
    inputRef.current = el
    untrack(() => props.ref?.(el))
    unregisterInput = group?.registerInput?.(el, () => inGroup() ? checked() : undefined)
  }

  const handleChange = (e: Event) => {
    const input = e.currentTarget as HTMLInputElement
    try {
      if (input.checked && !disabled() && !checked()) {
        if (inGroup()) {
          group?.select(props.value as string | number)
          props.onChange?.(true, e)
        } else machine.check(e)
      }
    } finally {
      input.checked = checked()
      if (inGroup()) group?.syncInputs?.()
    }
  }

  return (
    <label
      class={twMerge(
        radioWrapperClass({ disabled: disabled() }),
        props.class,
      )}
      style={props.style}
    >
      <input
        ref={setRef}
        type="radio"
        class={radioInputClass()}
        id={inGroup() ? props.id : form.id()}
        name={props.name ?? (inGroup() ? group?.name : undefined)}
        value={props.value}
        checked={checked()}
        disabled={disabled()}
        aria-checked={checked() ? 'true' : 'false'}
        onChange={handleChange}
      />
      <span
        aria-hidden="true"
        class={radioDotClass({
          checked: checked(),
          disabled: disabled(),
        })}
      >
        <span class={radioInnerDotWrapClass({ visible: checked(), disabled: disabled() })} />
      </span>
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
 * (maxSelect: 1). Native inputs share a name for browser keyboard navigation.
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

  const machine = createRadioGroup({
    get value() { return form.value() as string | number | undefined },
    get defaultValue() { return props.defaultValue },
    get options() { return props.options },
    get disabled() { return form.disabled() },
    onChange: next => props.onChange ? props.onChange(next) : form.onChange(next),
  })

  const generatedName = `radio-${createUniqueId()}`
  const inputs = new Map<HTMLInputElement, () => boolean | undefined>()
  onCleanup(() => inputs.clear())
  const ctx: RadioGroupContextValue = {
    isSelected: v => machine.isSelected(v),
    isDisabled: v => machine.isDisabled(v),
    select: v => machine.select(v),
    get name() { return props.name ?? generatedName },
    registerInput: (input, checked) => {
      inputs.set(input, checked)
      return () => inputs.delete(input)
    },
    syncInputs: () => {
      const states = [...inputs].map(([input, checked]) => ({ input, checked: checked() }))
      // Native activation unchecks the previous sibling without firing its
      // change event. Restore the entire owned group after a rejected intent.
      for (const state of states) if (state.checked !== undefined) state.input.checked = false
      for (const state of states) if (state.checked) state.input.checked = true
    },
  }

  const buttonPosition = (index: number, total: number): 'first' | 'middle' | 'last' | 'single' => {
    if (index === 0 && total === 1) return 'single'
    if (index === 0) return 'first'
    if (index === total - 1) return 'last'
    return 'middle'
  }

  return (
    <RadioGroupContext value={ctx}>
      <Show
        when={props.optionType === 'button'}
        fallback={
          <div class={radioGroupClass(props.class)} style={props.style} role="radiogroup" id={form.id()}>
            <For each={machine.options()}>
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
        <div class={radioButtonGroupClass(props.class)} style={props.style} role="radiogroup" id={form.id()}>
          <For each={machine.options()}>
            {(option, i) => (
              <RadioButton
                value={option.value}
                disabled={option.disabled}
                position={buttonPosition(i(), machine.options().length)}
              >
                {option.label}
              </RadioButton>
            )}
          </For>
          {props.children}
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
  position?: 'first' | 'middle' | 'last' | 'single'
  class?: string
  style?: JSX.CSSProperties
  children?: JSX.Element
  onChange?: (checked: boolean, event?: Event) => void
}

export const RadioButton: Component<RadioButtonProps> = providedProps => {
  const rawProps = useComponentProps('RadioButton', providedProps)
  const props = merge({ position: 'middle' as const }, rawProps)
  const group = useRadioGroupContext()

  const machine = createRadio({
    get checked() { return group?.isSelected(props.value) },
    get disabled() { return !!props.disabled || (group?.isDisabled(props.value) ?? false) },
    onChange: (next, event) => props.onChange?.(next, event),
  })
  const checked = machine.checked
  const disabled = machine.isDisabled
  let unregisterInput: (() => void) | undefined
  onCleanup(() => unregisterInput?.())
  const setRef = (input: HTMLInputElement) => {
    unregisterInput = group?.registerInput?.(input, checked)
  }
  const handleChange = (e: Event) => {
    const input = e.currentTarget as HTMLInputElement
    try {
      if (input.checked && !disabled() && !checked()) {
        if (group) {
          group.select(props.value)
          props.onChange?.(true, e)
        } else machine.check(e)
      }
    } finally {
      input.checked = checked()
      group?.syncInputs?.()
    }
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
        ref={setRef}
        type="radio"
        class={radioButtonInputClass()}
        name={group?.name}
        value={props.value}
        checked={checked()}
        disabled={disabled()}
        aria-checked={checked() ? 'true' : 'false'}
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
  registerInput?: (input: HTMLInputElement, checked: () => boolean | undefined) => () => void
  syncInputs?: () => void
}

export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null)

export const useRadioGroupContext = () => useContext(RadioGroupContext)

export default Radio
