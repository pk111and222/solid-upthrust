import { useComponentProps } from '../ConfigProvider/context'
import { Component, For, Show, createMemo, merge } from 'solid-js'
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

  const machine = createMemo(() => createCheckbox({
    get checked() { return inGroup() ? groupChecked() : (form.value() as boolean | undefined) },
    get defaultChecked() { return props.defaultChecked },
    get indeterminate() { return props.indeterminate },
    get disabled() { return providedProps.disabled ?? (inGroup() ? isGroupDisabled() : undefined) ?? props.disabled },
  }))

  const checked = () => machine().checked()
  const disabled = () => machine().isDisabled()
  const indeterminate = () => machine().indeterminate()

  const inputRef: { current?: HTMLInputElement } = {}
  const setRef = (el: HTMLInputElement) => {
    inputRef.current = el
    props.ref?.(el)
  }

  const handleChange = (e: Event) => {
    const next = (e.target as HTMLInputElement).checked
    if (inGroup()) {
      group?.toggleValue(props.value as string | number)
      return
    }
    machine().setChecked(next, e)
    // form.onChange routes through the Item (store write + validation);
    // falls back to props.onChange for standalone usage.
    form.onChange(next, e)
  }

  return (
    <label
      class={twMerge(
        checkboxWrapperClass({ disabled: disabled() }),
        props.class,
      )}
      style={props.style}
    >
      <span
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
          <span class={checkboxCheckWrapClass({ visible: checked() })} />
        </Show>
      </span>
      <input
        ref={setRef}
        type="checkbox"
        class={checkboxInputClass()}
        id={form.id()}
        name={props.name}
        value={props.value}
        checked={checked()}
        disabled={disabled()}
        aria-checked={indeterminate() ? 'mixed' : checked() ? 'true' : 'false'}
        onChange={handleChange}
      />
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
 * array. Standalone usage only (a Form.Item wraps this component and
 * receives the array value through the standard context contract).
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

  const machine = createMemo(() => createCheckboxGroup({
    get value() { return form.value() as Array<string | number> | undefined },
    get defaultValue() { return props.defaultValue },
    get options() { return props.options },
    get disabled() { return props.disabled },
    get onChange() { return form.onChange },
  }))

  const ctx: CheckboxGroupContextValue = {
    isChecked: v => machine().isChecked(v),
    isDisabled: v => machine().isDisabled(v),
    toggleValue: v => machine().toggleValue(v),
  }

  return (
    <CheckboxGroupContext value={ctx}>
      <div
        class={checkboxGroupClass(props.class)}
        style={props.style}
        role="group"
      >
        <For each={machine().options()}>
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
  isChecked: (value: string | number) => boolean
  isDisabled: (value: string | number) => boolean
  toggleValue: (value: string | number) => void
}

export const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(null)

export const useCheckboxGroupContext = () => useContext(CheckboxGroupContext)

export default Checkbox
