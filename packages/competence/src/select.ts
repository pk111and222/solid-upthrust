import { createMemo, createSignal, untrack } from "solid-js";

/**
 * Headless logic for Select — the rc-select state core.
 *
 * ARCHITECTURE: Select is the composition the selection module was built
 * for. It rides TWO existing machines and adds only the Select-specific
 * glue:
 *
 *   createSelection  ← the option store (shared with Radio.Group /
 *                      Checkbox.Group): maxSelect 1 = single mode,
 *                      Infinity = multiple mode. Pick bookkeeping
 *                      (replace/toggle/disabled/clear) lives THERE, once.
 *   createTrigger    ← the dropdown layer (shared with Dropdown/Popover/
 *                      Tooltip): open state, portal positioning, outside
 *                      click + Escape dismiss. NOT composed here — the UI
 *                      layer owns it; this file stays DOM-free.
 *
 * What THIS file adds:
 *  - SEARCH: searchValue buffer + option filtering (filterOption callback,
 *    antd signature (input, option) => boolean; false disables filtering).
 *  - ACTIVE OPTION: the keyboard-highlighted option (arrow navigation).
 *    Kept SEPARATE from selection — hovering moves active, only Enter
 *    commits. Resets to the first (or selected) option on open/filter.
 *  - VALUE MODELING: single mode reports the raw key; labelInValue reports
 *    { value, label, ...option }; multiple always reports arrays. Tags
 *    mode = multiple + free entry (search text commits as a new option).
 *  - MODE GATES: maxTagCount is presentational (UI truncates), disabled
 *    blocks everything, allowClear clears the whole selection.
 */
import { createSelection, type SelectionIns, type SelectionOption } from "./selection";
import type { FormFieldRule } from "./formField";

/** A Select option — a SelectionOption plus rc-select extras. */
export type SelectOption = SelectionOption & {
  /** Optional group label for flat option arrays. */
  group?: string
}

/** Nested option group, in addition to the flat SelectOption.group form. */
export type SelectOptionGroup = { label: string; options: SelectOption[] }
export type SelectOptionEntry = SelectOption | SelectOptionGroup

export type SelectMode = 'single' | 'multiple' | 'tags'

export type SelectLabelInValue = {
  value: string | number
  label: string
  [key: string]: unknown
}

export type SelectConfig = {
  /** Controlled selected key(s). Single: one key; multiple/tags: array. */
  value?: string | number | Array<string | number>
  defaultValue?: string | number | Array<string | number>
  options?: SelectOptionEntry[]
  /** 'single' (default), 'multiple', or 'multiple' + free entry. */
  mode?: SelectMode
  disabled?: boolean
  /** Report { value, label } objects instead of raw keys. Default false. */
  labelInValue?: boolean
  /** Show the clear (×) button when non-empty. Default false. */
  allowClear?: boolean
  /** Enable the search input. Default false. */
  showSearch?: boolean
  /**
   * Filter predicate (antd signature). `false` disables client filtering
   * (server-side search). Default: substring match on label
   * (case-insensitive).
   */
  filterOption?: ((input: string, option: SelectOption) => boolean) | false
  /** Controlled open state (composed with the UI's trigger). */
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Fires on every keystroke in the search input (antd onSearch). */
  onSearch?: (value: string) => void
  onClear?: () => void
  onSelect?: (value: string | number, option: SelectOption) => void
  onDeselect?: (value: string | number, option: SelectOption) => void
  onChange?: (value: SelectChangeValue) => void
  /** Form integration: rules for the enclosing Item. */
  rules?: FormFieldRule[]
}

// The onChange signature is mode-dependent; use a union for the headless API.
export type SelectChangeValue = string | number | Array<string | number> | SelectLabelInValue | Array<SelectLabelInValue> | undefined

export type SelectConfigFull = SelectConfig

export type SelectIns = {
  /** The effective selected keys (array form internally). */
  value: () => Array<string | number>
  /** Single mode: the selected key or undefined. Multiple: n/a (use value). */
  singleValue: () => string | number | undefined
  /** The selected options in full (label lookup included). */
  selectedOptions: () => SelectOption[]
  /** The change value in the API shape (raw keys or labelInValue objects). */
  changeValue: () => SelectChangeValue
  /** True when multiple/tags mode. */
  isMultiple: () => boolean
  /** True when tags mode (free entry). */
  isTags: () => boolean
  options: () => SelectOption[]
  /** Options after the current search filter (group headers collapsed in). */
  filteredOptions: () => SelectOption[]
  /** The current search text. */
  searchValue: () => string
  /** Replace the search buffer (typing); fires onSearch. */
  setSearchValue: (text: string) => void
  /** The keyboard-active option key (arrow navigation highlight). */
  activeKey: () => string | number | undefined
  /** Move the active option by delta (wraps; skips disabled). */
  moveActive: (delta: number) => void
  /** Point the active option at a specific key (hover). */
  setActiveKey: (key: string | number) => void
  /** Reset active to the natural anchor (first filtered, else selected). */
  resetActive: () => void
  /** Open state (composed with the UI trigger's open). */
  isOpen: () => boolean
  setOpen: (open: boolean) => void
  /** Commit the active option (Enter). Single mode also closes. */
  commitActive: () => void
  /** Pick an option (click). Single mode closes; multiple toggles. */
  selectOption: (key: string | number) => void
  /** Remove one key from a multiple selection (tag ×). */
  deselectOption: (key: string | number) => void
  /** Clear the entire selection (allowClear ×). */
  clear: () => void
  /** Tags mode: commit the current search text as a new option. */
  commitSearchAsTag: () => void
  isSelected: (key: string | number) => boolean
  isDisabled: (key: string | number) => boolean
  /** The whole widget's disabled gate. */
  isWidgetDisabled: () => boolean
  /** The shared selection store (advanced composition). */
  store: () => SelectionIns
}

const defaultFilter = (input: string, option: SelectOption): boolean =>
  option.label.toLowerCase().includes(input.toLowerCase())

export const createSelect = (config: SelectConfigFull = {}): SelectIns => {
  const isMultiple = () => config.mode === 'multiple' || config.mode === 'tags'
  const isTags = () => config.mode === 'tags'

  /** Normalize the value prop into array form (single → [key]). */
  const toArray = (v: string | number | Array<string | number> | undefined): Array<string | number> | undefined => {
    if (v === undefined) return undefined
    return Array.isArray(v) ? v : [v]
  }

  /** Read the controlled value as an array (labelInValue objects included). */
  const controlledValue = (): Array<string | number> | undefined => {
    const v = config.value
    if (v === undefined) return undefined
    if (Array.isArray(v)) {
      return v.map(item => (typeof item === 'object' && item !== null ? (item as SelectLabelInValue).value : item))
    }
    return [v as string | number]
  }

  // Flatten nested groups for the selection machine; keep the group label
  // on each option so the UI can render headers after filtering.
  const [_tagOptions, _setTagOptions] = createSignal<SelectOption[]>([], { ownedWrite: true })
  const options = createMemo<SelectOption[]>(() => {
    const base = (config.options ?? []).flatMap(entry =>
      'options' in entry
        ? entry.options.map(option => ({ ...option, group: entry.label }))
        : [entry],
    )
    const tags = _tagOptions()
    return tags.length ? [...base, ...tags] : base
  })

  // The shared selection store — the SAME machine under Radio.Group and
  // Checkbox.Group. Single mode = maxSelect 1 (radio semantics: replace);
  // multiple/tags = unlimited (checkbox semantics: toggle).
  const store = createSelection({
    value: () => controlledValue(),
    defaultValue: toArray(config.defaultValue),
    get options() { return options() as SelectionOption[] },
    get disabled() { return config.disabled },
    maxSelect: () => isMultiple() ? Infinity : 1,
    // antd single Select: clicking the selected option keeps it (the
    // dropdown just closes); multiple mode toggles via select().
    allowDeselect: isMultiple,
    onChange: next => {
      // Re-emit in the API shape.
      const opts = options()
      const picked = next.map(k => opts.find(o => o.value === k)).filter(Boolean) as SelectOption[]
      if (config.labelInValue) {
        config.onChange?.(isMultiple() ? picked.map(toLabelInValue) : (picked[0] ? toLabelInValue(picked[0]) : undefined) as SelectChangeValue)
      } else {
        config.onChange?.((isMultiple() ? next : next[0]) as SelectChangeValue)
      }
    },
  })

  // ownedWrite: typing/keyboard arrive from DOM events — imperative entry
  // points outside any reactive owner.
  const [_search, _setSearch] = createSignal('', { ownedWrite: true })
  const [_activeKey, _setActiveKey] = createSignal<string | number | undefined>(undefined, { ownedWrite: true })
  const [_open, _setOpen] = createSignal(config.defaultOpen ?? false, { ownedWrite: true })

  // Tag options created at runtime are appended after normalized options.

  const isOpen = () => (config.open !== undefined ? config.open : _open())

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
      untrack(() => resetActive())
    } else {
      // Closing drops the search buffer (antd keeps it only in tags mode
      // while the menu is open; on close it resets).
      _setSearch('')
    }
  }

  const searchValue = () => _search()

  const setSearchValue = (text: string) => {
    _setSearch(text)
    config.onSearch?.(text)
    // re-anchor against the NEW filter — but the filteredOptions memo is
    // still reading the uncommitted search signal inside this batch (Solid 2
    // commits writes in batches), so pass the next filter explicitly.
    untrack(() => resetActiveWith(text))
  }

  /** Normalize filterOption: a predicate, or null = passthrough. */
  const filterPred = (): ((input: string, option: SelectOption) => boolean) | null => {
    const f = config.filterOption
    if (f === false || f === undefined) return f === false ? null : defaultFilter
    return f
  }

  /** The filtered list (search applied; filterOption false = passthrough). */
  const filteredOptions = createMemo<SelectOption[]>(() => {
    const all = options()
    const q = _search()
    const pred = filterPred()
    if (!q || pred === null) return all
    return all.filter(o => pred(q, o))
  })

  // ---- active option (keyboard highlight) -------------------------------

  /** Move by delta over the ENABLED, FILTERED options; wraps around. */
  const moveActive = (delta: number) => {
    const list = filteredOptions().filter(o => !o.disabled && !store.isDisabled(o.value))
    if (!list.length) { _setActiveKey(undefined); return }
    const cur = _activeKey()
    const idx = list.findIndex(o => o.value === cur)
    const next = idx === -1
      ? (delta > 0 ? 0 : list.length - 1)
      : (idx + delta + list.length) % list.length
    _setActiveKey(list[next].value)
  }

  const setActiveKey = (key: string | number) => {
    _setActiveKey(key)
  }

  /** Anchor: the first enabled filtered option, falling back to selection.
   *  `searchOverride` re-anchors against a search value that was just
   *  written but not yet committed by the batch (Solid 2 batching). */
  const resetActiveWith = (searchOverride?: string) => {
    const q = searchOverride ?? _search()
    const all = options()
    const pred = filterPred()
    const list = (!q || pred === null
      ? all
      : all.filter(o => pred(q, o))
    ).filter(o => !o.disabled && !store.isDisabled(o.value))
    if (list.length) {
      // Prefer the (first) selected option when it's visible.
      const sel = store.value()
      const firstSelected = sel.length ? list.find(o => sel.includes(o.value)) : undefined
      _setActiveKey((firstSelected ?? list[0]).value)
    } else {
      _setActiveKey(undefined)
    }
  }

  const resetActive = () => resetActiveWith()

  // ---- selection actions -------------------------------------------------

  const selectOption = (key: string | number) => {
    if (config.disabled) return
    const opt = options().find(o => o.value === key)
    if (!opt || opt.disabled) return
    const wasSelected = store.isSelected(key)
    store.select(key)
    if (!wasSelected) {
      config.onSelect?.(key, opt)
    } else if (isMultiple()) {
      config.onDeselect?.(key, opt)
    }
    // Single mode closes on pick; multiple stays open for more picks; the
    // search buffer clears either way (antd).
    if (!isMultiple()) {
      setOpen(false)
    } else {
      _setSearch('')
    }
  }

  const commitActive = () => {
    const key = _activeKey()
    if (key === undefined) return
    if (!filteredOptions().some(option => option.value === key && !store.isDisabled(key))) return
    selectOption(key)
  }

  const deselectOption = (key: string | number) => {
    if (config.disabled || !store.isSelected(key) || store.isDisabled(key)) return
    const opt = options().find(o => o.value === key)
    store.deselect(key)
    if (opt) config.onDeselect?.(key, opt)
  }

  const clear = () => {
    if (config.disabled) return
    store.clear()
    config.onClear?.()
    _setSearch('')
  }

  /** Tags mode: the current search text becomes a new option + gets picked. */
  const commitSearchAsTag = () => {
    if (config.disabled || !isTags()) return
    const text = _search().trim()
    if (!text) return
    const existing = options().find(o => o.label === text || o.value === text)
    if (existing) {
      // Enter adds an existing option; it never toggles an already selected tag off.
      if (!store.isSelected(existing.value)) selectOption(existing.value)
      else _setSearch('')
      return
    }
    const tag: SelectOption = { label: text, value: text }
    _setTagOptions(prev => (prev.some(o => o.value === text) ? prev : [...prev, tag]))
    _setSearch('')
    untrack(() => {
      store.select(text)
      config.onSelect?.(text, tag)
    })
  }

  // ---- value modeling ----------------------------------------------------

  const toLabelInValue = (o: SelectOption): SelectLabelInValue => ({
    ...o,
  })

  const selectedOptions = createMemo<SelectOption[]>(() => {
    const sel = store.value()
    const all = options()
    return sel.map(k => all.find(o => o.value === k)).filter(Boolean) as SelectOption[]
  })

  const singleValue = () => (isMultiple() ? undefined : store.value()[0])

  const changeValue = (): SelectChangeValue => {
    const sel = store.value()
    if (config.labelInValue) {
      const picked = selectedOptions().map(toLabelInValue)
      return isMultiple() ? picked : picked[0]
    }
    return isMultiple() ? sel : sel[0]
  }

  return {
    value: store.value,
    singleValue,
    selectedOptions,
    changeValue,
    isMultiple,
    isTags,
    options,
    filteredOptions,
    searchValue,
    setSearchValue,
    activeKey: () => _activeKey(),
    moveActive,
    setActiveKey,
    resetActive,
    isOpen,
    setOpen,
    commitActive,
    selectOption,
    deselectOption,
    clear,
    commitSearchAsTag,
    isSelected: store.isSelected,
    isDisabled: (key: string | number) => !!config.disabled || store.isDisabled(key),
    isWidgetDisabled: () => !!config.disabled,
    store: () => store,
  }
}

export const selectSplits: (keyof SelectConfigFull)[] = [
  'value', 'defaultValue', 'options', 'mode', 'disabled', 'labelInValue',
  'allowClear', 'showSearch', 'filterOption', 'open', 'defaultOpen',
]
