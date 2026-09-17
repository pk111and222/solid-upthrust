import { ConfigPortal as Portal } from '../ConfigProvider/Portal'
import { useComponentProps } from '../ConfigProvider/context'
import { Component, For, Show, createEffect, merge } from 'solid-js'
import { type JSX } from '@solidjs/web'
import { twMerge } from 'tailwind-merge'
import {
  createOwnerCleanup,
  createTrigger,
  createTreeSelect,
  type TreeSelectNode,
} from 'upthrust-competence'
import type { SizeType } from '../../common/type'
import { useFormItem } from '../Input/context'
import { TreeInPanel } from '../Tree'
import {
  treeSelectArrowWrapClass,
  treeSelectClearWrapClass,
  treeSelectDropdownWrapClass,
  treeSelectEmptyClass,
  treeSelectItemClass,
  treeSelectSearchInputClass,
  treeSelectSelectorClass,
  treeSelectSuffixWrapClass,
  treeSelectTagCloseWrapClass,
  treeSelectTagRestClass,
  treeSelectTagWrapClass,
} from './styles'

export type { TreeSelectNode }

export interface TreeSelectProps {
  virtual?: boolean
  listHeight?: number
  listItemHeight?: number
  /** Controlled value: single key (single) or key array (multiple). */
  value?: string | number | Array<string | number>
  defaultValue?: string | number | Array<string | number>
  treeData?: TreeSelectNode[]
  /** 'multiple' turns on the checkbox mode. */
  mode?: 'multiple'
  /** Parent↔children linkage when multiple. Default true. */
  treeCheckable?: boolean
  /** Independent parent/child checks (no linkage). Default false. */
  treeCheckStrictly?: boolean
  /** Which nodes the value reports: SHOW_PARENT (default) | SHOW_CHILD | SHOW_ALL. */
  treeCheckStrategy?: 'SHOW_PARENT' | 'SHOW_CHILD' | 'SHOW_ALL'
  disabled?: boolean
  showSearch?: boolean
  placeholder?: string
  size?: SizeType
  status?: 'error' | 'warning'
  /** Max rendered tags before collapsing into "+N …". */
  maxTagCount?: number
  /** Controlled dropdown open. */
  open?: boolean
  defaultOpen?: boolean
  /** Expand every branch in the dropdown tree on first open. Default false. */
  defaultExpandAll?: boolean
  /** Controlled expanded keys of the dropdown tree. */
  expandedKeys?: Array<string | number>
  onExpand?: (expandedKeys: Array<string | number>, info: { node: TreeSelectNode; expanded: boolean }) => void
  onOpenChange?: (open: boolean) => void
  notFoundContent?: string
  id?: string
  class?: string
  style?: JSX.CSSProperties
  onChange?: (
    value: string | number | Array<string | number> | undefined,
    nodes: TreeSelectNode | TreeSelectNode[] | undefined,
  ) => void
  onSelect?: (value: string | number, node: TreeSelectNode) => void
  onDeselect?: (value: string | number, node: TreeSelectNode) => void
  onSearch?: (value: string) => void
  onClear?: () => void
  ref?: (el: HTMLDivElement) => void
}

/**
 * TreeSelect — the antd-style tree picker.
 *
 * COMPOSITION: the headless createTreeSelect rides createTree (index,
 * expand, checkable linkage, search prune) and adds the picker shell:
 * single/multiple value shapes and the SHOW_PARENT strategy collapse.
 * The dropdown layer is createTrigger — the same machine under
 * Select/Cascader. This layer renders the selector box and the portal
 * panel HOSTING the shared Tree renderer (TreeInPanel) driven by the
 * picker's tree machine.
 */
const TreeSelect: Component<TreeSelectProps> = providedProps => {
  const rawProps = useComponentProps('TreeSelect', providedProps)
  const props = merge({}, rawProps)

  const form = useFormItem({
    get value() { return props.value },
    // The Item's store write is driven by the machine's onChange below —
    // no direct pass-through (the nodes payload breaks the (value, event)
    // contract; the Cascader pattern).
    get onChange() { return undefined },
    get disabled() { return props.disabled },
    get id() { return props.id },
    get size() { return props.size },
    get status() { return props.status },
  })

  const resolvedSize = () => props.size ?? form.size() ?? 'middle'
  const resolvedStatus = () => form.status()
  const resolvedDisabled = () => form.disabled()

  const searchEnabled = () => !!props.showSearch

  // Created ONCE (the createMemo-wraps-machine pitfall — see Select).
  const machine = createTreeSelect({
    get value() { return form.value() as TreeSelectProps['value'] },
    get defaultValue() { return props.defaultValue },
    get treeData() { return props.treeData },
    get mode() { return props.mode },
    get treeCheckable() { return props.treeCheckable },
    get treeCheckStrictly() { return props.treeCheckStrictly },
    get treeCheckStrategy() { return props.treeCheckStrategy },
    get disabled() { return resolvedDisabled() },
    get open() { return props.open },
    get defaultOpen() { return props.defaultOpen },
    get defaultExpandAll() { return props.defaultExpandAll },
    get expandedKeys() { return props.expandedKeys },
    get onExpand() { return props.onExpand },
    get onOpenChange() { return props.onOpenChange },
    onChange: (value, nodes) => {
      form.onChange(value)
      props.onChange?.(value, nodes)
    },
    get onSelect() { return props.onSelect },
    get onDeselect() { return props.onDeselect },
    get onSearch() { return props.onSearch },
    get onClear() { return props.onClear },
  })

  const trigger = createTrigger({
    get open() { return props.open },
    get disabled() { return resolvedDisabled() },
    action: 'click',
    placement: 'bottomLeft',
    offset: 4,
    get onOpenChange() { return props.onOpenChange },
  })

  const m = () => machine
  const open = () => trigger.open()

  createEffect(() => open(), (isOpen) => {
    machine.setOpen(isOpen)
  })

  const selectorRef: { current?: HTMLDivElement } = {}
  const setSelectorRef = (el: HTMLDivElement) => {
    selectorRef.current = el
    props.ref?.(el)
  }
  const inputRef: { current?: HTMLInputElement } = {}
  const setInputRef = (el: HTMLInputElement) => {
    inputRef.current = el
  }

  // Focus the inline search input when the dropdown opens (antd).
  // The effect's dual-function form runs its CLEANUP callback outside the
  // effect's owner context in this Solid 2 rc — plain onCleanup there warns
  // [NO_OWNER_CLEANUP] and never runs. Bind to the component owner instead.
  const onOwnerCleanup = createOwnerCleanup()
  createEffect(() => open(), (isOpen) => {
    if (!isOpen) return
    const t = setTimeout(() => {
      if (searchEnabled()) inputRef.current?.focus()
      else selectorRef.current?.focus()
    }, 30)
    onOwnerCleanup(() => clearTimeout(t))
  })

  const searching = () => m().searchValue() !== ''

  const showClear = () =>
    m().value().length > 0 && !resolvedDisabled() && !searching()

  // ---- display ---------------------------------------------------------------

  const displayText = () => {
    const v = m().singleValue()
    if (v === undefined) return undefined
    return m().labelOf(v)
  }

  const displayedTags = () => {
    const keys = m().value()
    const labels = keys.map(k => ({ key: k, label: m().labelOf(k) }))
    if (props.maxTagCount === undefined || labels.length <= props.maxTagCount) return labels
    return labels.slice(0, props.maxTagCount)
  }
  const omittedCount = () => {
    const total = m().value().length
    return props.maxTagCount === undefined || total <= props.maxTagCount ? 0 : total - props.maxTagCount
  }

  // ---- interactions -----------------------------------------------------------

  // The trigger's NATIVE click on the selector stops propagation — the ×
  // and tag-close buttons must use pointerdown (the Select pitfall).
  const handleClearPointerDown = (e: PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    m().clear()
  }

  const handleTagClosePointerDown = (e: PointerEvent, key: string | number) => {
    e.preventDefault()
    e.stopPropagation()
    m().removeKey(key)
  }

  const handleSearchKeyDown = (e: KeyboardEvent) => {
    if (resolvedDisabled()) return
    switch (e.key) {
      case 'Escape':
        if (open()) {
          e.preventDefault()
          trigger.setOpen(false)
        }
        return
      case 'Enter':
        if (open()) {
          e.preventDefault()
          trigger.setOpen(false)
        }
        return
    }
  }

  const handleSelectorKeyDown = (e: KeyboardEvent) => {
    if (resolvedDisabled()) return
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (!open()) trigger.setOpen(true)
        return
      case 'ArrowDown':
        e.preventDefault()
        if (!open()) trigger.setOpen(true)
        return
      case 'Escape':
        if (open()) {
          e.preventDefault()
          trigger.setOpen(false)
        }
        return
    }
  }

  /** A row picked in the panel tree: single commits + closes; multiple
   *  toggles through the tree's own check/select. */
  const handlePick = (value: string | number) => {
    if (m().isMultiple()) return
    m().pickNode(value)
    trigger.setOpen(false)
    selectorRef.current?.focus()
  }

  return (
    <div
      class={twMerge('relative inline-flex w-full', props.class)}
      style={props.style}
      onKeyDown={handleSelectorKeyDown}
    >
      <div
        ref={el => { trigger.triggerRef(el); setSelectorRef(el) }}
        class={treeSelectSelectorClass({
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
        aria-haspopup="tree"
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
                    <span class={treeSelectItemClass({ state: 'placeholder', size: resolvedSize() })}>
                      {props.placeholder ?? '请选择'}
                    </span>
                  }
                >
                  <span class={treeSelectItemClass({ state: 'value', size: resolvedSize() })}>
                    {displayText()}
                  </span>
                </Show>
              }
            >
              {/* Searchable single mode: the inline input replaces the label. */}
              <Show
                when={searching()}
                fallback={
                  <span class={treeSelectItemClass({ state: displayText() !== undefined ? 'value' : 'placeholder', size: resolvedSize() })}>
                    {displayText() ?? props.placeholder ?? '请选择'}
                  </span>
                }
              >
                <span class="w-px" />
              </Show>
              <input
                ref={setInputRef}
                class={twMerge(treeSelectSearchInputClass(), 'absolute', 'opacity-0', 'w-full', 'h-full', 'left-0', 'cursor-auto')}
                value={m().searchValue()}
                disabled={resolvedDisabled()}
                autocomplete="off"
                onInput={e => m().setSearchValue((e.target as HTMLInputElement).value)}
                onKeyDown={handleSearchKeyDown}
              />
            </Show>
          }
        >
          <div class="flex flex-wrap items-center flex-1 min-w-0">
            <Show when={m().value().length === 0 && !searching()}>
              <span class={treeSelectItemClass({ state: 'placeholder', size: resolvedSize() })}>
                {props.placeholder ?? '请选择'}
              </span>
            </Show>
            <For each={displayedTags()}>
              {tag => (
                <span class={treeSelectTagWrapClass({ disabled: resolvedDisabled() })}>
                  <span class="truncate max-w-[160px]">{tag.label}</span>
                  <Show when={!resolvedDisabled()}>
                    <span
                      class={treeSelectTagCloseWrapClass()}
                      role="button"
                      aria-label={`移除 ${tag.label}`}
                      tabindex={-1}
                      onPointerDown={e => handleTagClosePointerDown(e, tag.key)}
                    >
                      <span class="i-mdi-close" />
                    </span>
                  </Show>
                </span>
              )}
            </For>
            <Show when={omittedCount() > 0}>
              <span class={treeSelectTagRestClass()}>+{omittedCount()} …</span>
            </Show>
            <Show when={searchEnabled()}>
              <input
                ref={setInputRef}
                class={treeSelectSearchInputClass()}
                style={{ width: m().searchValue() ? 'auto' : '2px', 'min-width': '2px' }}
                value={m().searchValue()}
                disabled={resolvedDisabled()}
                autocomplete="off"
                onInput={e => m().setSearchValue((e.target as HTMLInputElement).value)}
                onKeyDown={handleSearchKeyDown}
              />
            </Show>
          </div>
        </Show>
        <span class={treeSelectSuffixWrapClass()}>
          <Show when={m().value().length > 0}>
            <span
              class={treeSelectClearWrapClass({ visible: showClear() })}
              role="button"
              aria-label="清空"
              tabindex={-1}
              onPointerDown={handleClearPointerDown}
            >
              <span class="i-mdi-close-circle-outline" />
            </span>
          </Show>
          <span class={treeSelectArrowWrapClass({ open: open() })}>
            <span class="i-mdi-chevron-down" />
          </span>
        </span>
      </div>

      <Portal>
        <Show when={trigger.mounted()}>
          <div
            ref={(el) => { trigger.layerRef(el) }}
            class={treeSelectDropdownWrapClass({ visible: open(), placement: trigger.actualPlacement() })}
            style={trigger.layerStyle()}
            aria-hidden={open() ? undefined : 'true'}
            inert={!open()}
            tabindex={-1}
          >
            <Show
              when={m().tree().displayTree().length > 0}
              fallback={<div class={treeSelectEmptyClass()}>{props.notFoundContent ?? '无数据'}</div>}
            >
              <TreeInPanel machine={m().tree()} onPick={handlePick} virtual={props.virtual} listHeight={props.listHeight} listItemHeight={props.listItemHeight} />
            </Show>
          </div>
        </Show>
      </Portal>
    </div>
  )
}

export default TreeSelect
