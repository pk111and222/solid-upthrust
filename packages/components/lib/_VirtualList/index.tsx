import { For, createEffect } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { createVirtualList } from 'upthrust-competence'

export interface VirtualListProps<T> {
  items: readonly T[]
  virtual?: boolean
  height?: number
  itemHeight?: number
  activeIndex?: number
  class?: string
  role?: JSX.HTMLAttributes<HTMLDivElement>['role']
  children: (item: T, index: () => number) => JSX.Element
}
export default function VirtualList<T>(props: VirtualListProps<T>) {
  let viewport: HTMLDivElement | undefined
  const list = createVirtualList({
    get items() { return props.items }, get height() { return props.height },
    get itemHeight() { return props.itemHeight }, get virtual() { return props.virtual },
  })
  createEffect(() => [props.items, props.activeIndex, props.height, props.itemHeight, props.virtual] as const, () => {
    const top = list.scrollToIndex(props.activeIndex ?? -1)
    if (viewport) viewport.scrollTop = top
  })
  return <div ref={viewport} data-virtual-list={props.virtual !== false ? 'true' : 'false'} role={props.role}
    class={props.class} style={{ 'overflow-y': props.virtual === false ? 'visible' : 'auto', 'max-height': `${list.height()}px`, 'overflow-anchor': 'none' }}
    onScroll={e => list.setScrollTop(e.currentTarget.scrollTop)}>
    <div style={props.virtual === false ? undefined : { height: `${list.totalHeight()}px`, position: 'relative' }}>
      <div style={props.virtual === false ? undefined : { transform: `translateY(${list.offsetTop()}px)`, position: 'absolute', top: '0', width: '100%' }}>
        <For each={list.items()}>{(item, index) => <div role="presentation" style={props.virtual === false ? undefined : { height: `${list.itemHeight()}px`, overflow: 'hidden' }}>
          {props.children(item, () => list.start() + index())}
        </div>}</For>
      </div>
    </div>
  </div>
}
