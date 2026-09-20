import VirtualList from '../_VirtualList'
import { useComponentProps } from '../ConfigProvider/context'
import { type Component, For, Show, createEffect, createMemo, onCleanup } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { twMerge } from 'tailwind-merge'
import { createTree, type TreeConfig, type TreeIns, type TreeSelectNode } from 'upthrust-competence'
import { TREE_SWITCHER_ICON, treeCheckboxMarkWrapClass, treeCheckboxWrapClass, treeNodeLabelWrapClass, treeNodeWrapClass, treeRootClass, treeSwitcherWrapClass, treeChildrenWrapClass, treeChildrenInnerClass } from './styles'

export type { TreeSelectNode as TreeNode }
export { moveTreeNode } from 'upthrust-competence'
export type { TreeDropInfo, TreeDragInfo, TreeDropPosition } from 'upthrust-competence'
export interface TreeProps extends TreeConfig {
  /** Standalone Tree defaults to selection without checkboxes. */
  checkable?: boolean
  showLine?: boolean
  showIcon?: boolean
  indent?: number
  showSearch?: boolean
  searchValue?: string
  onSearch?: (value: string) => void
  searchPlaceholder?: string
  titleRender?: (node: TreeSelectNode) => JSX.Element
  icon?: (node: TreeSelectNode, expanded: boolean) => JSX.Element
  notFoundContent?: JSX.Element
  'aria-label'?: string
  class?: string
  style?: JSX.CSSProperties
  ref?: (el: HTMLDivElement) => void
}

interface TreeViewProps {
  machine: TreeIns
  virtual?: boolean
  height?: number
  itemHeight?: number
  indent?: number
  showLine?: boolean
  showIcon?: boolean
  multiple?: boolean
  titleRender?: TreeProps['titleRender']
  icon?: TreeProps['icon']
  onPick?: (key: string | number) => void
  notFoundContent?: JSX.Element
  label?: string
}

/** Shared renderer for standalone Tree and the TreeSelect popup. */
const TreeView: Component<TreeViewProps> = props => {
  const m = () => props.machine
  const rows = new Map<string | number, HTMLDivElement>()
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.target !== event.currentTarget || event.defaultPrevented || event.isComposing) return
    if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter', ' '].includes(event.key)) return
    event.preventDefault()
    event.stopPropagation()
    if (props.onPick && event.key === 'Enter') {
      const key = m().activeKey()
      if (key !== undefined && m().isSelectable(key)) props.onPick(key)
      return
    }
    const next = m().navigate(event.key)
    if (next !== undefined) queueMicrotask(() => rows.get(next)?.focus())
  }
  const flatRows = createMemo(() => {
    const result: Array<{ node: TreeSelectNode; level: number; position: number; count: number }> = []
    const visit = (nodes: TreeSelectNode[], level: number) => nodes.forEach((node, index) => {
      result.push({ node, level, position: index + 1, count: nodes.length })
      if (node.children && (node.__forceExpanded || m().isExpanded(node.value))) visit(node.children, level + 1)
    })
    visit(m().displayTree(), 0)
    return result
  })
  const Node: Component<{ flat?: boolean; node: TreeSelectNode; level: number; position: number; count: number }> = p => {
    const nodeKey = p.node.value
    let rowElement: HTMLDivElement | undefined
    onCleanup(() => { if (rows.get(nodeKey) === rowElement) rows.delete(nodeKey) })
    const disabled = () => m().isDisabled(p.node.value)
    const expanded = () => p.node.__forceExpanded === true || m().isExpanded(p.node.value)
    const hasChildren = () => !!p.node.children?.length
    const state = () => m().checkState(p.node.value)
    const selected = () => m().isSelected(p.node.value)
    const dropPosition = (event: DragEvent): -1 | 0 | 1 => {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
      const ratio = rect.height ? (event.clientY - rect.top) / rect.height : 0.5
      return ratio < 0.25 ? -1 : ratio > 0.75 ? 1 : 0
    }
    const dropClass = () => {
      const target = m().dropTarget()
      if (target?.key !== p.node.value) return ''
      return target.position === -1 ? 'border-t-2 border-solid border-primary' : target.position === 1 ? 'border-b-2 border-solid border-primary' : 'bg-primary/10 outline outline-1 outline-primary'
    }
    return <div ref={el => { rowElement = el; rows.set(p.node.value, el) }} tabindex={!disabled() && m().activeKey() === p.node.value ? 0 : -1}
      onFocus={event => { if (event.target === event.currentTarget) m().setActiveKey(p.node.value) }} onKeyDown={onKeyDown}
      class="outline-none [&:focus-visible>div:first-child]:outline-offset-[-2px] [&:focus-visible>div:first-child]:outline-solid [&:focus-visible>div:first-child]:outline-2 [&:focus-visible>div:first-child]:outline-primary" role="treeitem" aria-label={p.node.label} aria-level={p.level + 1} aria-posinset={p.position} aria-setsize={p.count}
      aria-expanded={hasChildren() ? expanded() ? 'true' : 'false' : undefined} aria-selected={m().isSelectable(p.node.value) ? selected() ? 'true' : 'false' : undefined}
      aria-checked={m().isCheckableNode(p.node.value) ? state() === 'indeterminate' ? 'mixed' : state() === 'checked' ? 'true' : 'false' : undefined}
      aria-disabled={disabled() ? 'true' : 'false'} style={p.flat ? { 'padding-left': `${p.level * (props.indent ?? 24)}px` } : undefined}>
      <div class={twMerge(treeNodeWrapClass({ selected: selected(), disabled: disabled() }), dropClass(), 'focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-[-2px]')}
        draggable={m().isDraggable(p.node.value) ? 'true' : 'false'}
        onDragStart={e => { e.stopPropagation(); if (!m().startDrag(p.node.value, e)) { e.preventDefault(); return }; e.dataTransfer?.setData('text/plain', String(p.node.value)); if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move' }}
        onDragOver={e => { e.stopPropagation(); if (m().dragOver(p.node.value, dropPosition(e), e)) { e.preventDefault(); if (e.dataTransfer) e.dataTransfer.dropEffect = 'move' } }}
        onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) m().dragLeave(p.node.value, e) }}
        onDrop={e => { e.preventDefault(); e.stopPropagation(); m().drop(p.node.value, dropPosition(e), e) }}
        onDragEnd={e => { e.stopPropagation(); m().endDrag(e) }}
        onClick={event => {
          if (disabled() || event.defaultPrevented) return
          if (event.target instanceof Element && event.target.closest('input, button, a, select, textarea, [contenteditable="true"], [role="button"]')) return
          m().setActiveKey(p.node.value)
          rows.get(p.node.value)?.focus()
          if (props.onPick) props.onPick(p.node.value)
          else m().select(p.node.value)
        }}>
        <span class={treeSwitcherWrapClass({ leaf: !hasChildren(), expanded: expanded() })} aria-hidden="true"
          onClick={event => { event.stopPropagation(); m().toggleExpand(p.node.value) }}>
          <span class={TREE_SWITCHER_ICON} />
        </span>
        <Show when={m().isCheckableNode(p.node.value)}>
          <span class={treeCheckboxWrapClass({ state: state(), disabled: disabled() })} aria-hidden="true"
            onClick={event => { event.stopPropagation(); if (disabled()) return; m().setActiveKey(p.node.value); rows.get(p.node.value)?.focus(); m().toggleCheck(p.node.value) }}>
            <span class={treeCheckboxMarkWrapClass({ state: state(), disabled: disabled() })}>
              <Show when={state() !== 'unchecked'}><span class={state() === 'checked' ? 'i-mdi-check' : 'i-mdi-minus'} /></Show>
            </span>
          </span>
        </Show>
        <Show when={props.showIcon}>
          <span class="inline-flex text-on-surface-variant" aria-hidden="true">{props.icon?.(p.node, expanded()) ?? <span class={hasChildren() ? expanded() ? 'i-mdi-folder-open-outline' : 'i-mdi-folder-outline' : 'i-mdi-file-outline'} />}</span>
        </Show>
        <span class={treeNodeLabelWrapClass({ selected: selected(), disabled: disabled(), matched: m().matchSet().has(p.node.value) })}>
          {props.titleRender?.(p.node) ?? p.node.label}
        </span>
      </div>
      <Show when={!p.flat && hasChildren()}>
        <div class={treeChildrenWrapClass({ open: expanded() })} aria-hidden={expanded() ? undefined : 'true'} inert={!expanded()}>
          <div class={treeChildrenInnerClass()}>
            <div role="group" class={props.showLine ? 'border-l border-dashed border-outline-variant' : ''}
              style={{ 'margin-left': `${(props.indent ?? 24) / 2}px`, 'padding-left': `${(props.indent ?? 24) / 2}px` }}>
              <For each={p.node.children}>{(node, index) => <Node node={node} level={p.level + 1} position={index() + 1} count={p.node.children?.length ?? 0} />}</For>
            </div>
          </div>
        </div>
      </Show>
    </div>
  }
  return <div role="tree" aria-label={props.label ?? '树形控件'} aria-multiselectable={props.multiple ? 'true' : 'false'} aria-disabled={m().isWidgetDisabled() ? 'true' : 'false'}>
    <Show when={m().displayTree().length} fallback={<div class="py-4 text-center text-[14px] text-on-surface-variant">{props.notFoundContent ?? '暂无数据'}</div>}>
    <Show when={props.virtual} fallback={<For each={m().displayTree()}>
      {(node, index) => <Node node={node} level={0} position={index() + 1} count={m().displayTree().length} />}
    </For>}>
      <VirtualList items={flatRows()} virtual height={props.height} itemHeight={props.itemHeight} activeIndex={flatRows().findIndex(row => row.node.value === m().activeKey())}>
        {row => <Node {...row} flat />}
      </VirtualList>
    </Show>
    </Show>
  </div>
}

const Tree: Component<TreeProps> = providedProps => {
  const props = useComponentProps('Tree', providedProps)
  const checkable = () => props.checkable ?? (props.checkedKeys !== undefined || props.defaultCheckedKeys !== undefined)
  const machine = createTree({
    get treeData() { return props.treeData },
    get expandedKeys() { return props.expandedKeys },
    get defaultExpandedKeys() { return props.defaultExpandedKeys },
    get defaultExpandAll() { return props.defaultExpandAll },
    get selectedKeys() { return props.selectedKeys },
    get defaultSelectedKeys() { return props.defaultSelectedKeys },
    get checkedKeys() { return props.checkedKeys },
    get defaultCheckedKeys() { return props.defaultCheckedKeys },
    get checkable() { return checkable() },
    get checkStrictly() { return props.checkStrictly },
    get multiple() { return props.multiple },
    get selectable() { return props.selectable },
    get disabled() { return props.disabled },
    get onExpand() { return props.onExpand },
    get onSelect() { return props.onSelect },
    get onCheck() { return props.onCheck },
    get draggable() { return props.draggable },
    get allowDrop() { return props.allowDrop },
    get onDragStart() { return props.onDragStart },
    get onDragEnter() { return props.onDragEnter },
    get onDragOver() { return props.onDragOver },
    get onDragLeave() { return props.onDragLeave },
    get onDragEnd() { return props.onDragEnd },
    get onDrop() { return props.onDrop },
  })
  createEffect(() => props.searchValue, value => { if (value !== undefined) machine.setSearchValue(value) })
  return <div ref={props.ref} class={twMerge(treeRootClass({ showLine: props.showLine }), props.class)} style={props.style}>
    <Show when={props.showSearch}>
      <input type="search" class="w-full box-border h-[32px] mb-3 px-2 border border-solid border-outline-variant rounded bg-transparent text-on-surface text-[14px] focus:outline-primary"
        aria-label="搜索树节点" placeholder={props.searchPlaceholder ?? '搜索节点'} disabled={props.disabled} value={machine.searchValue()}
        onInput={event => { const value = event.currentTarget.value; if (props.searchValue === undefined) machine.setSearchValue(value); props.onSearch?.(value); if (props.searchValue !== undefined) event.currentTarget.value = props.searchValue }} />
    </Show>
    <TreeView machine={machine} indent={props.indent} showLine={props.showLine} showIcon={props.showIcon} multiple={props.multiple || checkable()}
      titleRender={props.titleRender} icon={props.icon} notFoundContent={props.notFoundContent} label={props['aria-label']} />
  </div>
}

export const TreeInPanel: Component<{ machine: TreeIns; indent?: number; virtual?: boolean; listHeight?: number; listItemHeight?: number; onPick?: (key: string | number) => void }> = props =>
  <div class="overflow-y-auto py-1" style={{ 'max-height': `${props.listHeight ?? 256}px` }}><TreeView machine={props.machine} indent={props.indent} onPick={props.onPick} virtual={props.virtual !== false} height={props.listHeight} itemHeight={props.listItemHeight} /></div>

export default Tree
