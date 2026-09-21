import { useComponentProps } from '../ConfigProvider/context'
import { Component, For, Show, createEffect, merge, untrack } from 'solid-js'
import { type JSX } from '@solidjs/web'
import { twMerge } from 'tailwind-merge'
import {
  type CheckboxOption,
  createCheckbox,
  createCheckboxGroup,
} from 'upthrust-competence'
import { useFormItem } from '../Input/context'
import {
  checkboxBoxClass,
  checkboxCheckWrapClass,
  checkboxDashWrapClass,
  checkboxGroupClass,
  checkboxInputClass,
  checkboxLabelWrapClass,
  checkboxWrapperClass,
} from './styles'

export type { CheckboxOption }

export interface CheckboxProps {
  /** Controlled checked. */
  checked?: boolean
  defaultChecked?: boolean
  /** Presentational dash (never part of the checked arithmetic). */
  indeterminate?: boolean
  disabled?: boolean
  /** Render standalone even inside a CheckboxGroup. */
  skipGroup?: boolean
  id?: string
  name?: string
  value?: string | number
  class?: string
  style?: JSX.CSSProperties
  children?: JSX.Element
  onChange?: (checked: boolean, event?: Event) => void
  ref?: (el: HTMLInputElement) => void
}

/**
 * Checkbox — the antd-style boolean picker.
 *
 * The headless createCheckbox owns the checked machine (controlled or not,
 * disabled gate, indeterminate as presentation only). The native input is
 * kept in the DOM (opacity-0) so keyboard focus and screen readers work;
 * the visual box is a sibling that reads the input's :checked via peer
 * classes where possible and the machine state otherwise.
 *
 * Inside a CheckboxGroup the props (checked/disabled/onChange) are wired
 * by the group through context — standalone usage falls back to the
 * machine directly.
 */
const Checkbox: Component<CheckboxProps> = providedProps => {
  const rawProps = useComponentProps('Checkbox', providedProps)
  const props = merge({}, rawProps)
  const group = useCheckboxGroupContext()

  // Form.Item integration — explicit props win, context fills the rest (the
  // same contract as Input). A standalone checkbox has no surrounding Item.
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
  const groupChecked = () => group?.isChecked(props.value as string | number) ?? false

  const machine = createCheckbox({
    get checked() { return inGroup() ? groupChecked() : (form.value() as boolean | undefined) },
    get defaultChecked() { return props.defaultChecked },
    get indeterminate() { return props.indeterminate },
    get disabled() { return inGroup() ? isGroupDisabled() || !!props.disabled : !!form.disabled() },
    onChange: (next, event) => form.onChange(next, event),
  })

  const checked = () => machine.checked()
  const disabled = () => machine.isDisabled()
  const indeterminate = () => machine.indeterminate()

  const inputRef: { current?: HTMLInputElement } = {}
  const setRef = (el: HTMLInputElement) => {
    inputRef.current = el
    untrack(() => props.ref?.(el))
  }

  createEffect(indeterminate, mixed => {
    if (inputRef.current) inputRef.current.indeterminate = mixed
  })

  const handleChange = (e: Event) => {
    const input = e.currentTarget as HTMLInputElement
    const next = input.checked
    try {
      if (!disabled() && next !== checked()) {
        if (inGroup()) {
          group?.toggleValue(props.value as string | number)
          props.onChange?.(next, e)
        } else {
          machine.setChecked(next, e)
        }
      }
    } finally {
      // Native activation changes these properties even when a controlled
      // parent rejects the proposed update (or when mixed remains true).
      input.checked = checked()
      input.indeterminate = indeterminate()
    }
  }

  return (
    <label
      class={twMerge(
        checkboxWrapperClass({ disabled: disabled() }),
        props.class,
      )}
      style={props.style}
    >
      <input
        ref={setRef}
        type="checkbox"
        class={checkboxInputClass()}
        id={inGroup() ? props.id : form.id()}
        name={props.name ?? (inGroup() ? group?.name?.() : undefined)}
        value={props.value}
        checked={checked()}
        disabled={disabled()}
        aria-checked={indeterminate() ? 'mixed' : checked() ? 'true' : 'false'}
        onChange={handleChange}
      />
      <span
        aria-hidden="true"
        class={checkboxBoxClass({
          checked: checked() && !indeterminate(),
          indeterminate: indeterminate(),
          disabled: disabled(),
          checkedHover: checked() && !indeterminate() && !disabled(),
        })}
      >
        <Show when={indeterminate()}>
          <span class={checkboxDashWrapClass({ visible: true, disabled: disabled() })} />
        </Show>
        <Show when={!indeterminate()}>
          <span class={checkboxCheckWrapClass({ visible: checked(), disabled: disabled() })} />
        </Show>
      </span>

      <Show when={props.children !== undefined}>
        <span class={checkboxLabelWrapClass({ disabled: disabled() })}>
          {props.children}
        </span>
      </Show>
    </label>
  )
}

export interface CheckboxGroupProps {
  /** Controlled value array. */
  value?: Array<string | number>
  defaultValue?: Array<string | number>
  options?: CheckboxOption[]
  disabled?: boolean
  name?: string
  class?: string
  style?: JSX.CSSProperties
  children?: JSX.Element
  onChange?: (value: Array<string | number>) => void
}

/**
 * CheckboxGroup — renders a checkbox per option and manages the value
 * array. A surrounding Form.Item supplies the array value and change
 * handler through the shared field context.
 */
export const CheckboxGroup: Component<CheckboxGroupProps> = providedProps => {
  const rawProps = useComponentProps('CheckboxGroup', providedProps)
  const props = merge({}, rawProps)

  const form = useFormItem({
    get value() { return props.value },
    get onChange() { return props.onChange },
    get disabled() { return props.disabled },
    get id() { return undefined },
    get size() { return undefined },
    get status() { return undefined },
  })

  const machine = createCheckboxGroup({
    get value() { return form.value() as Array<string | number> | undefined },
    get defaultValue() { return props.defaultValue },
    get options() { return props.options },
    get disabled() { return form.disabled() },
    onChange: next => props.onChange ? props.onChange(next) : form.onChange(next),
  })

  const ctx: CheckboxGroupContextValue = {
    name: () => props.name,
    isChecked: v => machine.isChecked(v),
    isDisabled: v => machine.isDisabled(v),
    toggleValue: v => machine.toggleValue(v),
  }

  return (
    <CheckboxGroupContext value={ctx}>
      <div
        class={checkboxGroupClass(props.class)}
        style={props.style}
        role="group"
        id={form.id()}
      >
        <For each={machine.options()}>
          {option => (
            <Checkbox
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </Checkbox>
          )}
        </For>
        {props.children}
      </div>
    </CheckboxGroupContext>
  )
}

// ---------------------------------------------------------------------------
// Group context — Checkbox reads it to know membership/disabled; the group
// toggles through the headless machine. Plain module-level context (Solid 2
// requires a default; null = standalone checkbox).
// ---------------------------------------------------------------------------
import { createContext, useContext } from 'solid-js'

export type CheckboxGroupContextValue = {
  name?: () => string | undefined
  isChecked: (value: string | number) => boolean
  isDisabled: (value: string | number) => boolean
  toggleValue: (value: string | number) => void
}

export const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(null)

export const useCheckboxGroupContext = () => useContext(CheckboxGroupContext)

export default Checkbox
