import { createMemo, createSignal, untrack } from "solid-js";

/**
 * Headless logic for Radio — the rc-radio state core.
 *
 *  - CHECKED: controlled-or-uncontrolled. A radio is "checked" when its
 *    value equals the group's (or its own standalone) selection.
 *  - REPLACE SEMANTICS: unlike a checkbox, checking a radio never unchecks
 *    ITSELF — clicking the checked radio is a no-op (unless the group
 *    allows deselect, antd's RadioButton stays; plain radio too).
 *  - GROUP: createRadioGroup rides on the shared createSelection store
 *    with maxSelect: 1 — the same machine Checkbox.Group uses with
 *    unlimited cardinality, and the one a future Select reuses for both
 *    modes. This keeps single-pick bookkeeping in ONE place.
 */
import { createSelection, type SelectionIns, type SelectionOption } from "./selection";
import type { FormFieldRule } from "./formField";

export type RadioConfig = {
  /** Controlled checked; undefined = uncontrolled. */
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  /** Skip the enclosing RadioGroup (render standalone). */
  skipGroup?: boolean
  onChange?: (checked: boolean, event?: Event) => void
  /** Form integration: rules for the enclosing Item. */
  rules?: FormFieldRule[]
}

export type RadioIns = {
  checked: () => boolean
  /** Check (never unchecks itself — radio semantics). */
  check: (event?: Event) => void
  setChecked: (checked: boolean, event?: Event) => void
  isDisabled: () => boolean
}

export const createRadio = (config: RadioConfig = {}): RadioIns => {
  // ownedWrite: check fires from DOM click events — imperative entry
  // points outside any reactive owner.
  const [_checked, _setChecked] = createSignal(
    untrack(() => config.defaultChecked ?? false),
    { ownedWrite: true },
  )

  const checked = createMemo(() =>
    config.checked !== undefined ? config.checked : _checked(),
  )

  const isDisabled = () => !!config.disabled

  const setChecked = (next: boolean, event?: Event) => {
    if (next === checked()) return
    // A radio NEVER unchecks itself — setChecked(false) is a no-op.
    if (!next) return
    if (isDisabled()) return
    if (config.checked === undefined) {
      _setChecked(true)
    }
    config.onChange?.(true, event)
  }

  const check = (event?: Event) => {
    setChecked(true, event)
  }

  return {
    checked,
    check,
    setChecked,
    isDisabled,
  }
}

export type RadioOption = SelectionOption

export type RadioGroupConfig = {
  /** Controlled selected value (single key, antd API shape); undefined = uncontrolled. */
  value?: string | number
  defaultValue?: string | number
  options?: RadioOption[]
  disabled?: boolean
  /** Group-level change with the new single value (antd onRadioChange). */
  onChange?: (value: string | number) => void
  /** Form integration: rules for the enclosing Item. */
  rules?: FormFieldRule[]
  /** Escape hatch for advanced consumers (Select): raw array events. */
  onSelectionChange?: (value: Array<string | number>) => void
}

export type RadioGroupIns = {
  /** The selected key (or undefined when nothing is picked). */
  value: () => string | number | undefined
  isSelected: (value: string | number) => boolean
  isDisabled: (value: string | number) => boolean
  /** Pick a key (replaces the previous one); disabled keys are ignored. */
  select: (value: string | number) => void
  /** Clear the selection (group-level reset). */
  clear: () => void
  options: () => RadioOption[]
  /** The underlying shared store — a future Select composes this directly. */
  store: () => SelectionIns
}

export const createRadioGroup = (config: RadioGroupConfig = {}): RadioGroupIns => {
  // The group IS a maxSelect:1 selection store. `value`/`defaultValue`
  // (antd's single-key API) map onto the store's array shape.
  const store = createSelection({
    value: () => (config.value !== undefined ? [config.value] : undefined),
    defaultValue: untrack(() => config.defaultValue !== undefined ? [config.defaultValue] : undefined),
    get options() { return config.options },
    get disabled() { return config.disabled },
    maxSelect: 1,
    // Plain radio: clicking the checked radio does nothing.
    allowDeselect: false,
    onChange: next => {
      const single = next[0]
      if (single !== undefined) config.onChange?.(single)
      config.onSelectionChange?.(next)
    },
  })

  const value = createMemo<string | number | undefined>(() => store.value()[0])

  return {
    value,
    isSelected: store.isSelected,
    isDisabled: store.isDisabled,
    select: v => { store.select(v) },
    clear: () => { if (!config.disabled) store.clear() },
    options: store.options,
    store: () => store,
  }
}

export const radioSplits: (keyof RadioConfig)[] = [
  'checked', 'defaultChecked', 'disabled', 'skipGroup',
]

export const radioGroupSplits: (keyof RadioGroupConfig)[] = [
  'value', 'defaultValue', 'options', 'disabled',
]
