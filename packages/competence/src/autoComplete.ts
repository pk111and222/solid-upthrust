import { createMemo, createSignal, untrack } from "solid-js";

/**
 * Headless logic for AutoComplete — the rc-select/autoComplete core.
 *
 * ARCHITECTURE: AutoComplete is a TEXT input with a suggestions dropdown —
 * the narrowest sibling in the selection family. It does NOT pick options
 * into a selection store (the value is free text); it only needs:
 *
 *   - a TEXT BUFFER (with IME composition gating — antd/rc behavior:
 *     composition keystrokes don't commit, compositionEnd does);
 *   - SUGGESTIONS: derived from `options` + `filterOption` (input, option)
 *     => boolean; default substring match. A plain getter may instead
 *     supply server-driven suggestions (antd: suggestions are whatever you
 *     pass when the input changes);
 *   - ACTIVE suggestion: the keyboard-highlighted row (arrows/Enter/Escape
 *     — the same contract as Select's active option, minus the store).
 *
 * What selecting a suggestion MEANS is caller-defined: by default the
 * label replaces the text and onChange(label) fires; `onSelect(value,
 * option)` also fires for richer wiring. Backspace on the empty input
 * reports onChange('') — antd's clear-by-edit semantics.
 */
import type { FormFieldRule } from "./formField";

export type AutoCompleteOption = {
  value: string
  label?: string
  disabled?: boolean
  [key: string]: unknown
}

export type AutoCompleteConfig = {
  /** Controlled text value. */
  value?: string
  defaultValue?: string
  /** The full suggestion pool (client-filtered) — or the current server-driven list. */
  options?: AutoCompleteOption[]
  disabled?: boolean
  /** (input, option) => boolean; false disables client filtering. Default: substring on value/label. */
  filterOption?: ((input: string, option: AutoCompleteOption) => boolean) | false
  /** Controlled dropdown open (composed with the UI's trigger). */
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onChange?: (value: string) => void
  onSelect?: (value: string, option: AutoCompleteOption) => void
  onSearch?: (value: string) => void
  onBlur?: () => void
  onFocus?: () => void
  /** Form integration: rules for the enclosing Item. */
  rules?: FormFieldRule[]
}

export type AutoCompleteIns = {
  /** The effective text (controlled wins). */
  value: () => string
  /** Replace the buffer (typing); fires onChange + onSearch. */
  setInputText: (text: string) => void
  /** The filtered suggestion list for the current input. */
  suggestions: () => AutoCompleteOption[]
  /** True while an IME composition is in progress (input events ignored). */
  isComposing: () => boolean
  notifyCompositionStart: () => void
  /** compositionEnd commits the pending text once (antd semantics). */
  notifyCompositionEnd: () => void
  /** The active (keyboard-highlighted) suggestion value. */
  activeValue: () => string | undefined
  moveActive: (delta: number) => void
  setActiveValue: (value: string) => void
  resetActive: () => void
  /** Commit the active suggestion (Enter): replaces the text. */
  commitActive: () => void
  /** Select a suggestion by click: replaces the text + fires onSelect. */
  selectOption: (option: AutoCompleteOption) => void
  /** Open state (the UI trigger owns the DOM; this mirrors for search reset). */
  isOpen: () => boolean
  setOpen: (open: boolean) => void
  notifyFocus: () => void
  notifyBlur: () => void
  isDisabled: () => boolean
}

const defaultFilter = (input: string, option: AutoCompleteOption): boolean => {
  const q = input.toLowerCase()
  const haystack = (option.value + ' ' + (option.label ?? '')).toLowerCase()
  return haystack.includes(q)
}

const displayOf = (option: AutoCompleteOption): string =>
  option.label ?? option.value

export const createAutoComplete = (config: AutoCompleteConfig = {}): AutoCompleteIns => {
  // ownedWrite: typing/keyboard arrive from DOM events — imperative entry
  // points outside any reactive owner.
  const [_text, _setText] = createSignal(untrack(() => config.defaultValue ?? ''), { ownedWrite: true })
  const [_active, _setActive] = createSignal<string | undefined>(undefined, { ownedWrite: true })
  const [_open, _setOpen] = createSignal(untrack(() => config.defaultOpen ?? false), { ownedWrite: true })
  const [_composing, _setComposing] = createSignal(false, { ownedWrite: true })
  // The text typed during an IME composition — committed on compositionEnd.
  let _pendingComposition: string | undefined

  const value = createMemo(() =>
    config.value !== undefined ? config.value : _text(),
  )

  const suggestions = createMemo(() => {
    const pool = config.options ?? []
    const filter = config.filterOption === false ? null : (config.filterOption ?? defaultFilter)
    return filter === null ? pool : pool.filter(option => filter(value(), option))
  })

  const isComposing = () => _composing()

  const notifyCompositionStart = () => {
    if (config.disabled) return
    _pendingComposition = undefined
    _setComposing(true)
  }

  const notifyCompositionEnd = () => {
    if (!_composing()) return
    _setComposing(false)
    if (_pendingComposition !== undefined) {
      const text = _pendingComposition
      _pendingComposition = undefined
      if (!config.disabled) untrack(() => commitText(text))
    }
  }

  const commitText = (text: string) => {
    _setText(text)
    config.onChange?.(text)
    config.onSearch?.(text)
    untrack(() => resetActiveWith(config.value ?? text))
  }

  const setInputText = (text: string) => {
    if (config.disabled) return
    if (_composing()) {
      // antd: composition keystrokes buffer only — no commit mid-IME.
      _pendingComposition = text
      return
    }
    commitText(text)
  }

  const isOpen = () => !config.disabled && (config.open !== undefined ? config.open : _open())

  // setOpen runs from the UI layer's dual-function createEffect, whose effect
  // callback executes with strictRead="an effect callback" set — reading the
  // (possibly getter-backed) config.open there trips STRICT_READ_UNTRACKED.
  // Reads that gate a WRITE go through untrack; isOpen stays tracked.
  const setOpen = (open: boolean) => {
    if (untrack(() => !!config.disabled)) return
    if (open === untrack(() => isOpen())) return
    if (untrack(() => config.open === undefined)) _setOpen(open)
    config.onOpenChange?.(open)
    if (open) {
      untrack(() => {
        resetActiveWith(value())
      })
    }
  }

  // ---- active suggestion (keyboard) ----------------------------------------

  /** Enabled suggestions (disabled rows are skipped by navigation). */
  const enabledSuggestions = (input: string) => {
    const pool = config.options ?? []
    const filter = config.filterOption === false ? null : (config.filterOption ?? defaultFilter)
    const list = filter === null ? pool : pool.filter(o => filter(input, o))
    return list.filter(o => !o.disabled)
  }

  const moveActive = (delta: number) => {
    if (config.disabled) return
    const list = enabledSuggestions(value())
    if (!list.length) return
    const cur = activeValue()
    const idx = list.findIndex(o => o.value === cur)
    const next = idx === -1
      ? (delta > 0 ? 0 : list.length - 1)
      : ((idx + delta) % list.length + list.length) % list.length
    _setActive(list[next].value)
  }

  const activeValue = createMemo(() => {
    if (config.disabled) return undefined
    const list = suggestions().filter(option => !option.disabled)
    const active = _active()
    return list.find(option => option.value === active)?.value
      ?? (isOpen() || active !== undefined ? list[0]?.value : undefined)
  })

  const setActiveValue = (next: string) => {
    if (!config.disabled && suggestions().some(option => option.value === next && !option.disabled)) _setActive(next)
  }

  /** Anchor to the first enabled suggestion (against an explicit input —
   *  batch-safe for right-after-typing reads). */
  const resetActiveWith = (input: string) => {
    const list = enabledSuggestions(input)
    _setActive(list.length ? list[0].value : undefined)
  }

  const resetActive = () => { if (!config.disabled) resetActiveWith(value()) }

  // ---- selection -----------------------------------------------------------

  const selectOption = (option: AutoCompleteOption) => {
    if (config.disabled || option.disabled) return
    const text = displayOf(option)
    _setText(text)
    config.onChange?.(text)
    config.onSelect?.(option.value, option)
    _setActive(undefined)
  }

  const commitActive = () => {
    const cur = activeValue()
    if (cur === undefined) return
    const option = suggestions().find(o => o.value === cur)
    if (option) selectOption(option)
  }

  // ---- focus ---------------------------------------------------------------

  const notifyFocus = () => {
    config.onFocus?.()
  }

  const notifyBlur = () => {
    _setActive(undefined)
    config.onBlur?.()
  }

  return {
    value,
    setInputText,
    suggestions,
    isComposing,
    notifyCompositionStart,
    notifyCompositionEnd,
    activeValue,
    moveActive,
    setActiveValue,
    resetActive,
    commitActive,
    selectOption,
    isOpen,
    setOpen,
    notifyFocus,
    notifyBlur,
    isDisabled: () => !!config.disabled,
  }
}

export const autoCompleteSplits: (keyof AutoCompleteConfig)[] = [
  'value', 'defaultValue', 'options', 'disabled', 'filterOption',
  'open', 'defaultOpen',
]
