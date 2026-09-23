import VirtualList from '../_VirtualList'
import { ConfigPortal as Portal } from '../ConfigProvider/Portal'
import { useComponentProps } from '../ConfigProvider/context'
import { Component, For, Show, createEffect, createMemo, createSignal, createUniqueId, merge, useContext } from 'solid-js'
import { type JSX } from '@solidjs/web'
import { twMerge } from 'tailwind-merge'
import {
  createOwnerCleanup,
  createSelect,
  createTrigger,
  type SelectChangeValue,
  type SelectOption,
  type SelectOptionEntry,
  type SelectOptionGroup,
  type SelectLabelInValue,
} from 'upthrust-competence'
import type { SizeType } from '../../common/type'
import { FormItemContext, useFormItem } from '../Input/context'
import { createDelayedArrow } from '../../utils/clearableArrow'
import {
  searchInputClass,
  selectDropdownWrapClass,
  selectEmptyClass,
  selectOptionCheckWrapClass,
  selectOptionWrapClass,
  selectTagCloseWrapClass,
  selectTagRestClass,
  selectTagWrapClass,
  selectorArrowWrapClass,
  selectorClass,
  selectorClearWrapClass,
  selectorSuffixWrapClass,
  selectionItemWrapClass,
} from './styles'

export type { SelectOption, SelectOptionEntry, SelectOptionGroup, SelectLabelInValue, SelectChangeValue }

export interface SelectProps {
  virtual?: boolean
  listHeight?: number
  listItemHeight?: number
  /** Controlled selected value: single key or (multiple) array of keys. */
  value?: string | number | Array<string | number>
  defaultValue?: string | number | Array<string | number>
  options?: SelectOptionEntry[]
  /** 'multiple' adds tags; 'tags' also allows free entry via search. */
  mode?: 'multiple' | 'tags'
  disabled?: boolean
  /** Report { value, label } objects instead of raw keys. */
  labelInValue?: boolean
  /** Show the clear (×) button when non-empty. */
  allowClear?: boolean
  /** Enable the search input. Default: on for tags mode, off otherwise. */
  showSearch?: boolean
  /** (input, option) => boolean; false disables client filtering. */
  filterOption?: ((input: string, option: SelectOption) => boolean) | false
  placeholder?: string
  size?: SizeType
  status?: 'error' | 'warning'
  /** Max rendered tags before collapsing into "+N …". */
  maxTagCount?: number
  /** Text of the collapsed counter (antd maxTagPlaceholder). */
  maxTagPlaceholder?: (omitted: SelectOption[]) => JSX.Element
  /** Controlled dropdown open. */
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  loading?: boolean
  /** Custom dropdown content; replaces the option list. */
  dropdownRender?: (menu: JSX.Element) => JSX.Element
  /** Empty-state text. Default "无数据". */
  notFoundContent?: string
  id?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  name?: string
  class?: string
  style?: JSX.CSSProperties
  onChange?: (value: SelectChangeValue) => void
  onSearch?: (value: string) => void
  onSelect?: (value: string | number, option: SelectOption) => void
  onDeselect?: (value: string | number, option: SelectOption) => void
  onClear?: () => void
  ref?: (el: HTMLDivElement) => void
}

/**
 * Select — the antd-style picker.
 *
 * COMPOSITION (the architecture the selection module was built for):
 *  - createSelect (headless): the option store rides the SHARED
 *    createSelection — single mode is maxSelect:1 (radio semantics),
 *    multiple/tags is unlimited (checkbox semantics) — plus search,
 *    active-option keyboard nav and tags free-entry.
 *  - createTrigger (headless): the dropdown layer — portal positioning,
 *    viewport flip, outside-click + Escape dismiss. The same machine under
 *    Dropdown/Popover/Tooltip.
 *  - this layer: the selector box (single label / tag list), the inline
 *    search input, and the portal listbox.
 */
const Select: Component<SelectProps> = providedProps => {
  const rawProps = useComponentProps('Select', providedProps)
  const props = merge({}, rawProps)
  const fieldContext = useContext(FormItemContext)
  const hasExplicitValue = Object.prototype.hasOwnProperty.call(providedProps, 'value')

  const form = useFormItem({
    get value() { return props.value },
    get onChange() { return props.onChange },
    get disabled() { return props.disabled },
    get id() { return props.id },
    get size() { return props.size },
    get status() { return props.status },
  })

  const resolvedSize = () => props.size ?? form.size() ?? 'middle'
  const resolvedStatus = () => form.status()
  const resolvedDisabled = () => form.disabled()
  const listId = `select-list-${createUniqueId()}`

  // Search default: tags mode implies searchable (antd).
  const searchEnabled = () =>
    props.showSearch ?? props.mode === 'tags'

  // The headless select machine — created ONCE (NOT inside createMemo):
  // createSelect eagerly evaluates its value getter during construction
  // (createSelection's value memo runs at creation), so a createMemo
  // wrapper would track form.value() and RECREATE the whole machine on
  // every value change — resetting search/active state mid-interaction and
  // breaking the controlled-clear display. The config getters below give
  // the machine full reactivity on their own.
  const machine = createSelect({
    get value() {
      const value = form.value() as SelectProps['value']
      // An explicit value prop (or named Form.Item) stays controlled when
      // cleared to undefined. [] is the headless machine's empty value.
      return value === undefined && (hasExplicitValue || fieldContext?.id() !== undefined) ? [] : value
    },
    get defaultValue() { return props.defaultValue },
    get options() { return props.options },
    get mode() { return props.mode },
    get disabled() { return resolvedDisabled() },
    get labelInValue() { return props.labelInValue },
    get filterOption() { return props.filterOption },
    get onChange() { return (value: SelectChangeValue) => {
      if (props.onChange) props.onChange(value)
      else form.onChange(value)
    } },
    get onSearch() { return props.onSearch },
    get onSelect() { return props.onSelect },
    get onDeselect() { return props.onDeselect },
    get onClear() { return props.onClear },
  })

  // The dropdown layer — click-triggered, lazy-mounted, aligned to the
  // selector's bottom-left (antd default). Also created once: the trigger
  // attaches document-level listeners + element refs that must survive.
  const trigger = createTrigger({
    get open() { return props.open },
    get defaultOpen() { return props.defaultOpen },
    get disabled() { return resolvedDisabled() },
    action: 'click',
    placement: 'bottomLeft',
    offset: 4,
    get onOpenChange() { return props.onOpenChange },
  })

  const m = () => machine
  const open = () => trigger.open()

  const commitOption = (key: string | number) => {
    if (machine.isDisabled(key)) return
    machine.selectOption(key)
    if (!machine.isMultiple()) trigger.setOpen(false)
  }

  const commitActive = () => {
    const key = machine.activeKey()
    if (key !== undefined) commitOption(key)
  }

  // Keep the two open states in lockstep: the select machine's open mirrors
  // the trigger (the trigger owns the DOM; the machine owns search reset).
  // Dual-form createEffect — compute (tracked) reads the trigger's open,
  // effect (untracked) drives the machine.
  createEffect(() => open(), (isOpen) => {
    machine.setOpen(isOpen)
  })

  const inputRef: { current?: HTMLInputElement } = {}
  const setInputRef = (el: HTMLInputElement) => {
    inputRef.current = el
  }

  const selectorRef: { current?: HTMLDivElement } = {}
  const onOwnerCleanup = createOwnerCleanup()
  const [selectorWidth, setSelectorWidth] = createSignal(0, { ownedWrite: true })
  let sizeObserver: ResizeObserver | undefined
  const setSelectorRef = (el: HTMLDivElement) => {
    selectorRef.current = el
    sizeObserver?.disconnect()
    const measure = () => setSelectorWidth(el.getBoundingClientRect().width)
    measure()
    if (typeof ResizeObserver !== 'undefined') {
      sizeObserver = new ResizeObserver(measure)
      sizeObserver.observe(el)
    }
    props.ref?.(el)
  }
  onOwnerCleanup(() => sizeObserver?.disconnect())

  // Focus management on open (antd focuses the search field so typing works
  // immediately). Non-search selects focus the selector itself — the
  // selector's tabindex=0 makes it the key event target (key events on
  // BODY never reach Solid's delegated handlers: delegation only fires for
  // targets INSIDE the bound element).
  // The effect's dual-function form runs its CLEANUP callback outside the
  // effect's owner context in this Solid 2 rc — plain onCleanup there warns
  // [NO_OWNER_CLEANUP] and never runs. Bind to the component owner instead.
  let focusTimer: ReturnType<typeof setTimeout> | undefined
  createEffect(() => open(), (isOpen) => {
    if (focusTimer) clearTimeout(focusTimer)
    if (!isOpen) return
    focusTimer = setTimeout(() => {
      if (!open()) return
      if (searchEnabled() && inputRef.current) {
        inputRef.current.focus()
      } else {
        selectorRef.current?.focus()
      }
    }, 30)
  })
  onOwnerCleanup(() => { if (focusTimer) clearTimeout(focusTimer) })

  const showClear = () =>
    !!props.allowClear && m().value().length > 0 && !resolvedDisabled()
  const showArrow = createDelayedArrow(showClear)

  const displayedTags = createMemo<SelectOption[]>(() => {
    const sel = m().selectedOptions()
    if (props.maxTagCount === undefined || sel.length <= props.maxTagCount) return sel
    return sel.slice(0, Math.max(0, props.maxTagCount))
  })
  const omittedTags = createMemo<SelectOption[]>(() => {
    const sel = m().selectedOptions()
    return props.maxTagCount === undefined || sel.length <= props.maxTagCount
      ? []
      : sel.slice(Math.max(0, props.maxTagCount))
  })

  const handleSelectorKeyDown = (e: KeyboardEvent) => {
    if ((e.target as Element).closest('button')) return
    const mm = m()
    if (resolvedDisabled()) return
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (!open()) {
          trigger.setOpen(true)
        } else if (searchEnabled() && mm.isTags() && mm.searchValue().trim()) {
          mm.commitSearchAsTag()
        } else {
          commitActive()
        }
        return
      case 'Escape':
        if (open()) {
          e.preventDefault()
          trigger.setOpen(false)
        }
        return
      case 'ArrowDown':
        e.preventDefault()
        if (!open()) { trigger.setOpen(true); return }
        mm.moveActive(1)
        return
      case 'ArrowUp':
        e.preventDefault()
        if (open()) mm.moveActive(-1)
        return
      case 'Backspace':
        // Multiple: Backspace on an empty search removes the last tag.
        if (mm.isMultiple() && !mm.searchValue() && mm.value().length) {
          e.preventDefault()
          mm.deselectOption(mm.value()[mm.value().length - 1])
        }
        return
      case 'Delete': {
        if (!resolvedDisabled() && mm.isMultiple() && !mm.searchValue() && mm.value().length) {
          e.preventDefault()
          mm.deselectOption(mm.value()[mm.value().length - 1])
        }
        return
      }
    }
  }

  const handleSearchKeyDown = (e: KeyboardEvent) => {
    // The search input forwards navigation keys to the machine.
    e.stopPropagation()
    if (resolvedDisabled()) return
    const mm = m()
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        mm.moveActive(1)
        break
      case 'ArrowUp':
        e.preventDefault()
        mm.moveActive(-1)
        break
      case 'Enter':
        e.preventDefault()
        if (mm.isTags() && mm.searchValue().trim()) {
          mm.commitSearchAsTag()
        } else {
          commitActive()
        }
        break
      case 'Escape':
        e.preventDefault()
        trigger.setOpen(false)
        break
      case 'Backspace':
      case 'Delete':
        if (mm.isMultiple() && !mm.searchValue() && mm.value().length) {
          e.preventDefault()
          mm.deselectOption(mm.value()[mm.value().length - 1])
        }
        break
    }
  }

  // The clear × must beat the trigger's NATIVE click listener: createTrigger
  // attaches `click` directly on the selector element and calls
  // stopPropagation() there, which kills the bubble before Solid's
  // document-level delegated onClick on the × span could ever fire. So the
  // × handles POINTERDOWN (native, capture phase — runs before the
  // element's click listener) and suppresses the click entirely.
  const handleClearPointerDown = (e: PointerEvent) => {
    e.preventDefault()  // suppress the synthesized click (and focus shift)
    e.stopPropagation()
  }

  const handleClearClick = (e: MouseEvent) => {
    e.stopPropagation()
    m().clear()
  }

  const handleTagRemove = (e: MouseEvent, key: string | number) => {
    e.stopPropagation()
    m().deselectOption(key)
  }

  // Trigger binds a native click listener to the selector. Inner buttons
  // therefore also need native listeners so they stop bubbling first.
  const bindNativeClick = (el: HTMLElement, handler: (e: MouseEvent) => void) => {
    el.addEventListener('click', handler)
    onOwnerCleanup(() => el.removeEventListener('click', handler))
  }

  const handleMenuClick = (e: MouseEvent) => {
    const option = (e.target as Element).closest<HTMLElement>('[data-option-index]')
    if (!option) return
    const index = Number(option.dataset.optionIndex)
    const row = menuRows()[index]
    if (row?.kind === 'option') commitOption(row.option.value)
  }

  type MenuRow = { kind: 'group'; label: string } | { kind: 'option'; option: SelectOption }
  const menuRows = createMemo<MenuRow[]>(() => {
    const rows: MenuRow[] = []
    let lastGroup: string | undefined
    for (const option of m().filteredOptions()) {
      if (option.group && option.group !== lastGroup) rows.push({ kind: 'group', label: option.group })
      rows.push({ kind: 'option', option })
      lastGroup = option.group
    }
    return rows
  })
  const activeIndex = () => menuRows().findIndex(row => row.kind === 'option' && row.option.value === m().activeKey())

  const renderTags = () => (
    <>
      <For each={displayedTags()}>
        {opt => (
          <span class={selectTagWrapClass({ disabled: resolvedDisabled() })}>
            <span class="truncate max-w-[120px]">{opt.label}</span>
            <Show when={!resolvedDisabled()}>
              <button
                type="button"
                ref={el => bindNativeClick(el, e => handleTagRemove(e, opt.value))}
                class={twMerge(selectTagCloseWrapClass({ disabled: false }), 'border-none bg-transparent p-0')}
                aria-label={`移除 ${opt.label}`}
              >
                <span class="i-mdi-close" />
              </button>
            </Show>
          </span>
        )}
      </For>
      <Show when={omittedTags().length > 0}>
        <span class={selectTagRestClass()}>
          {props.maxTagPlaceholder
            ? props.maxTagPlaceholder(omittedTags())
            : `+${omittedTags().length} …`}
        </span>
      </Show>
      {/* The inline search input rides at the END of the tag row so typing
          appends after the tags (antd). */}
      <Show when={searchEnabled()}>
        <input
          ref={setInputRef}
          class={searchInputClass()}
          style={{ width: m().searchValue() ? 'auto' : '2px', 'min-width': '2px' }}
          value={m().searchValue()}
          disabled={resolvedDisabled()}
          autocomplete="off"
          onInput={e => m().setSearchValue((e.target as HTMLInputElement).value)}
          onKeyDown={handleSearchKeyDown}
        />
      </Show>
    </>
  )

  const renderMenu = () => <Show when={m().filteredOptions().length > 0} fallback={<div class={selectEmptyClass()}>{props.notFoundContent ?? '无数据'}</div>}>
        <VirtualList items={menuRows()} virtual={props.virtual} height={props.listHeight} itemHeight={props.listItemHeight} activeIndex={activeIndex()}>
          {(row, index) => row.kind === 'group'
            ? <div data-select-group role="separator" aria-label={row.label} class="flex items-center h-full px-[12px] text-[12px] font-semibold text-on-surface-variant bg-on-surface/3 select-none">{row.label}</div>
            : <div
              id={`${listId}-option-${index()}`}
              data-option-index={index()}
              class={selectOptionWrapClass({
                selected: m().isSelected(row.option.value),
                active: m().activeKey() === row.option.value,
                disabled: row.option.disabled,
              })}
              role="option"
              aria-selected={m().isSelected(row.option.value) ? 'true' : 'false'}
              aria-disabled={row.option.disabled ? 'true' : 'false'}
              onMouseEnter={() => m().setActiveKey(row.option.value)}
            >
              <span class="truncate">{row.option.label}</span>
              <span class={selectOptionCheckWrapClass({ visible: m().isSelected(row.option.value) })}>
                <span class="i-mdi-check" />
              </span>
            </div>
          }
        </VirtualList>
  </Show>

  return (
    <div
      class={twMerge('relative inline-flex w-full', props.class)}
      style={props.style}
      onKeyDown={handleSelectorKeyDown}
    >
      <Show when={props.name}>
        <For each={m().value()}>{value => <input type="hidden" name={props.name} value={String(value)} disabled={resolvedDisabled()} />}</For>
      </Show>
      <div
        ref={el => { trigger.triggerRef(el); setSelectorRef(el) }}
        class={selectorClass({
          size: resolvedSize(),
          open: open(),
          disabled: resolvedDisabled(),
          status: resolvedStatus(),
          multiple: m().isMultiple(),
        })}
        id={form.id()}
        role="combobox"
        tabindex={resolvedDisabled() ? -1 : 0}
        aria-label={props['aria-label']}
        aria-labelledby={props['aria-labelledby']}
        aria-expanded={open() ? 'true' : 'false'}
        aria-haspopup="listbox"
        aria-controls={open() ? listId : undefined}
        aria-activedescendant={open() && activeIndex() >= 0 ? `${listId}-option-${activeIndex()}` : undefined}
        aria-disabled={resolvedDisabled() ? 'true' : 'false'}
        aria-invalid={resolvedStatus() === 'error' ? 'true' : undefined}
      >
        <Show
          when={m().isMultiple()}
          fallback={
            <>
              <Show
                when={searchEnabled()}
                fallback={
                  <>
                    <Show
                      when={m().selectedOptions().length > 0}
                      fallback={
                        <span class={selectionItemWrapClass({ state: 'placeholder', size: resolvedSize() })}>
                          {props.placeholder ?? '请选择'}
                        </span>
                      }
                    >
                      <span class={selectionItemWrapClass({ state: 'value', size: resolvedSize() })}>
                        {m().selectedOptions()[0]?.label}
                      </span>
                    </Show>
                  </>
                }
              >
                {/* Searchable single mode: the search input replaces the
                    label area (antd). Empty search shows the placeholder or
                    the selected label; typing filters. */}
                <Show
                  when={m().searchValue() || m().selectedOptions().length === 0}
                  fallback={
                    <span class={selectionItemWrapClass({ state: 'value', size: resolvedSize() })}>
                      {m().selectedOptions()[0]?.label}
                    </span>
                  }
                >
                  <Show
                    when={m().searchValue()}
                    fallback={
                      <span class={selectionItemWrapClass({ state: 'placeholder', size: resolvedSize() })}>
                        {props.placeholder ?? '请选择'}
                      </span>
                    }
                  >
                    <span class="w-px" />
                  </Show>
                </Show>
                <input
                  ref={setInputRef}
                  class={twMerge(searchInputClass(), 'absolute', m().searchValue() ? 'opacity-100' : 'opacity-0', 'w-full', 'h-full', 'left-0', resolvedSize() === 'small' ? 'pl-[7px]' : 'pl-[11px]', 'cursor-auto')}
                  value={m().searchValue()}
                  disabled={resolvedDisabled()}
                  autocomplete="off"
                  onInput={e => m().setSearchValue((e.target as HTMLInputElement).value)}
                  onKeyDown={handleSearchKeyDown}
                />
              </Show>
              <span class={twMerge(selectorSuffixWrapClass({ size: resolvedSize() }), 'relative z-1')}>
                <Show when={props.allowClear}>
                  <button
                    type="button"
                    ref={el => bindNativeClick(el, handleClearClick)}
                    class={twMerge(selectorClearWrapClass({ visible: showClear() }), 'border-none bg-transparent p-0')}
                    aria-label="清空"
                    tabindex={showClear() ? 0 : -1}
                    onPointerDown={handleClearPointerDown}
                  >
                    <span class="i-mdi-close" />
                  </button>
                </Show>
                <Show when={!showClear() && showArrow()}>
                  <Show when={props.loading} fallback={<span class={selectorArrowWrapClass({ open: open() })}><span class="i-mdi-chevron-down" /></span>}>
                    <span role="status" aria-label="加载中" class="flex h-full w-full items-center justify-center"><span class="i-mdi-loading animate-spin-upthrust" /></span>
                  </Show>
                </Show>
              </span>
            </>
          }
        >
          <div class="flex flex-wrap items-center flex-1 min-w-0">
            <Show when={m().selectedOptions().length === 0 && !m().searchValue() && (!searchEnabled() || !open())}>
              <span class={twMerge(selectionItemWrapClass({ state: 'placeholder', size: resolvedSize() }), 'flex-none')}>
                {props.placeholder ?? '请选择'}
              </span>
            </Show>
            {renderTags()}
          </div>
          <span class={selectorSuffixWrapClass({ size: resolvedSize() })}>
            <Show when={props.allowClear}>
              <button
                type="button"
                ref={el => bindNativeClick(el, handleClearClick)}
                class={twMerge(selectorClearWrapClass({ visible: showClear() }), 'border-none bg-transparent p-0')}
                aria-label="清空"
                tabindex={showClear() ? 0 : -1}
                onPointerDown={handleClearPointerDown}
              >
                <span class="i-mdi-close" />
              </button>
            </Show>
            <Show when={!showClear() && showArrow()}>
              <Show when={props.loading} fallback={<span class={selectorArrowWrapClass({ open: open() })}><span class="i-mdi-chevron-down" /></span>}>
                <span role="status" aria-label="加载中" class="flex h-full w-full items-center justify-center"><span class="i-mdi-loading animate-spin-upthrust" /></span>
              </Show>
            </Show>
          </span>
        </Show>
      </div>
      <Portal>
        <Show when={trigger.mounted()}>
          <div
            ref={(el) => { trigger.layerRef(el); bindNativeClick(el, handleMenuClick) }}
            class={selectDropdownWrapClass({ visible: open(), placement: trigger.actualPlacement() })}
            style={{
              ...trigger.layerStyle(),
              width: props.style?.width !== undefined ? `${selectorWidth()}px` : 'max-content',
              'min-width': props.style?.width === undefined && selectorWidth() > 0 ? `${selectorWidth()}px` : undefined,
            }}
            role="listbox"
            id={listId}
            tabindex={-1}
            aria-hidden={!open() ? 'true' : undefined}
            inert={!open()}
          >
            <Show when={!props.dropdownRender} fallback={props.dropdownRender?.(renderMenu())}>{renderMenu()}</Show>
          </div>
        </Show>
      </Portal>
    </div>
  )
}

export default Select
