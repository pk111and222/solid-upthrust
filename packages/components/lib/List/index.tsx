import { useComponentProps } from '../ConfigProvider/context'
import { Component, For, Show, createMemo, merge, untrack } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { createList, createOwnerCleanup, type ListGroupConfig, type ListIns, type ListRow, type ListScrollToConfig } from 'upthrust-competence'
import { listRootClass, listItemClass, listGroupHeaderClass, listLoadingClass, listFooterClass } from './styles'
import { twMerge } from 'tailwind-merge'

export type { ListScrollToConfig, ListScrollAlign } from 'upthrust-competence'

export interface ListSemanticSlots {
  root?: string
  item?: string
  groupHeader?: string
}

export interface ListSemanticStyles {
  root?: JSX.CSSProperties
  item?: JSX.CSSProperties
  groupHeader?: JSX.CSSProperties
}

export interface ListRef<T = any, K = unknown> extends ListIns<T, K> {
  /** Scroll to a position, an item (rowKey), or a group header. */
  scrollTo: (config: ListScrollToConfig) => void
}

export interface ListProps<T = any, K = unknown> {
  /** Data source. */
  items: T[]
  /** Render a single row. */
  itemRender: (item: T, index: number) => JSX.Element
  /** Unique key per item: a field name or a getter. */
  rowKey?: ((item: T, index: number) => string | number) | keyof T
  /** Scroll container height (px); content scrolls when it overflows. */
  height?: number
  /** Virtual scrolling: render only rows in view (requires height). */
  virtual?: boolean
  /** Grouping configuration. */
  group?: ListGroupConfig<T, K>
  /** Whether group headers stick to the top while scrolling. */
  sticky?: boolean
  /** Native scroll event handler (infinite loading etc.). */
  onScroll?: (e: Event & { currentTarget: HTMLDivElement; target: HTMLDivElement }) => void
  /** Loading indicator rendered after the last row (infinite loading). */
  loading?: boolean
  /** Custom loading node; default is a centered spinner with "加载中…". */
  loadingRender?: JSX.Element
  /** Fixed footer rendered after all rows (outside the scroll content flow end). */
  footer?: JSX.Element
  /** Semantic class slots. */
  classNames?: ListSemanticSlots
  /** Semantic inline styles. */
  styles?: ListSemanticStyles
  /** Estimated row height (px) for virtual mode. Default 44. */
  estimateRowHeight?: number
  /** Estimated group header height (px). Default 40. */
  estimateGroupHeaderHeight?: number
  /** Extra rows rendered above/below the viewport in virtual mode. Default 5. */
  overscan?: number
  class?: string
  style?: JSX.CSSProperties
  ref?: (val: ListRef<T, K>) => void
}

const resolveKeyGetter = <T,>(rowKey: ListProps<T>['rowKey']) => {
  if (rowKey === undefined) return undefined
  if (typeof rowKey === 'function') return rowKey as (item: T, index: number) => string | number
  // Field-name form: keyof T
  return (item: T) => (item as Record<string, unknown>)[rowKey as string] as string | number
}

const List = <T, K = unknown>(providedProps: ListProps<T, K>) => {
  const rawProps = useComponentProps('List', providedProps)
  const props = merge(
    {
      items: [] as T[],
      virtual: false,
      sticky: false,
      overscan: 5,
    } as Partial<ListProps<T, K>>,
    rawProps,
  )

  const virtualEnabled = createMemo(() => !!props.virtual && typeof props.height === 'number')
  const keyGetter = createMemo(() => resolveKeyGetter(props.rowKey))

  const list = createList<T, K>({
    items: () => props.items,
    get rowKey() { return keyGetter() },
    get estimateRowHeight() { return props.estimateRowHeight },
    get estimateGroupHeaderHeight() { return props.estimateGroupHeaderHeight },
    get overscan() { return props.overscan },
    group: () => props.group,
  })

  // Solid 2 ref callbacks run under a null owner — RO/listener cleanups must
  // bind to the component owner.
  const onOwnerCleanup = createOwnerCleanup()
  let containerEl: HTMLDivElement | undefined

  // ---- container wiring (virtual mode) ---------------------------------------
  // Viewport + scroll position flow into the headless machine; measured row
  // heights flow back out of a per-row ResizeObserver.
  let rowObserver: ResizeObserver | undefined
  const observedRows = new WeakMap<Element, number>()

  const measureRow = (el: HTMLElement) => {
    // Rows only need measuring in virtual mode; the ref is unconditional
    // (Solid 2 drops conditional `cond ? fn : undefined` ref values), so
    // gate INSIDE instead. untrack: ref callbacks run in the creation
    // scope — reading the memo there warns STRICT_READ_UNTRACKED.
    if (!untrack(virtualEnabled)) return
    if (!rowObserver) {
      rowObserver = new ResizeObserver((entries) => {
        let changed = false
        for (const entry of entries) {
          const row = observedRows.get(entry.target)
          if (row === undefined) continue
          if (list.setRowHeight(row, (entry.target as HTMLElement).offsetHeight)) changed = true
        }
        // Anchor preservation: rows ABOVE the viewport getting their real
        // heights shifts the content under scrollTop — compensate so the
        // user never sees the jump (the classic virtual-list flicker).
        if (changed && containerEl) {
          const delta = list.anchorDelta()
          if (delta > 0.5) {
            containerEl.scrollTop += delta
            list.setScrollTop(containerEl.scrollTop)
          }
        }
      })
      onOwnerCleanup(() => rowObserver?.disconnect())
    }
    // NOTE: at ref time the element is NOT yet inserted and data-row is NOT
    // yet applied (Solid 2 runs function refs during creation, before the
    // attribute effects) — reading el.dataset.row here yields NaN. Defer
    // EVERYTHING to the next frame: by then the element is in the DOM with
    // its attributes, and offsetHeight reflects the real layout.
    const seed = requestAnimationFrame(() => {
      if (!el.isConnected) return
      const row = Number(el.dataset.row)
      if (!Number.isFinite(row)) return
      observedRows.set(el, row)
      rowObserver!.observe(el)
      list.setRowHeight(row, el.offsetHeight)
    })
    onOwnerCleanup(() => cancelAnimationFrame(seed))
  }

  const containerRef = (el: HTMLDivElement) => {
    containerEl = el
    // untrack: ref callback = creation scope (untracked) — direct memo read
    // warns STRICT_READ_UNTRACKED.
    if (!untrack(virtualEnabled)) return
    list.setViewport(el.clientHeight)
    const viewportObserver = new ResizeObserver(() => {
      if (containerEl) list.setViewport(containerEl.clientHeight)
    })
    viewportObserver.observe(el)
    onOwnerCleanup(() => viewportObserver.disconnect())
  }

  const handleScroll = (e: Event) => {
    // untrack: event handler — intentional non-reactive read.
    if (untrack(virtualEnabled) && containerEl) list.setScrollTop(containerEl.scrollTop)
    const user = props.onScroll as ((e: Event) => void) | undefined
    user?.(e)
  }

  // Imperative scrollTo: the headless layer resolves the math, we own the DOM.
  const scrollTo = (config: ListScrollToConfig) => {
    if (!containerEl) return
    const top = list.resolveScrollTo(config)
    if (!Number.isFinite(top)) return
    if (typeof config === 'object' && 'left' in config) {
      containerEl.scrollTo({ top, left: config.left ?? 0 })
    } else {
      containerEl.scrollTo({ top })
    }
  }

  // The ref handle merges the headless machine with the DOM-bound scrollTo.
  props.ref?.({ ...list, scrollTo })

  // ---- rendering ---------------------------------------------------------------
  const renderGroupHeader = (row: ListRow<T, K>): JSX.Element => (
    <div
      class={twMerge(listGroupHeaderClass({ sticky: !!props.sticky }), props.classNames?.groupHeader)}
      style={props.styles?.groupHeader}
      role="presentation"
    >
      {props.group?.title?.(row.groupKey as K, row.groupItems ?? []) as JSX.Element}
    </div>
  )

  const renderItem = (row: ListRow<T, K>) => (
    <div
      class={twMerge(listItemClass({}), props.classNames?.item)}
      style={props.styles?.item}
      role="listitem"
      data-row={row.row}
      ref={measureRow}
    >
      {row.item !== undefined ? props.itemRender(row.item as T, row.index) : undefined}
    </div>
  )

  const rootStyle = createMemo(() => ({
    ...(props.height !== undefined ? { height: `${props.height}px` } : {}),
    ...props.styles?.root,
    ...props.style,
  }))

  // Loading footer: the infinite-scroll affordance Listy demos hand-roll —
  // here it is a first-class slot so every consumer doesn't rebuild it.
  const renderLoading = (): JSX.Element => (
    <Show when={props.loading}>
      <div class={listLoadingClass({})}>
        <Show when={props.loadingRender} fallback={
          <>
            <span class="i-mdi-loading animate-spin-upthrust text-[18px] text-primary" />
            <span>加载中…</span>
          </>
        }>
          {props.loadingRender}
        </Show>
      </div>
    </Show>
  )

  // Virtual slice: reactive over the headless visibleRange so scrolling
  // re-renders the window. Keying For by row index keeps a row's DOM element
  // bound to the ROW, not to its position in the slice — ResizeObservers
  // stay attached to the right elements as the window slides.
  const visibleRows = createMemo(() => {
    const [start, end] = list.visibleRange()
    return list.rows().slice(start, end)
  })

  // Spacer paddings as reactive signals — read inside JSX so Solid tracks them.
  const padTop = createMemo(() => list.spacerPadding()[0])
  const padBottom = createMemo(() => list.spacerPadding()[1])

  return (
    <div
      ref={containerRef}
      class={twMerge(listRootClass({ scrollable: props.height !== undefined }), props.classNames?.root, props.class)}
      style={rootStyle()}
      role="list"
      onScroll={handleScroll}
    >
      <Show
        when={virtualEnabled()}
        fallback={
          <>
            {/* Non-virtual: the full row tree. */}
            <For each={list.rows()}>
              {(row) => (
                <Show when={row.kind === 'item'} fallback={renderGroupHeader(row)}>
                  {renderItem(row)}
                </Show>
              )}
            </For>
            {renderLoading()}
            <Show when={props.footer}>
              <div class={listFooterClass({})}>{props.footer}</div>
            </Show>
          </>
        }
      >
        {/* Virtual: spacer padding above → visible rows → spacer padding
          below. The paddings stretch the scroll track to totalHeight while
          only the visible slice renders. For with a keyed extractor keeps
          DOM identity per ROW (not per slice position) so ResizeObservers
          keep watching the right elements as the window slides. */}
        <div style={{ height: `${padTop()}px` }} aria-hidden="true" />
        <For each={visibleRows()} keyed={(row) => row.row}>
          {(row) => (
            <Show when={row().kind === 'item'} fallback={renderGroupHeader(row())}>
              {renderItem(row())}
            </Show>
          )}
        </For>
        {renderLoading()}
        <div style={{ height: `${padBottom()}px` }} aria-hidden="true" />
      </Show>
    </div>
  )
}

export default List
