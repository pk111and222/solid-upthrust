import {
  For, children as resolveChildren, createEffect, createMemo, createSignal, omit, onCleanup, untrack, type Accessor,
} from 'solid-js'
import type { JSX } from '@solidjs/web'
import {
  computeMasonryLayout,
  createMasonry,
  createOwnerCleanup,
  resolveMasonryGutter,
  sequentialColumns,
  type MasonryColumns,
  type MasonryGutter,
  type MasonryGutterValue,
} from 'upthrust-competence'
import { mergeClass } from '../../common/merge'
import { masonryItemVariants, masonryVariants, type MasonryItemState } from './styles'

export type { MasonryColumns, MasonryGutter, MasonryGutterValue }

export type MasonryKey = string | number

/** 数据项：key 必须稳定且唯一；column 固定到某一列（从 0 开始，超出范围取最后一列）。 */
export interface MasonryItem<T = unknown> {
  key: MasonryKey
  column?: number
  /** 直接给出内容；优先于 itemRender。 */
  children?: JSX.Element
  data?: T
}

/** itemRender 的参数：column 是响应式 getter，列变化时只更新读取它的地方，不重建内容。 */
export type MasonryItemRenderInfo<T = unknown> = MasonryItem<T> & { index: number; readonly column: number }

/** onLayoutChange 的参数：原数据项加上当前所在列。 */
export type MasonryLayoutItem<T = unknown> = Omit<MasonryItem<T>, 'column'> & { column: number }

type DivAttributes = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'class' | 'style' | 'children' | 'ref'>

export interface MasonryProps<T = unknown> extends DivAttributes {
  /** 列数，默认 3；对象形式按断点取值，未命中时取 xs，再退回 1。 */
  columns?: MasonryColumns
  /** 间距（px 或 small / middle / large），默认 0；数组为 [水平, 垂直]，垂直缺省时同水平；支持按断点取值。 */
  gutter?: MasonryGutter | [MasonryGutter, MasonryGutter]
  /** 数据项；设置后忽略 children。 */
  items?: MasonryItem<T>[]
  /** 渲染数据项（item.children 为空时使用）。 */
  itemRender?: (info: MasonryItemRenderInfo<T>) => JSX.Element
  /** 监听每一项自身的尺寸变化（内容异步变高时开启）。 */
  fresh?: boolean
  /** 本库扩展：按阅读顺序均衡分列（12 项 5 列 → 3,3,2,2,2），不再按最短列放置。 */
  sequential?: boolean
  /** 全部项完成定位后、且各项所在列发生变化时触发。 */
  onLayoutChange?: (items: MasonryLayoutItem<T>[]) => void
  classNames?: { root?: string; item?: string }
  styles?: { root?: JSX.CSSProperties; item?: JSX.CSSProperties }
  ref?: (el: HTMLDivElement) => void
  class?: string
  style?: JSX.CSSProperties
  /** 旧用法：每个子节点为一项（key 为下标）；items 存在时忽略。 */
  children?: JSX.Element
}

const MASONRY_PROPS = [
  'columns', 'gutter', 'items', 'itemRender', 'fresh', 'sequential', 'onLayoutChange',
  'classNames', 'styles', 'ref', 'class', 'style', 'children',
] as const

interface Entry<T> {
  key: MasonryKey
  index: number
  item?: MasonryItem<T>
  node?: JSX.Element
}

const ITEM_WIDTH = '--upthrust-masonry-item-width'

/** 瀑布流：按最短列依次放置不等高的内容，列数与间距支持响应式。 */
const Masonry = <T,>(props: MasonryProps<T>): JSX.Element => {
  const rest = omit(props, ...MASONRY_PROPS)
  const masonry = createMasonry({
    get columns() { return props.columns },
    get sequential() { return props.sequential },
  })
  const columnCount = masonry.columnCount
  const gutter = createMemo(() => resolveMasonryGutter(props.gutter, masonry.screens()), {
    equals: (a, b) => a[0] === b[0] && a[1] === b[1],
  })

  const resolved = resolveChildren(() => (props.items ? undefined : props.children))
  const entries = createMemo((): Entry<T>[] => {
    if (props.items) return props.items.map((item, index) => ({ key: item.key, index, item }))
    return resolved.toArray()
      .filter(node => node !== null && node !== undefined && node !== false)
      .map((node, index) => ({ key: index, index, node }))
  })

  // ---- 测量：key → 高度。ready 之前使用网格回退，首轮测量完成后切换为绝对定位，之后不再回退。
  const [heights, setHeights] = createSignal<ReadonlyMap<MasonryKey, number>>(new Map(), { ownedWrite: true })
  const [ready, setReady] = createSignal(false, { ownedWrite: true })
  const itemElements = new Map<MasonryKey, HTMLElement>()

  const collect = () => {
    const previous = untrack(heights)
    const next = new Map<MasonryKey, number>()
    let changed = !untrack(ready)
    for (const entry of untrack(entries)) {
      const element = itemElements.get(entry.key)
      if (!element) continue
      const height = element.getBoundingClientRect().height
      next.set(entry.key, height)
      if (previous.get(entry.key) !== height) changed = true
    }
    if (next.size !== previous.size) changed = true
    if (!changed) return
    setHeights(next)
    setReady(true)
  }

  // 同一帧内的多次触发（容器尺寸、图片加载、单项尺寸、数据变化）合并为一次测量。
  let frame = 0
  const schedule = () => {
    if (frame || typeof requestAnimationFrame === 'undefined') return
    frame = requestAnimationFrame(() => {
      frame = 0
      collect()
    })
  }
  onCleanup(() => {
    if (frame) cancelAnimationFrame(frame)
  })
  createEffect(() => [entries(), columnCount(), gutter()], () => schedule())

  // 单项尺寸监听（fresh）：一个共享的 ResizeObserver，随开关创建 / 断开。
  let itemObserver: ResizeObserver | undefined
  createEffect(() => !!props.fresh, fresh => {
    if (!fresh || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => schedule())
    itemElements.forEach(element => observer.observe(element))
    itemObserver = observer
    return () => {
      observer.disconnect()
      itemObserver = undefined
    }
  })

  // ---- 布局
  const layout = createMemo(() => {
    if (!ready()) return undefined
    const list = entries()
    const measured = heights()
    const count = columnCount()
    const order = props.sequential ? sequentialColumns(list.length, count) : undefined
    return computeMasonryLayout(
      list.map(entry => measured.get(entry.key) ?? 0),
      count,
      gutter()[1],
      list.map((entry, i) => entry.item?.column ?? order?.[i]),
    )
  })

  // 全部项都已测量时才上报；列分配不变时不重复触发。
  let lastReport: string | undefined
  createEffect(
    () => {
      const current = layout()
      if (!current) return undefined
      const list = entries()
      const measured = heights()
      if (!list.every(entry => measured.has(entry.key))) return undefined
      return list.map((entry, i): MasonryLayoutItem<T> => ({ ...entry.item, key: entry.key, column: current.positions[i].column }))
    },
    report => {
      if (!report || !props.onLayoutChange) return
      const signature = JSON.stringify(report.map(item => [item.key, item.column]))
      if (signature === lastReport) return
      lastReport = signature
      untrack(() => props.onLayoutChange?.(report))
    },
  )

  // ---- 根节点
  const onOwnerCleanup = createOwnerCleanup()
  const setRoot = (el: HTMLDivElement) => {
    untrack(() => props.ref?.(el))
    // 捕获阶段监听：图片等资源加载完成后高度才确定（load / error 不冒泡）。
    el.addEventListener('load', schedule, true)
    el.addEventListener('error', schedule, true)
    let observer: ResizeObserver | undefined
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => schedule())
      observer.observe(el)
    }
    onOwnerCleanup(() => {
      el.removeEventListener('load', schedule, true)
      el.removeEventListener('error', schedule, true)
      observer?.disconnect()
    })
  }

  const rootStyle = createMemo((): JSX.CSSProperties => {
    const [horizontal, vertical] = gutter()
    const current = layout()
    const own = { ...props.styles?.root, ...props.style }
    if (current) return { ...own, height: `${current.height}px` }
    return {
      ...own,
      'grid-template-columns': `repeat(${columnCount()}, minmax(0, 1fr))`,
      'column-gap': `${horizontal}px`,
      'row-gap': `${vertical}px`,
    }
  })

  const renderContent = (entry: Entry<T>, column: Accessor<number>): JSX.Element => {
    if (!entry.item) return entry.node
    const item = entry.item
    if (item.children !== undefined && item.children !== null) return item.children
    const info = { ...item, index: entry.index } as MasonryItemRenderInfo<T>
    Object.defineProperty(info, 'column', { get: column, enumerable: true })
    return untrack(() => props.itemRender?.(info))
  }

  const ItemBox = (box: { entry: Accessor<Entry<T>>; index: Accessor<number> }) => {
    const key = untrack(() => box.entry().key)
    const onItemCleanup = createOwnerCleanup()
    const position = () => layout()?.positions[box.index()]
    const column = () => position()?.column ?? 0
    const state = (): MasonryItemState => (!ready() ? 'static' : heights().has(key) ? 'placed' : 'pending')
    const content = createMemo(() => {
      const entry = box.entry()
      return untrack(() => renderContent(entry, column))
    })
    const style = createMemo((): JSX.CSSProperties => {
      const own = props.styles?.item
      const current = position()
      if (!current) return { ...own }
      const [horizontal] = gutter()
      return {
        ...own,
        [ITEM_WIDTH]: `calc((100% + ${horizontal}px) / ${columnCount()})`,
        left: `calc(var(${ITEM_WIDTH}) * ${current.column})`,
        width: `calc(var(${ITEM_WIDTH}) - ${horizontal}px)`,
        top: `${current.top}px`,
      }
    })
    const setItem = (el: HTMLDivElement) => {
      itemElements.set(key, el)
      itemObserver?.observe(el)
      onItemCleanup(() => {
        if (itemElements.get(key) === el) itemElements.delete(key)
        itemObserver?.unobserve(el)
      })
    }
    return (
      <div
        ref={setItem}
        class={mergeClass(masonryItemVariants({ state: state() }), props.classNames?.item)}
        style={style()}
        data-column={position() ? column() : undefined}
      >
        {content()}
      </div>
    )
  }

  return (
    <div
      {...rest}
      ref={setRoot}
      class={mergeClass(masonryVariants({ mode: layout() ? 'absolute' : 'grid' }), props.classNames?.root, props.class)}
      style={rootStyle()}
    >
      <For each={entries()} keyed={entry => entry.key}>
        {(entry, index) => <ItemBox entry={entry} index={index} />}
      </For>
    </div>
  )
}

export default Masonry
