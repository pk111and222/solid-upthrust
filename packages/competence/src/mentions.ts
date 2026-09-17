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
  notifyCompositionEnd: () => void
  /** Active (keyboard-highlighted) suggestion value. */
  activeValue: () => string | undefined
  moveActive: (delta: number) => void
  setActiveValue: (value: string) => void
  resetActive: () => void
  /** Commit the active suggestion (Enter). */
  commitActive: () => void
  /** Select an option: replaces the active token + trailing space. */
  selectOption: (option: MentionOption) => void
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

const displayOf = (option: MentionOption): string =>
  option.label ?? option.value

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
  const searchStart = Math.max(0, caret - 64)
  for (let i = Math.min(caret, text.length); i >= searchStart; i--) {
    const idx = text.lastIndexOf(prefix, i)
    if (idx < searchStart) break
    i = idx
    // The prefix must start the text or follow a whitespace/split char.
    const before = idx > 0 ? text[idx - 1] : undefined
    if (before !== undefined && !split.includes(before) && before !== '\n') continue
    // Token extends to the next whitespace/split char.
    let end = idx + prefix.length
    while (end < text.length && !split.includes(text[end]) && text[end] !== '\n') end++
    // Caret must sit inside [idx, end] (typing at the end counts).
    if (caret >= idx && caret <= end) {
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
  let i = 0
  while (i <= text.length - prefix.length) {
    const idx = text.indexOf(prefix, i)
    if (idx === -1) break
    const before = idx > 0 ? text[idx - 1] : undefined
    const boundaryOk = before === undefined || split.includes(before) || before === '\n'
    let end = idx + prefix.length
    while (end < text.length && !split.includes(text[end]) && text[end] !== '\n') end++
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
  const [_caret, _setCaret] = createSignal((config.defaultValue ?? '').length, { ownedWrite: true })
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

  /** Suggestions for the ACTIVE query (empty while inactive). Batch-safe:
   *  eagerly recomputed on setText/setCaret. `notify` fires onSearch when
   *  called from user edits (not from open/select re-derivations). */
  const [_suggestionList, _setSuggestionList] = createSignal<MentionOption[]>([], { ownedWrite: true })
  const recomputeSuggestions = (text: string, caretIndex: number, notify = false) => {
    const state = parseTrigger(text, caretIndex, prefix(), split())
    if (!state.active) {
      _setSuggestionList([])
      if (notify) config.onSearch?.('', state.prefix)
      return [] as MentionOption[]
    }
    const pool = config.options ?? []
    const filter = config.filterOption === false ? null : (config.filterOption ?? defaultFilter)
    const list = filter === null ? pool : pool.filter(o => filter(state.query, o))
    _setSuggestionList(list)
    if (notify) config.onSearch?.(state.query, state.prefix)
    return list
  }
  untrack(() => recomputeSuggestions(config.value ?? config.defaultValue ?? '', (config.defaultValue ?? '').length))

  const suggestions = createMemo(() => _suggestionList())

  const setText = (text: string) => {
    if (_composing()) {
      _pendingComposition = text
      return
    }
    _setText(text)
    config.onChange?.(text)
    // Keep the caret at the END for programmatic text (the UI layer moves
    // it precisely when it knows the DOM selection; this is the fallback).
    untrack(() => recomputeSuggestions(text, _caret(), true))
    untrack(() => resetActiveWith(text, _caret()))
  }

  const setCaret = (index: number) => {
    _setCaret(index)
    untrack(() => recomputeSuggestions(value(), index, true))
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
    untrack(() => recomputeSuggestions(text, caretIndex, true))
    untrack(() => resetActiveWith(text, caretIndex))
  }

  const caret = () => _caret()

  const getMentions = () => extractMentions(value(), prefix(), split())

  // ---- IME -----------------------------------------------------------------

  const isComposing = () => _composing()

  const notifyCompositionStart = () => {
    _setComposing(true)
  }

  const notifyCompositionEnd = () => {
    if (!_composing()) return
    _setComposing(false)
    if (_pendingComposition !== undefined) {
      const text = _pendingComposition
      _pendingComposition = undefined
      _setText(text)
      config.onChange?.(text)
      untrack(() => recomputeSuggestions(text, _caret()))
      untrack(() => resetActiveWith(text, _caret()))
    }
  }

  // ---- active suggestion ------------------------------------------------------

  const enabledSuggestionsFor = (text: string, caretIndex: number) => {
    const state = parseTrigger(text, caretIndex, prefix(), split())
    if (!state.active) return [] as MentionOption[]
    const pool = config.options ?? []
    const filter = config.filterOption === false ? null : (config.filterOption ?? defaultFilter)
    const list = filter === null ? pool : pool.filter(o => filter(state.query, o))
    return list.filter(o => !o.disabled)
  }

  const moveActive = (delta: number) => {
    const list = enabledSuggestionsFor(value(), _caret())
    if (!list.length) return
    const cur = _active()
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
    const insertion = `${state.prefix}${option.value} `
    const next = text.slice(0, state.range[0]) + insertion + text.slice(state.range[1])
    _setText(next)
    config.onChange?.(next)
    config.onSelect?.(option, state.prefix)
    // Caret lands right after the inserted mention + its trailing space.
    const nextCaret = state.range[0] + insertion.length
    _setCaret(nextCaret)
    untrack(() => {
      recomputeSuggestions(next, nextCaret)
      resetActiveWith(next, nextCaret)
    })
  }

  const commitActive = () => {
    const cur = _active()
    if (cur === undefined) return
    const option = (config.options ?? []).find(o => o.value === cur)
    if (option) selectOption(option)
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
    activeValue: () => _active(),
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
