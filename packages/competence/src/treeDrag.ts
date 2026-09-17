import { createSignal } from 'solid-js'
import { createOwnerCleanup } from './utils'
import type { TreeSelectNode, TreeIndex } from './tree'
export type TreeDropPosition = -1 | 0 | 1
export interface TreeDragInfo { node: TreeSelectNode; event?: DragEvent }
export interface TreeDropInfo extends TreeDragInfo {
  dragNode: TreeSelectNode
  dragNodesKeys: Array<string | number>
  /** -1 before, 0 inside, 1 after the target node. */
  dropPosition: TreeDropPosition
  dropToGap: boolean
}
export interface TreeDragConfig {
  draggable?: boolean | ((node: TreeSelectNode) => boolean)
  allowDrop?: (info: { dragNode: TreeSelectNode; dropNode: TreeSelectNode; dropPosition: TreeDropPosition }) => boolean
  onDragStart?: (info: TreeDragInfo) => void
  onDragEnter?: (info: TreeDragInfo) => void
  onDragOver?: (info: TreeDragInfo) => void
  onDragLeave?: (info: TreeDragInfo) => void
  onDragEnd?: (info: TreeDragInfo) => void
  onDrop?: (info: TreeDropInfo) => void
}
export type TreeDragIns = ReturnType<typeof createTreeDrag>
export function createTreeDrag(config: TreeDragConfig, tree: {
  getNode: (key: string | number) => TreeSelectNode | undefined
  nodeIndex: () => TreeIndex
  isDisabled: (key: string | number) => boolean
  expand: (key: string | number) => void
}) {
  const [draggingKey, setDraggingKey] = createSignal<string | number | undefined>(undefined, { ownedWrite: true })
  const [dropTarget, setDropTarget] = createSignal<{ key: string | number; position: TreeDropPosition } | undefined>(undefined, { ownedWrite: true })
  let source: string | number | undefined
  let hoverPosition: TreeDropPosition | undefined
  let hoverKey: string | number | undefined
  let timer: ReturnType<typeof setTimeout> | undefined
  createOwnerCleanup()(() => clearTimeout(timer))
  const isDraggable = (key: string | number) => {
    const node = tree.getNode(key)
    return !!node && !tree.isDisabled(key) && (typeof config.draggable === 'function' ? config.draggable(node) : !!config.draggable)
  }
  const canDrop = (key: string | number, position: TreeDropPosition) => {
    if (source === undefined || source === key || !isDraggable(source) || tree.isDisabled(key)) return false
    const dragNode = tree.getNode(source), dropNode = tree.getNode(key)
    if (!dragNode || !dropNode || tree.nodeIndex().get(key)?.path.includes(source)) return false
    return config.allowDrop?.({ dragNode, dropNode, dropPosition: position }) !== false
  }
  const startDrag = (key: string | number, event?: DragEvent) => {
    if (!isDraggable(key)) return false
    source = key; setDraggingKey(key); config.onDragStart?.({ node: tree.getNode(key)!, event }); return true
  }
  const endDrag = (event?: DragEvent) => {
    const node = source === undefined ? undefined : tree.getNode(source)
    clearTimeout(timer); hoverKey = undefined; source = undefined; setDraggingKey(undefined); setDropTarget(undefined)
    if (node) config.onDragEnd?.({ node, event })
  }
  const dragOver = (key: string | number, position: TreeDropPosition, event?: DragEvent) => {
    if (!canDrop(key, position)) { clearTimeout(timer); hoverKey = undefined; setDropTarget(undefined); return false }
    setDropTarget({ key, position })
    const node = tree.getNode(key)!
    if (hoverKey !== key || hoverPosition !== position) {
      config.onDragEnter?.({ node, event }); clearTimeout(timer); hoverKey = key; hoverPosition = position
      if (position === 0 && node.children?.length) timer = setTimeout(() => { if (canDrop(key, 0)) tree.expand(key) }, 500)
    }
    if (position !== 0) clearTimeout(timer)
    config.onDragOver?.({ node, event }); return true
  }
  const dragLeave = (key: string | number, event?: DragEvent) => {
    clearTimeout(timer); hoverKey = undefined; setDropTarget(undefined)
    const node = tree.getNode(key); if (node) config.onDragLeave?.({ node, event })
  }
  const drop = (key: string | number, position: TreeDropPosition, event?: DragEvent) => {
    if (!canDrop(key, position)) { endDrag(event); return false }
    const dragNode = tree.getNode(source!)!, node = tree.getNode(key)!
    const dragNodesKeys = [...tree.nodeIndex()].filter(([, entry]) => entry.path.includes(source!)).map(([key]) => key)
    try { config.onDrop?.({ node, dragNode, dragNodesKeys, dropPosition: position, dropToGap: position !== 0, event }) }
    finally { endDrag(event) }
    return true
  }
  return { draggingKey, dropTarget, isDraggable, canDrop, startDrag, dragOver, dragLeave, endDrag, drop }
}

/** Immutable reorder helper. Tree data remains owned by the caller. */
export function moveTreeNode(nodes: TreeSelectNode[], source: string | number, target: string | number, position: TreeDropPosition): TreeSelectNode[] {
  let picked: TreeSelectNode | undefined
  const contains = (list: TreeSelectNode[], key: string | number): boolean => list.some(node => node.value === key || contains(node.children ?? [], key))
  const locate = (list: TreeSelectNode[]): TreeSelectNode | undefined => { for (const node of list) { if (node.value === source) return node; const found = locate(node.children ?? []); if (found) return found } }
  picked = locate(nodes)
  if (!picked || source === target || contains(picked.children ?? [], target) || !contains(nodes, target)) return nodes
  const remove = (list: TreeSelectNode[]): TreeSelectNode[] => list.filter(node => node.value !== source).map(node => node.children ? { ...node, children: remove(node.children) } : node)
  const insert = (list: TreeSelectNode[]): TreeSelectNode[] => list.flatMap(node => {
    if (node.value === target) {
      if (position === 0) return [{ ...node, children: [...(node.children ?? []), picked!] }]
      return position === -1 ? [picked!, node] : [node, picked!]
    }
    return [node.children ? { ...node, children: insert(node.children) } : node]
  })
  return insert(remove(nodes))
}
