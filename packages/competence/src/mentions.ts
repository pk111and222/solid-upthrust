import { createMemo, createSignal, untrack } from "solid-js";

/**
 * Headless logic for Mentions — the rc-mentions core.
 *
 * ARCHITROPY: Mentions is a TEXTAREA whose text may contain mention
 * markers ('@name'), plus a trigger that opens a suggestion menu when the
 * caret enters a fresh '@' query. Like AutoComplete it holds free text —
 * no selection store. The machinery:
 *
 *   - TEXT BUFFER: controlled-or-uncontrolled string (IME-gated, same as
 *     AutoComplete); onChange fires on every committed edit.
 *   - TRIGGER DETECTION: given (text, caretIndex), the active mention
 *     query is the '@'-prefixed word under the caret. antd semantics: a
 *     mention is active while the caret sits INSIDE its token; the token
 *     ends at whitespace or the caret. `getMentions()` parses the final
 *     text for '@token' occurrences (the antd value contract).
 *   - QUERY FILTER: the text after '@' filters the option pool
 *     (substring on value/label; false = server mode).
 *   - INSERTION: selecting an option replaces the active token
 *     ('@query…' → '@value ') with a trailing space so typing continues
 *     outside the mention.
 */
import type { FormFieldRule } from "./formField";

export type MentionOption = {
  value: string
  label?: string
  disabled?: boolean
  [key: string]: unknown
}

export type MentionsConfig = {
  /** Controlled text value. */
  value?: string
  defaultValue?: string
  /** The suggestion pool. */
  options?: MentionOption[]
  /** Trigger prefix. Default '@'. */
  prefix?: string
  /** Word characters that may continue a mention token after the prefix. */
  split?: string
  disabled?: boolean
  /** (input, option) => boolean; false disables client filtering. */
  filterOption?: ((input: string, option: MentionOption) => boolean) | false
  /** Controlled open (composed with the UI's trigger). */
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onChange?: (value: string) => void
  onSelect?: (option: MentionOption, prefix: string) => void
  onSearch?: (text: string, prefix: string) => void
  onBlur?: () => void
  onFocus?: () => void
  /** Form integration: rules for the enclosing Item. */
  rules?: FormFieldRule[]
}

export type MentionTriggerState = {
  /** True when the caret sits in an active '@token'. */
  active: boolean
  /** The query text after the prefix ('' right after typing '@'). */
  query: string
  /** The token's range in the text, [start, end) INCLUDING the prefix. */
  range: [number, number]
  /** The matched prefix ('@'). */
  prefix: string
}

export type MentionsIns = {
  /** The effective text (controlled wins). */
  value: () => string
  /** Replace the text (typing); fires onChange. */
  setText: (text: string) => void
  /** Set the caret position (UI layer feeds selectionStart). */
  setCaret: (index: number) => void
  /**
   * Combined edit (typing): BOTH the new text and the new caret in ONE
   * call. Solid 2 batching makes separate calls read a stale value()
   * (setCaret would filter against the PREVIOUS text) — the UI's input
   * handler must use this.
   */
  setTextAndCaret: (text: string, caret: number) => void
  caret: () => number
  /** The trigger state under the current caret. */
  trigger: () => MentionTriggerState
  /** Suggestions filtered by the active query (empty when inactive). */
  suggestions: () => MentionOption[]
  /** All '@token' mentions present in the current text (antd getMentions). */
  getMentions: () => string[]
  /** IME composition gating. */
  isComposing: () => boolean
  notifyCompositionStart: () => void
  notifyCompositionEnd: (caret?: number) => void
  /** Active (keyboard-highlighted) suggestion value. */
  activeValue: () => string | undefined
  moveActive: (delta: number) => void
  setActiveValue: (value: string) => void
  resetActive: () => void
  /** Commit the active suggestion (Enter); returns the target caret on success. */
  commitActive: () => number | undefined
  /** Select an option and return the target caret on success. */
  selectOption: (option: MentionOption) => number | undefined
  /** Open state (the UI trigger owns the DOM). */
  isOpen: () => boolean
  setOpen: (open: boolean) => void
  notifyFocus: () => void
  notifyBlur: () => void
  isDisabled: () => boolean
}

const defaultFilter = (query: string, option: MentionOption): boolean => {
  const q = query.toLowerCase()
  const haystack = (option.value + ' ' + (option.label ?? '')).toLowerCase()
  return haystack.includes(q)
}

const isBoundary = (char: string | undefined, split: string) =>
  char === undefined || /\s/.test(char) || split.includes(char)

/**
 * Parse the mention token under `caret` in `text` (pure — testable).
 * A token is '@' followed by non-whitespace, non-split characters; the
 * caret must sit INSIDE the token (between its start and end+1).
 */
export const parseTrigger = (
  text: string,
  caret: number,
  prefix = '@',
  split = ' ',
): MentionTriggerState => {
  const inactive: MentionTriggerState = { active: false, query: '', range: [0, 0], prefix }
  if (!prefix) return inactive
  // Walk back from the caret to find the nearest unescaped prefix within
  // the current line/segment.
  for (let i = Math.min(caret, text.length); i >= 0; i--) {
    const idx = text.lastIndexOf(prefix, i)
    if (idx < 0) break
    i = idx
    // The prefix must start the text or follow a whitespace/split char.
    const before = idx > 0 ? text[idx - 1] : undefined
    if (!isBoundary(before, split)) continue
    // Token extends to the next whitespace/split char.
    let end = idx + prefix.length
    while (end < text.length && !isBoundary(text[end], split)) end++
    // Caret must sit inside [idx, end] (typing at the end counts).
    if (caret >= idx + prefix.length && caret <= end) {
      return {
        active: true,
        query: text.slice(idx + prefix.length, caret),
        range: [idx, end],
        prefix,
      }
    }
  }
  return inactive
}

/** Extract every mention token in the text (pure — antd getMentions). */
export const extractMentions = (text: string, prefix = '@', split = ' '): string[] => {
  const out: string[] = []
  if (!prefix) return out
  let i = 0
  while (i <= text.length - prefix.length) {
    const idx = text.indexOf(prefix, i)
    if (idx === -1) break
    const before = idx > 0 ? text[idx - 1] : undefined
    const boundaryOk = isBoundary(before, split)
    let end = idx + prefix.length
    while (end < text.length && !isBoundary(text[end], split)) end++
    if (boundaryOk && end > idx + prefix.length) {
      out.push(text.slice(idx + prefix.length, end))
      i = end
    } else {
      i = idx + 1
    }
  }
  return out
}

export const createMentions = (config: MentionsConfig = {}): MentionsIns => {
  const prefix = () => config.prefix ?? '@'
  const split = () => config.split ?? ' '

  // ownedWrite: typing/caret updates arrive from DOM events.
  const [_text, _setText] = createSignal(config.defaultValue ?? '', { ownedWrite: true })
  const [_caret, _setCaret] = createSignal((config.value ?? config.defaultValue ?? '').length, { ownedWrite: true })
  const [_active, _setActive] = createSignal<string | undefined>(undefined, { ownedWrite: true })
  const [_open, _setOpen] = createSignal(config.defaultOpen ?? false, { ownedWrite: true })
  const [_composing, _setComposing] = createSignal(false, { ownedWrite: true })
  let _pendingComposition: string | undefined

  const value = createMemo(() =>
    config.value !== undefined ? config.value : _text(),
  )

  const trigger = createMemo<MentionTriggerState>(() =>
    parseTrigger(value(), _caret(), prefix(), split()),
  )

  const suggestionsFor = (text: string, caretIndex: number) => {
    const state = parseTrigger(text, caretIndex, prefix(), split())
    if (!state.active) return [] as MentionOption[]
    const pool = config.options ?? []
    const filter = config.filterOption === false ? null : (config.filterOption ?? defaultFilter)
    return filter === null ? pool : pool.filter(o => filter(state.query, o))
  }
  // Derive from accepted text and live options: async/server results and
  // controlled parent updates must appear without another key stroke.
  const suggestions = createMemo(() => suggestionsFor(value(), _caret()))
  const notifySearch = (text: string, caretIndex: number) => {
    const state = parseTrigger(text, caretIndex, prefix(), split())
    config.onSearch?.(state.active ? state.query : '', state.prefix)
  }

  const setText = (text: string) => {
    if (_composing()) {
      _pendingComposition = text
      return
    }
    _setText(text)
    _setCaret(text.length)
    config.onChange?.(text)
    untrack(() => notifySearch(text, text.length))
    untrack(() => resetActiveWith(text, text.length))
  }

  const setCaret = (index: number) => {
    if (index === _caret()) return
    _setCaret(index)
    untrack(() => notifySearch(value(), index))
    untrack(() => resetActiveWith(value(), index))
  }

  /** Combined typing edit — batch-safe (see the type doc). */
  const setTextAndCaret = (text: string, caretIndex: number) => {
    if (_composing()) {
      _pendingComposition = text
      return
    }
    _setText(text)
    _setCaret(caretIndex)
    config.onChange?.(text)
    untrack(() => notifySearch(text, caretIndex))
    untrack(() => resetActiveWith(text, caretIndex))
  }

  const caret = () => _caret()

  const getMentions = () => extractMentions(value(), prefix(), split())

  // ---- IME -----------------------------------------------------------------

  const isComposing = () => _composing()

  const notifyCompositionStart = () => {
    _setComposing(true)
  }

  const notifyCompositionEnd = (caretIndex?: number) => {
    if (!_composing()) return
    _setComposing(false)
    if (_pendingComposition !== undefined) {
      const text = _pendingComposition
      _pendingComposition = undefined
      _setText(text)
      _setCaret(caretIndex ?? text.length)
      config.onChange?.(text)
      untrack(() => notifySearch(text, caretIndex ?? text.length))
      untrack(() => resetActiveWith(text, caretIndex ?? text.length))
    }
  }

  // ---- active suggestion ------------------------------------------------------

  const enabledSuggestionsFor = (text: string, caretIndex: number) =>
    suggestionsFor(text, caretIndex).filter(o => !o.disabled)
  const activeValue = () => {
    const list = suggestions().filter(o => !o.disabled)
    const selected = _active()
    return list.find(o => o.value === selected)?.value ?? list[0]?.value
  }

  const moveActive = (delta: number) => {
    const list = enabledSuggestionsFor(value(), _caret())
    if (!list.length) return
    const cur = activeValue()
    const idx = list.findIndex(o => o.value === cur)
    const next = idx === -1
      ? (delta > 0 ? 0 : list.length - 1)
      : (idx + delta + list.length) % list.length
    _setActive(list[next].value)
  }

  const setActiveValue = (value: string) => {
    _setActive(value)
  }

  const resetActiveWith = (text: string, caretIndex: number) => {
    const list = enabledSuggestionsFor(text, caretIndex)
    _setActive(list.length ? list[0].value : undefined)
  }

  const resetActive = () => resetActiveWith(value(), _caret())

  // ---- open ------------------------------------------------------------------

  const isOpen = () => (config.open !== undefined ? config.open : _open())

  const setOpen = (open: boolean) => {
    if (config.disabled) return
    if (open === isOpen()) return
    if (config.open === undefined) _setOpen(open)
    config.onOpenChange?.(open)
  }

  // ---- selection ----------------------------------------------------------------

  const selectOption = (option: MentionOption) => {
    if (config.disabled || option.disabled) return
    const state = trigger()
    if (!state.active) return
    const text = value()
    const suffix = text.slice(state.range[1])
    const separator = isBoundary(suffix[0], split()) && suffix.length > 0 ? '' : (split() || ' ')
    const insertion = `${state.prefix}${option.value}${separator}`
    const next = text.slice(0, state.range[0]) + insertion + text.slice(state.range[1])
    _setText(next)
    config.onChange?.(next)
    config.onSelect?.(option, state.prefix)
    // Caret lands right after the inserted mention + its trailing space.
    const nextCaret = state.range[0] + insertion.length + (separator === '' && suffix.length > 0 ? 1 : 0)
    _setCaret(nextCaret)
    untrack(() => {
      resetActiveWith(next, nextCaret)
    })
    return nextCaret
  }

  const commitActive = () => {
    const cur = activeValue()
    if (cur === undefined) return
    const option = (config.options ?? []).find(o => o.value === cur)
    return option ? selectOption(option) : undefined
  }

  // ---- focus ---------------------------------------------------------------------

  const notifyFocus = () => {
    config.onFocus?.()
  }

  const notifyBlur = () => {
    _setActive(undefined)
    config.onBlur?.()
  }

  return {
    value,
    setText,
    setCaret,
    setTextAndCaret,
    caret,
    trigger,
    suggestions,
    getMentions,
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

export const mentionsSplits: (keyof MentionsConfig)[] = [
  'value', 'defaultValue', 'options', 'prefix', 'split', 'disabled',
  'filterOption', 'open', 'defaultOpen',
]
