import { createMemo, createSignal, untrack } from "solid-js";

/**
 * Headless logic for Switch — the rc-switch state core:
 *
 *  - CHECKED: controlled-or-uncontrolled boolean (checked wins over
 *    defaultChecked; `value`/`defaultValue` are aliases, antd 5.12+).
 *  - TOGGLE GATE: loading and disabled both block toggling (loading renders
 *    a spinner but keeps the visual checked state).
 *  - CHANGE: onChange fires ONLY on user intent (toggle/click), never on
 *    controlled prop flips — rc-switch semantics.
 */
import type { FormFieldRule } from "./formField";

export type SwitchConfig = {
  /** Controlled checked; undefined = uncontrolled. */
  checked?: boolean
  defaultChecked?: boolean
  /** Alias of checked (antd 5.12+). */
  value?: boolean
  /** Alias of defaultChecked. */
  defaultValue?: boolean
  disabled?: boolean
  /** Blocks toggling while showing a spinner. */
  loading?: boolean
  onChange?: (checked: boolean, event?: Event) => void
  onClick?: (checked: boolean, event?: Event) => void
  /** Form integration: rules for the enclosing Item. */
  rules?: FormFieldRule[]
}

export type SwitchIns = {
  /** Effective checked state (controlled value wins). */
  checked: () => boolean
  /** Toggle with the loading/disabled gate; fires onChange on success. */
  toggle: (event?: Event) => void
  setChecked: (checked: boolean, event?: Event) => void
  isDisabled: () => boolean
  isLoading: () => boolean
  /** True when toggling is blocked by either gate. */
  isBlocked: () => boolean
}

export const createSwitch = (config: SwitchConfig = {}): SwitchIns => {
  // ownedWrite: toggle fires from DOM click events — imperative entry
  // points outside any reactive owner.
  const [_checked, _setChecked] = createSignal(
    untrack(() => config.defaultChecked ?? config.defaultValue ?? false),
    { ownedWrite: true },
  )

  const checked = createMemo(() =>
    config.checked ?? config.value ?? _checked(),
  )

  const isDisabled = () => !!config.disabled
  const isLoading = () => !!config.loading
  const isBlocked = () => isDisabled() || isLoading()

  const setChecked = (next: boolean, event?: Event) => {
    if (next === checked()) return
    if (isBlocked()) return
    if (config.checked === undefined && config.value === undefined) {
      _setChecked(next)
    }
    config.onChange?.(next, event)
  }

  const toggle = (event?: Event) => {
    const next = !checked()
    config.onClick?.(next, event)
    if (isBlocked()) return
    setChecked(next, event)
  }

  return {
    checked,
    toggle,
    setChecked,
    isDisabled,
    isLoading,
    isBlocked,
  }
}

export const switchSplits: (keyof SwitchConfig)[] = [
  'checked', 'value', 'defaultChecked', 'defaultValue', 'disabled', 'loading',
]
