import { ConfigPortal as Portal } from '../ConfigProvider/Portal'
import { useComponentProps } from '../ConfigProvider/context'
import { Component, For, Show, createEffect, createSignal, createUniqueId, merge, untrack, useContext } from 'solid-js'
import { type JSX } from '@solidjs/web'
import { twMerge } from 'tailwind-merge'
import {
  createOwnerCleanup,
  createTrigger,
  createTreeSelect,
  type TreeSelectNode,
} from 'upthrust-competence'
import type { SizeType } from '../../common/type'
import { FormItemContext, useFormItem } from '../Input/context'
import { TreeInPanel } from '../Tree'
import { createDelayedArrow } from '../../utils/clearableArrow'
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
  /** Show the clear button while a value is selected. */
  allowClear?: boolean
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
  /** Render connector lines in the dropdown tree. */
  showLine?: boolean
  /** Ant Design-compatible alias for showLine. */
  treeLine?: boolean
  /** Render default or custom node icons in the dropdown tree. */
  showIcon?: boolean
  /** Ant Design-compatible alias for showIcon. */
  treeIcon?: boolean
  /** Custom node icon renderer, called with the node and its expanded state. */
  icon?: (node: TreeSelectNode, expanded: boolean) => JSX.Element
  /** Custom node title renderer. */
  titleRender?: (node: TreeSelectNode) => JSX.Element
  /** Indentation between tree levels, in pixels. */
  indent?: number
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
  const fieldContext = useContext(FormItemContext)
  const hasExplicitValue = Object.prototype.hasOwnProperty.call(providedProps, 'value')

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
    get value() {
      const value = form.value() as TreeSelectProps['value']
      return value === undefined && (hasExplicitValue || fieldContext?.id() !== undefined) ? [] : value
    },
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
      if (props.onChange) props.onChange(value, nodes)
      else form.onChange(value)
    },
    get onSelect() { return props.onSelect },
    get onDeselect() { return props.onDeselect },
    get onSearch() { return props.onSearch },
    get onClear() { return props.onClear },
  })

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
  const open = () => !resolvedDisabled() && trigger.open()
  const treeId = `tree-select-tree-${createUniqueId()}`

  createEffect(() => open(), (isOpen) => {
    machine.setOpen(isOpen)
  })

  const selectorRef: { current?: HTMLDivElement } = {}
  const [selectorWidth, setSelectorWidth] = createSignal(0, { ownedWrite: true })
  let sizeObserver: ResizeObserver | undefined
  const setSelectorRef = (el: HTMLDivElement) => {
    selectorRef.current = el
    const measure = () => setSelectorWidth(el.getBoundingClientRect().width)
    measure()
    if (typeof ResizeObserver !== 'undefined') {
      sizeObserver?.disconnect()
      sizeObserver = new ResizeObserver(measure)
      sizeObserver.observe(el)
    }
    untrack(() => props.ref?.(el))
  }
  const onOwnerCleanup = createOwnerCleanup()
  onOwnerCleanup(() => sizeObserver?.disconnect())
  const inputRef: { current?: HTMLInputElement } = {}
  const setInputRef = (el: HTMLInputElement) => {
    inputRef.current = el
  }

  // Focus the inline search input when the dropdown opens (antd).
  // The effect's dual-function form runs its CLEANUP callback outside the
  // effect's owner context in this Solid 2 rc — plain onCleanup there warns
  // [NO_OWNER_CLEANUP] and never runs. Bind to the component owner instead.
  createEffect(() => open(), (isOpen) => {
    if (!isOpen) return
    const t = setTimeout(() => {
      if (searchEnabled()) inputRef.current?.focus()
      else selectorRef.current?.focus()
    }, 30)
    onOwnerCleanup(() => clearTimeout(t))
  })

  const searching = () => m().searchValue() !== ''
  const hasTree = () => m().tree().displayTree().length > 0

  const showClear = () =>
    !!props.allowClear && m().value().length > 0 && !resolvedDisabled() && !searching()
  const showArrow = createDelayedArrow(showClear)

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

  // The trigger listens for native clicks on the selector. Inner buttons
  // handle clicks directly and stop them before they reach the trigger.
  const stopInnerPointerDown = (e: PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleClearPointerDown = (e: PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const bindNativeClick = (el: HTMLElement, handler: (e: MouseEvent) => void) => {
    el.addEventListener('click', handler)
    onOwnerCleanup(() => el.removeEventListener('click', handler))
  }

  const handleClearClick = (e: MouseEvent) => {
    e.stopPropagation()
    if (!resolvedDisabled()) m().clear()
  }

  const handleTagCloseClick = (e: MouseEvent, key: string | number) => {
    e.stopPropagation()
    if (resolvedDisabled()) return
    m().removeKey(key)
  }

  const handleSearchKeyDown = (e: KeyboardEvent) => {
    if (resolvedDisabled()) return
    if (!open()) return
    switch (e.key) {
      case 'Escape':
        e.preventDefault(); e.stopPropagation(); trigger.setOpen(false)
        return
      case 'ArrowDown':
      case 'ArrowUp':
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'Home':
      case 'End':
        e.preventDefault(); e.stopPropagation(); m().tree().navigate(e.key)
        return
      case 'Enter':
        e.preventDefault(); e.stopPropagation()
        const active = m().tree().activeKey()
        if (active === undefined) return
        if (m().isCheckable()) m().toggleCheck(active)
        else {
          m().pickNode(active)
          if (!m().isMultiple()) m().tree().clear()
        }
        if (!m().isMultiple()) { trigger.setOpen(false); selectorRef.current?.focus() }
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
    if (m().isCheckable()) {
      m().toggleCheck(value)
      return
    }
    m().pickNode(value)
    if (!m().isMultiple()) {
      m().tree().clear()
      trigger.setOpen(false)
      selectorRef.current?.focus()
    }
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
        aria-controls={open() && hasTree() ? treeId : undefined}
        aria-invalid={resolvedStatus() === 'error' ? 'true' : undefined}
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
                aria-label="搜索树节点"
                aria-controls={open() && hasTree() ? treeId : undefined}
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
              <span class={twMerge(treeSelectItemClass({ state: 'placeholder', size: resolvedSize() }), 'ml-[7px]')}>
                {props.placeholder ?? '请选择'}
              </span>
            </Show>
            <For each={displayedTags()}>
              {tag => (
                <span class={treeSelectTagWrapClass({ disabled: resolvedDisabled() })}>
                  <span class="truncate max-w-[160px]">{tag.label}</span>
                  <Show when={!resolvedDisabled()}>
                    <button
                      type="button"
                      ref={el => bindNativeClick(el, e => handleTagCloseClick(e, tag.key))}
                      class={twMerge(treeSelectTagCloseWrapClass(), 'border-none bg-transparent p-0')}
                      aria-label={`移除 ${tag.label}`}
                      onPointerDown={stopInnerPointerDown}
                    >
                      <span class="i-mdi-close" />
                    </button>
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
                aria-label="搜索树节点"
                aria-controls={open() && hasTree() ? treeId : undefined}
                disabled={resolvedDisabled()}
                autocomplete="off"
                onInput={e => m().setSearchValue((e.target as HTMLInputElement).value)}
                onKeyDown={handleSearchKeyDown}
              />
            </Show>
          </div>
        </Show>
        <span class={treeSelectSuffixWrapClass({ size: resolvedSize() })}>
          <Show when={props.allowClear}>
            <button
              type="button"
              ref={el => bindNativeClick(el, handleClearClick)}
              class={twMerge(treeSelectClearWrapClass({ visible: showClear() }), 'border-none bg-transparent p-0')}
              aria-label="清空"
              tabindex={showClear() ? 0 : -1}
              onPointerDown={handleClearPointerDown}
            >
              <span class="i-mdi-close" />
            </button>
          </Show>
          <Show when={!showClear() && showArrow()}>
            <span class={treeSelectArrowWrapClass({ open: open() })}>
              <span class="i-mdi-chevron-down" />
            </span>
          </Show>
        </span>
      </div>

      <Portal>
        <Show when={trigger.mounted()}>
          <div
            ref={(el) => { trigger.layerRef(el) }}
            class={treeSelectDropdownWrapClass({ visible: open(), placement: trigger.actualPlacement() })}
            style={{
              ...trigger.layerStyle(),
              width: props.style?.width !== undefined ? `${selectorWidth()}px` : 'max-content',
              'min-width': props.style?.width === undefined && selectorWidth() > 0 ? `${selectorWidth()}px` : undefined,
            }}
            aria-hidden={open() ? undefined : 'true'}
            inert={!open()}
            tabindex={-1}
          >
            <Show
              when={hasTree()}
              fallback={<div class={treeSelectEmptyClass()}>{props.notFoundContent ?? '无数据'}</div>}
            >
              <TreeInPanel machine={m().tree()} treeId={treeId} multiple={m().isMultiple()} onPick={handlePick} virtual={props.virtual} listHeight={props.listHeight} listItemHeight={props.listItemHeight} showLine={props.treeLine ?? props.showLine} showIcon={props.treeIcon ?? props.showIcon} icon={props.icon} titleRender={props.titleRender} indent={props.indent} />
            </Show>
          </div>
        </Show>
      </Portal>
    </div>
  )
}

export default TreeSelect
