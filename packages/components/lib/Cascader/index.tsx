import VirtualList from '../_VirtualList'
import { ConfigPortal as Portal } from '../ConfigProvider/Portal'
import { useComponentProps } from '../ConfigProvider/context'
import { Component, For, Show, createEffect, createSignal, merge } from 'solid-js'
import { type JSX } from '@solidjs/web'
import { twMerge } from 'tailwind-merge'
import {
  createCascader,
  createOwnerCleanup,
  createTrigger,
  type CascaderOption,
} from 'upthrust-competence'
import type { SizeType } from '../../common/type'
import { useFormItem } from '../Input/context'
import {
  cascaderArrowWrapClass,
  cascaderCheckboxMarkWrapClass,
  cascaderCheckboxWrapClass,
  cascaderClearWrapClass,
  cascaderColumnClass,
  cascaderColumnsClass,
  cascaderDropdownWrapClass,
  cascaderEmptyClass,
  cascaderItemWrapClass,
  cascaderOptionExpandWrapClass,
  cascaderOptionWrapClass,
  cascaderPanelSearchClass,
  cascaderPanelSearchInputClass,
  cascaderSearchInputClass,
  cascaderSearchItemWrapClass,
  cascaderSelectorClass,
  cascaderSuffixWrapClass,
  cascaderTagCloseWrapClass,
  cascaderTagRestClass,
  cascaderTagWrapClass,
} from './styles'

export type { CascaderOption }

export interface CascaderProps {
  virtual?: boolean
  listHeight?: number
  listItemHeight?: number
  /** Controlled value: a path (single) or array of paths (multiple). */
  value?: Array<string | number> | Array<Array<string | number>>
  defaultValue?: Array<string | number> | Array<Array<string | number>>
  options?: CascaderOption[]
  /** 'multiple' enables multi-path selection. */
  mode?: 'multiple'
  disabled?: boolean
  /** Commit on every level click, not just leaves. */
  changeOnSelect?: boolean
  /** Enable the search box. Default: false. */
  showSearch?: boolean
  /** (input, path, nodes) => boolean; false disables client filtering. */
  searchFilterOption?: ((input: string, path: Array<string | number>, nodes: CascaderOption[]) => boolean) | false
  /** multiple mode with parent↔children checkbox linkage. */
  checkable?: boolean
  placeholder?: string
  size?: SizeType
  status?: 'error' | 'warning'
  /** Separator in the display text. Default ' / '. */
  separator?: string
  /** Max rendered tags before collapsing into "+N …". */
  maxTagCount?: number
  /** Whether the menu expands on hover (antd expandTrigger). Default click. */
  expandTrigger?: 'click' | 'hover'
  notFoundContent?: string
  id?: string
  class?: string
  style?: JSX.CSSProperties
  onChange?: (value: Array<string | number> | Array<Array<string | number>> | undefined, nodes: CascaderOption[]) => void
  onSelect?: (path: Array<string | number>, nodes: CascaderOption[]) => void
  onSearch?: (value: string) => void
  onClear?: () => void
  ref?: (el: HTMLDivElement) => void
}

/**
 * Cascader — the antd-style path picker.
 *
 * COMPOSITION: the headless createCascader rides the SHARED createSelection
 * (paths as joined keys — single = maxSelect 1, multiple = unlimited,
 * exactly Select's engine) and adds the tree model: per-level columns,
 * active trail, changeOnSelect, search flattening, and checkable
 * parent↔children linkage. The dropdown layer is createTrigger — the same
 * machine under Dropdown/Popover/Tooltip/Select. This layer renders the
 * selector box, the multi-column portal menu, and the flat search list.
 */
const Cascader: Component<CascaderProps> = providedProps => {
  const rawProps = useComponentProps('Cascader', providedProps)
  const props = merge({ separator: ' / ', expandTrigger: 'click' as const }, rawProps)

  const form = useFormItem({
    get value() { return props.value },
    // The Item's store write (form.onChange) is driven by the machine's
    // onChange below — no direct pass-through (Cascader's onChange carries
    // nodes, not the (value, event) contract).
    get onChange() { return undefined },
    get disabled() { return props.disabled },
    get id() { return props.id },
    get size() { return props.size },
    get status() { return props.status },
  })

  const resolvedSize = () => props.size ?? form.size() ?? 'middle'
  const resolvedStatus = () => form.status()
  const resolvedDisabled = () => form.disabled()

  // Created ONCE (the createMemo-wraps-machine pitfall — see Select).
  const machine = createCascader({
    get value() { return form.value() as CascaderProps['value'] },
    get defaultValue() { return props.defaultValue },
    get options() { return props.options },
    get mode() { return props.mode },
    get disabled() { return resolvedDisabled() },
    get changeOnSelect() { return props.changeOnSelect },
    get searchFilterOption() { return props.searchFilterOption },
    get checkable() { return props.checkable },
    onChange: (value, nodes) => {
      // Write the raw value into the enclosing Item (store + validation).
      form.onChange(value as any)
      props.onChange?.(value, nodes)
    },
    get onSelect() { return props.onSelect },
    get onSearch() { return props.onSearch },
    get onClear() { return props.onClear },
  })

  const trigger = createTrigger({
    get disabled() { return resolvedDisabled() },
    action: 'click',
    placement: 'bottomLeft',
    offset: 4,
  })

  const m = () => machine
  const open = () => trigger.open()

  // trigger.open drives panel-side state resets (Cascader has no internal
  // open — the trigger owns it exclusively).
  createEffect(() => open(), (isOpen) => {
    if (isOpen) {
      // Reset the search when the panel opens (antd behavior), then seed
      // the active trail to the current selection's path.
      machine.clearSearch()
      const p = machine.path()
      if (p?.length) machine.activate(p, 'hover')
    } else {
      machine.clearSearch()
    }
  })

  const [panelSearchFocused, setPanelSearchFocused] = createSignal(false)
  const searchInputRef: { current?: HTMLInputElement } = {}
  const setSearchInputRef = (el: HTMLInputElement) => {
    searchInputRef.current = el
  }
  const selectorRef: { current?: HTMLDivElement } = {}
  const setSelectorRef = (el: HTMLDivElement) => {
    selectorRef.current = el
    props.ref?.(el)
  }

  // Focus the panel search input when the dropdown opens (antd).
  // The effect's dual-function form runs its CLEANUP callback outside the
  // effect's owner context in this Solid 2 rc — plain onCleanup there warns
  // [NO_OWNER_CLEANUP] and never runs. Bind to the component owner instead.
  const onOwnerCleanup = createOwnerCleanup()
  createEffect(() => open(), (isOpen) => {
    if (!isOpen) return
    const t = setTimeout(() => {
      if (searchEnabled()) {
        searchInputRef.current?.focus()
      } else {
        selectorRef.current?.focus()
      }
    }, 30)
    onOwnerCleanup(() => clearTimeout(t))
  })

  const searchEnabled = () => !!props.showSearch
  const searching = () => machine.searchValue() !== ''

  const showClear = () =>
    m().value().length > 0 && !resolvedDisabled() && !searching()

  // ---- display -------------------------------------------------------------

  const displayText = () => {
    const p = m().path()
    if (!p?.length) return undefined
    return m().labelPath(p).join(props.separator)
  }

  const displayedTags = () => {
    const nodes = m().selectedNodes()
    const labels = nodes.map(chain => chain.map(n => n.label).join(props.separator))
    if (props.maxTagCount === undefined || labels.length <= props.maxTagCount) {
      return labels.map((label, i) => ({ label, trail: m().value()[i] }))
    }
    return labels.slice(0, props.maxTagCount).map((label, i) => ({ label, trail: m().value()[i] }))
  }
  const omittedCount = () => {
    const total = m().value().length
    return props.maxTagCount === undefined || total <= props.maxTagCount ? 0 : total - props.maxTagCount
  }

  // ---- interactions ----------------------------------------------------------

  // The trigger's NATIVE click on the selector stops propagation before
  // Solid's delegated handlers run — × buttons must use pointerdown (the
  // Select pitfall).
  const handleClearPointerDown = (e: PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    m().clear()
  }

  const handleTagClosePointerDown = (e: PointerEvent, trail: Array<string | number>) => {
    e.preventDefault()
    e.stopPropagation()
    if (m().isCheckable()) {
      // checkable stores leaves — uncheck this trail's leaves
      m().toggleCheck(trail)
    } else {
      m().store().deselect(trailKeyOf(trail))
    }
  }

  const trailKeyOf = (trail: Array<string | number>) =>
    trail.map(v => `${typeof v}:${v}`).join('/')

  const handleSelectorKeyDown = (e: KeyboardEvent) => {
    if (resolvedDisabled()) return
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (!open()) trigger.setOpen(true)
        return
      case 'Escape':
        if (open()) {
          e.preventDefault()
          trigger.setOpen(false)
        }
        return
      case 'ArrowDown':
        e.preventDefault()
        if (!open()) trigger.setOpen(true)
        return
    }
  }

  /** A row in the columns menu. */
  const handleOptionPointer = (value: string | number, parentTrail: Array<string | number>) => ({
    onClick: () => {
      m().activate([...parentTrail, value], 'click')
    },
    onMouseEnter: () => {
      if (props.expandTrigger === 'hover') {
        m().activate([...parentTrail, value], 'hover')
      }
    },
  })

  const handleCheckboxPointerDown = (e: PointerEvent, trail: Array<string | number>) => {
    e.preventDefault()
    e.stopPropagation()
    m().toggleCheck(trail)
  }

  /** A flat search-result row: click commits the path. */
  const handleSearchItemClick = (path: Array<string | number>) => {
    if (m().isCheckable()) {
      m().toggleCheck(path)
      return
    }
    m().activate(path, 'click')
    if (!m().isMultiple()) trigger.setOpen(false)
  }

  const searchKeyOf = (path: Array<string | number>) => trailKeyOf(path)

  return (
    <div
      class={twMerge('relative inline-flex w-full', props.class)}
      style={props.style}
      onKeyDown={handleSelectorKeyDown}
    >
      <div
        ref={el => { trigger.triggerRef(el); setSelectorRef(el) }}
        class={cascaderSelectorClass({
          size: resolvedSize(),
          open: open(),
          disabled: resolvedDisabled(),
          status: resolvedStatus(),
          multiple: m().isMultiple(),
        })}
        id={form.id()}
        role="combobox"
        tabindex={resolvedDisabled() ? -1 : 0}
        aria-expanded={open() ? 'true' : 'false'}
        aria-haspopup="listbox"
        aria-disabled={resolvedDisabled() ? 'true' : 'false'}
      >
        <Show
          when={m().isMultiple()}
          fallback={
            <Show
              when={searchEnabled()}
              fallback={
                <Show
                  when={displayText() !== undefined}
                  fallback={
                    <span class={cascaderItemWrapClass({ state: 'placeholder', size: resolvedSize() })}>
                      {props.placeholder ?? '请选择'}
                    </span>
                  }
                >
                  <span class={cascaderItemWrapClass({ state: 'value', size: resolvedSize() })}>
                    {displayText()}
                  </span>
                </Show>
              }
            >
              {/* Searchable single mode: the inline input replaces the label. */}
              <Show
                when={searching()}
                fallback={
                  <span class={cascaderItemWrapClass({ state: displayText() !== undefined ? 'value' : 'placeholder', size: resolvedSize() })}>
                    {displayText() ?? props.placeholder ?? '请选择'}
                  </span>
                }
              >
                <span class="w-px" />
              </Show>
              <input
                ref={setSearchInputRef}
                class={twMerge(cascaderSearchInputClass(), 'absolute', 'opacity-0', 'w-full', 'h-full', 'left-0', 'cursor-auto')}
                value={m().searchValue()}
                disabled={resolvedDisabled()}
                autocomplete="off"
                onInput={e => m().setSearchValue((e.target as HTMLInputElement).value)}
              />
            </Show>
          }
        >
          <div class="flex flex-wrap items-center flex-1 min-w-0">
            <Show when={m().value().length === 0 && !searching()}>
              <span class={cascaderItemWrapClass({ state: 'placeholder', size: resolvedSize() })}>
                {props.placeholder ?? '请选择'}
              </span>
            </Show>
            <For each={displayedTags()}>
              {tag => (
                <span class={cascaderTagWrapClass({ disabled: resolvedDisabled() })}>
                  <span class="truncate max-w-[160px]">{tag.label}</span>
                  <Show when={!resolvedDisabled()}>
                    <span
                      class={cascaderTagCloseWrapClass({ disabled: false })}
                      role="button"
                      aria-label={`移除 ${tag.label}`}
                      tabindex={-1}
                      onPointerDown={e => handleTagClosePointerDown(e, tag.trail)}
                    >
                      <span class="i-mdi-close" />
                    </span>
                  </Show>
                </span>
              )}
            </For>
            <Show when={omittedCount() > 0}>
              <span class={cascaderTagRestClass()}>+{omittedCount()} …</span>
            </Show>
            <Show when={searchEnabled()}>
              <input
                ref={setSearchInputRef}
                class={cascaderSearchInputClass()}
                style={{ width: m().searchValue() ? 'auto' : '2px', 'min-width': '2px' }}
                value={m().searchValue()}
                disabled={resolvedDisabled()}
                autocomplete="off"
                onInput={e => m().setSearchValue((e.target as HTMLInputElement).value)}
              />
            </Show>
          </div>
        </Show>
        <span class={cascaderSuffixWrapClass({ size: resolvedSize() })}>
          <Show when={m().value().length > 0}>
            <span
              class={cascaderClearWrapClass({ visible: showClear() })}
              role="button"
              aria-label="清空"
              tabindex={-1}
              onPointerDown={handleClearPointerDown}
            >
              <span class="i-mdi-close-circle-outline" />
            </span>
          </Show>
          <span class={cascaderArrowWrapClass({ open: open() })}>
            <span class="i-mdi-chevron-down" />
          </span>
        </span>
      </div>

      <Portal>
        <Show when={trigger.mounted()}>
          <div
            ref={(el) => { trigger.layerRef(el) }}
            class={cascaderDropdownWrapClass({ visible: open(), placement: trigger.actualPlacement() })}
            style={trigger.layerStyle()}
            role="listbox"
            tabindex={-1}
          >
            <Show
              when={searchEnabled()}
            >
              <div class={cascaderPanelSearchClass()}>
                <span class="i-mdi-magnify text-[14px] text-on-surface/45 mr-[6px]" />
                <input
                  ref={setSearchInputRef}
                  class={cascaderPanelSearchInputClass()}
                  placeholder="搜索"
                  value={m().searchValue()}
                  disabled={resolvedDisabled()}
                  autocomplete="off"
                  onInput={e => m().setSearchValue((e.target as HTMLInputElement).value)}
                />
              </div>
            </Show>

            <Show
              when={!searching()}
              fallback={
                // ---- search results (flat path list) ----
                <div class="min-w-[180px]">
                  <Show
                    when={m().searchMatches().length > 0}
                    fallback={<div class={cascaderEmptyClass()}>{props.notFoundContent ?? '无匹配结果'}</div>}
                  >
                    <VirtualList items={m().searchMatches()} virtual={props.virtual} height={props.listHeight} itemHeight={props.listItemHeight}>
                      {match => (
                        <div
                          class={cascaderSearchItemWrapClass({
                            selected: m().isSelected(match.path),
                          })}
                          role="option"
                          aria-selected={m().isSelected(match.path) ? 'true' : 'false'}
                          onClick={() => handleSearchItemClick(match.path)}
                          onMouseEnter={() => m().setActiveTrail(match.path)}
                        >
                          <Show when={m().isCheckable()}>
                            <span class={cascaderCheckboxWrapClass({ state: m().parentState(match.path) })}>
                              <span class={cascaderCheckboxMarkWrapClass({ state: m().parentState(match.path) })}>
                                <Show when={m().parentState(match.path) === 'checked'} fallback={<span class="i-mdi-minus" />}>
                                  <span class="i-mdi-check" />
                                </Show>
                              </span>
                            </span>
                          </Show>
                          {match.nodes.map(n => n.label).join(props.separator)}
                        </div>
                      )}
                    </VirtualList>
                  </Show>
                </div>
              }
            >
              {/* ---- multi-column menu ---- */}
              <div class={cascaderColumnsClass()}>
                <For each={m().trailOptions(m().activeTrail())}>
                  {(column, level) => (
                    <div class={cascaderColumnClass()} style={{ 'max-height': 'none', overflow: 'hidden' }}>
                      <VirtualList items={column} virtual={props.virtual} height={props.listHeight} itemHeight={props.listItemHeight} activeIndex={column.findIndex(option => option.value === m().activeTrail()[level()])}>
                        {opt => {
                          const trail = () => [...m().activeTrail().slice(0, level()), opt.value]
                          const state = () => m().isCheckable() ? m().parentState(trail()) : null
                          return (
                            <div
                              class={cascaderOptionWrapClass({
                                selected: m().isSelected(trail()),
                                active: m().activeTrail()[level()] === opt.value,
                                disabled: opt.disabled,
                              })}
                              role="option"
                              aria-selected={m().isSelected(trail()) ? 'true' : 'false'}
                              {...handleOptionPointer(opt.value, m().activeTrail().slice(0, level()))}
                            >
                              <Show when={m().isCheckable()}>
                                <span
                                  class={cascaderCheckboxWrapClass({ state: state() ?? 'unchecked' })}
                                  onPointerDown={e => handleCheckboxPointerDown(e, trail())}
                                >
                                  <span class={cascaderCheckboxMarkWrapClass({ state: state() ?? 'unchecked' })}>
                                    <Show when={state() === 'checked'} fallback={<span class="i-mdi-minus" />}>
                                      <span class="i-mdi-check" />
                                    </Show>
                                  </span>
                                </span>
                              </Show>
                              <span class="truncate flex-1">{opt.label}</span>
                              <Show when={!!opt.children?.length || opt.loading}>
                                <span class={cascaderOptionExpandWrapClass({ active: m().activeTrail()[level()] === opt.value })}>
                                  <Show when={!opt.loading} fallback={<span class="i-mdi-loading animate-spin" />}>
                                    <span class="i-mdi-chevron-right" />
                                  </Show>
                                </span>
                              </Show>
                            </div>
                          )
                        }}
                      </VirtualList>
                      <Show when={column.length === 0}>
                        <div class={cascaderEmptyClass()}>无选项</div>
                      </Show>
                    </div>
                  )}
                </For>
              </div>
            </Show>
          </div>
        </Show>
      </Portal>
    </div>
  )
}

export default Cascader
