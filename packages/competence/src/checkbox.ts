import { createMemo, createSignal } from "solid-js";

/**
 * Headless logic for Checkbox — the rc-checkbox state core:
 *
 *  - CHECKED: controlled-or-uncontrolled boolean. `indeterminate` is a
 *    PRESENTATIONAL flag only (the dash box): it never participates in
 *    the checked arithmetic — rc-checkbox parity.
 *  - TOGGLE GATE: disabled blocks toggling.
 *  - GROUP: createCheckboxGroup manages a value array (all/none/partial
 *    selection) with controlled-or-uncontrolled state. Options may be
 *    disabled individually; registerMap lets the group consult live
 *    disabled states of registered checkboxes (skipGroup children opt out).
 */
import type { FormFieldRule } from "./formField";

export type CheckboxConfig = {
  /** Controlled checked; undefined = uncontrolled. */
  checked?: boolean
  defaultChecked?: boolean
  /** Presentational dash; never part of the checked arithmetic. */
  indeterminate?: boolean
  disabled?: boolean
  /** Skip the enclosing CheckboxGroup (render standalone). */
  skipGroup?: boolean
  onChange?: (checked: boolean, event?: Event) => void
  /** Form integration: rules for the enclosing Item. */
  rules?: FormFieldRule[]
}

export type CheckboxIns = {
  checked: () => boolean
  /** Visual state: indeterminate wins over checked for the dash box. */
  indeterminate: () => boolean
  toggle: (event?: Event) => void
  setChecked: (checked: boolean, event?: Event) => void
  isDisabled: () => boolean
}

export const createCheckbox = (config: CheckboxConfig = {}): CheckboxIns => {
  // ownedWrite: toggle fires from DOM click events — imperative entry
  // points outside any reactive owner.
  const [_checked, _setChecked] = createSignal(
    config.defaultChecked ?? false,
    { ownedWrite: true },
  )

  const checked = createMemo(() =>
    config.checked !== undefined ? config.checked : _checked(),
  )

  const isDisabled = () => !!config.disabled

  const setChecked = (next: boolean, event?: Event) => {
    if (next === checked()) return
    if (isDisabled()) return
    if (config.checked === undefined) {
      _setChecked(next)
    }
    config.onChange?.(next, event)
  }

  const toggle = (event?: Event) => {
    setChecked(!checked(), event)
  }

  return {
    checked,
    indeterminate: () => !!config.indeterminate,
    toggle,
    setChecked,
    isDisabled,
  }
}

export type CheckboxOption = {
  label: string
  value: string | number
  disabled?: boolean
}

export type CheckboxGroupConfig = {
  /** Controlled value array; undefined = uncontrolled. */
  value?: Array<string | number>
  defaultValue?: Array<string | number>
  options?: CheckboxOption[]
  disabled?: boolean
  onChange?: (value: Array<string | number>) => void
  /** Form integration: rules for the enclosing Item. */
  rules?: FormFieldRule[]
}

export type CheckboxGroupIns = {
  value: () => Array<string | number>
  /** Toggle one option's membership. */
  toggleValue: (value: string | number) => void
  /** Check every ENABLED option (individual disabled options untouched). */
  checkAll: () => void
  /** Uncheck everything. */
  clearAll: () => void
  isChecked: (value: string | number) => boolean
  isDisabled: (value: string | number) => boolean
  /** All enabled options checked? (group indeterminate = partial) */
  isAllChecked: () => boolean
  isIndeterminate: () => boolean
  options: () => CheckboxOption[]
}

export const createCheckboxGroup = (config: CheckboxGroupConfig = {}): CheckboxGroupIns => {
  const [_value, _setValue] = createSignal<Array<string | number>>(
    config.defaultValue ?? [],
    { ownedWrite: true },
  )

  const value = createMemo<Array<string | number>>(() =>
    config.value !== undefined ? config.value : _value(),
  )

  const options = () => config.options ?? []

  const isOptionDisabled = (v: string | number) => {
    if (config.disabled) return true
    return options().some(o => o.value === v && o.disabled)
  }

  const isChecked = (v: string | number) => value().includes(v)

  const emit = (next: Array<string | number>) => {
    if (config.value === undefined) {
      _setValue(next)
    }
    config.onChange?.(next)
  }

  const toggleValue = (v: string | number) => {
    if (isOptionDisabled(v)) return
    const cur = value()
    emit(cur.includes(v) ? cur.filter(x => x !== v) : [...cur, v])
  }

  const enabledValues = () => options().filter(o => !o.disabled).map(o => o.value)

  const checkAll = () => {
    // Keep individually disabled options' current membership untouched.
    const disabledChecked = value().filter(v => isOptionDisabled(v))
    emit([...disabledChecked, ...enabledValues()])
  }

  const clearAll = () => {
    const disabledChecked = value().filter(v => isOptionDisabled(v))
    emit(disabledChecked)
  }

  const isAllChecked = createMemo(() => {
    const enabled = enabledValues()
    if (!enabled.length) return false
    return enabled.every(v => value().includes(v))
  })

  const isIndeterminate = createMemo(() =>
    !isAllChecked() && value().some(v => enabledValues().includes(v)),
  )

  return {
    value,
    toggleValue,
    checkAll,
    clearAll,
    isChecked,
    isDisabled: isOptionDisabled,
    isAllChecked,
    isIndeterminate,
    options,
  }
}

export const checkboxSplits: (keyof CheckboxConfig)[] = [
  'checked', 'defaultChecked', 'indeterminate', 'disabled', 'skipGroup',
]

export const checkboxGroupSplits: (keyof CheckboxGroupConfig)[] = [
  'value', 'defaultValue', 'options', 'disabled',
]
