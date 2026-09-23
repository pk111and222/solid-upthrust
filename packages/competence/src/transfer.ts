import { createMemo, createSignal, untrack } from 'solid-js'

export type TransferKey = string | number
export type TransferDirection = 'left' | 'right'
export interface TransferItem {
  key: TransferKey
  title: string
  description?: string
  disabled?: boolean
}
export interface TransferConfig<T extends TransferItem = TransferItem> {
  dataSource?: T[]
  targetKeys?: TransferKey[]
  defaultTargetKeys?: TransferKey[]
  selectedKeys?: TransferKey[]
  defaultSelectedKeys?: TransferKey[]
  disabled?: boolean
  oneWay?: boolean
  filterOption?: (input: string, item: T) => boolean
  onChange?: (targetKeys: TransferKey[], direction: TransferDirection, moveKeys: TransferKey[]) => void
  onSelectChange?: (sourceSelectedKeys: TransferKey[], targetSelectedKeys: TransferKey[]) => void
  onSearch?: (direction: TransferDirection, value: string) => void
}

/** Target membership and temporary selection are separate controlled stores. */
export const createTransfer = <T extends TransferItem = TransferItem>(config: TransferConfig<T> = {}) => {
  const [target, setTarget] = createSignal<TransferKey[]>(untrack(() => config.defaultTargetKeys ?? []), { ownedWrite: true })
  const [selected, setSelected] = createSignal<TransferKey[]>(untrack(() => config.defaultSelectedKeys ?? []), { ownedWrite: true })
  const [searches, setSearches] = createSignal({ left: '', right: '' }, { ownedWrite: true })
  const targetKeys = () => config.targetKeys ?? target()
  const selectedKeys = () => config.selectedKeys ?? selected()
  const index = createMemo(() => new Map((config.dataSource ?? []).map(item => [item.key, item])))
  const targetSet = createMemo(() => new Set(targetKeys()))
  const items = (direction: TransferDirection): T[] => direction === 'right'
    ? [...new Set(targetKeys())].flatMap(key => { const item = index().get(key); return item ? [item] : [] })
    : [...index().values()].filter(item => !targetSet().has(item.key))
  const searchValue = (direction: TransferDirection) => searches()[direction]
  const filteredItems = (direction: TransferDirection) => {
    const query = searchValue(direction)
    return items(direction).filter(item => !query || (config.filterOption
      ? config.filterOption(query, item)
      : `${item.title} ${item.description ?? ''}`.toLowerCase().includes(query.toLowerCase())))
  }
  const isDisabled = (key: TransferKey) => !!config.disabled || !index().has(key) || !!index().get(key)?.disabled
  const sideOf = (key: TransferKey): TransferDirection => targetSet().has(key) ? 'right' : 'left'
  const selectedIn = (direction: TransferDirection) => selectedKeys().filter(key => index().has(key) && sideOf(key) === direction)
  const isSelected = (key: TransferKey) => selectedKeys().includes(key)
  const emitSelection = (next: TransferKey[], nextTargets = targetKeys()) => {
    const unique = [...new Set(next)]
    if (config.selectedKeys === undefined) setSelected(unique)
    const targets = new Set(nextTargets)
    config.onSelectChange?.(unique.filter(key => index().has(key) && !targets.has(key)), unique.filter(key => index().has(key) && targets.has(key)))
  }
  const toggleSelect = (key: TransferKey) => {
    if (isDisabled(key)) return
    emitSelection(isSelected(key) ? selectedKeys().filter(k => k !== key) : [...selectedKeys(), key])
  }
  const selectableItems = (direction: TransferDirection) => filteredItems(direction).filter(item => !isDisabled(item.key))
  const selectionState = (direction: TransferDirection) => {
    const available = selectableItems(direction)
    const count = available.filter(item => isSelected(item.key)).length
    return { checked: available.length > 0 && count === available.length, indeterminate: count > 0 && count < available.length, disabled: available.length === 0 }
  }
  /** Select-all acts on the filtered list and preserves hidden selections. */
  const selectAll = (direction: TransferDirection, checked: boolean) => {
    if (config.disabled) return
    const keys = new Set(selectableItems(direction).map(item => item.key))
    if (keys.size === 0) return
    const current = selectedKeys()
    const next = [...new Set(checked ? [...current, ...keys] : current.filter(key => !keys.has(key)))]
    if (next.length === current.length && next.every((key, index) => key === current[index])) return
    emitSelection(next)
  }
  const movableKeys = (direction: TransferDirection) => selectedIn(direction === 'right' ? 'left' : 'right').filter(key => !isDisabled(key))
  const commitMove = (direction: TransferDirection, requested: TransferKey[]) => {
    if (config.disabled) return
    const keys = [...new Set(requested)].filter(key => !isDisabled(key) && sideOf(key) !== direction)
    if (!keys.length) return
    const moving = new Set(keys)
    const next = direction === 'right' ? [...new Set([...targetKeys(), ...keys])] : targetKeys().filter(key => !moving.has(key))
    if (config.targetKeys === undefined) setTarget(next)
    emitSelection(selectedKeys().filter(key => !moving.has(key)), next)
    config.onChange?.(next, direction, keys)
  }
  const move = (direction: TransferDirection) => {
    if (config.oneWay && direction === 'left') return
    commitMove(direction, movableKeys(direction))
  }
  const remove = (key: TransferKey) => commitMove('left', [key])
  const setSearch = (direction: TransferDirection, value: string) => {
    setSearches(previous => ({ ...previous, [direction]: value }))
    config.onSearch?.(direction, value)
  }
  return { targetKeys, selectedKeys, items, filteredItems, searchValue, setSearch, isDisabled, isSelected, selectedIn, toggleSelect, selectionState, selectAll, movableKeys, move, remove }
}
