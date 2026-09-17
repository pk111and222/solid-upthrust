import { createMemo, createSignal } from 'solid-js'

export interface VirtualListConfig<T> {
  items: readonly T[]
  height?: number
  itemHeight?: number
  overscan?: number
  virtual?: boolean
}
/** Fixed-height viewport math shared by selectors; never touches the DOM. */
export function createVirtualList<T>(config: VirtualListConfig<T>) {
  const [offset, setOffset] = createSignal(0, { ownedWrite: true })
  const itemHeight = () => Math.max(1, config.itemHeight ?? 32)
  const height = () => Math.max(1, config.height ?? 256)
  const totalHeight = () => config.items.length * itemHeight()
  const scrollTop = () => Math.min(offset(), Math.max(0, totalHeight() - height()))
  const start = createMemo(() => config.virtual === false ? 0 : Math.max(0, Math.floor(scrollTop() / itemHeight()) - (config.overscan ?? 3)))
  const end = createMemo(() => config.virtual === false ? config.items.length : Math.min(config.items.length, Math.ceil((scrollTop() + height()) / itemHeight()) + (config.overscan ?? 3)))
  const items = createMemo(() => config.items.slice(start(), end()))
  const scrollToIndex = (index: number) => {
    if (index < 0 || index >= config.items.length) return scrollTop()
    const top = index * itemHeight(), bottom = top + itemHeight()
    const next = top < scrollTop() ? top : bottom > scrollTop() + height() ? bottom - height() : scrollTop()
    setOffset(next)
    // Solid batches writes. The DOM must receive the computed offset now,
    // not the previous signal value, or keyboard navigation lags one row.
    return Math.min(next, Math.max(0, totalHeight() - height()))
  }
  return { items, start, end, itemHeight, height, totalHeight, scrollTop, scrollToIndex, setScrollTop: (value: number) => setOffset(Math.max(0, value)), offsetTop: () => start() * itemHeight() }
}
