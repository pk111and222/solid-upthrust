import { createEffect, createMemo, createSignal, untrack } from "solid-js";

/**
 * List virtualization headless — the antd6 Listy core.
 *
 * The machine is measurement-driven and DOM-free: the renderer reports
 * viewport size / scroll position / measured row heights through setters
 * (the createSplitter `setContainerSize` injection pattern), and this layer
 * owns everything worth unit-testing:
 *
 *   1. Row tree — items expanded into a flat row sequence (item rows +
 *      group-header rows), so grouping and virtualization share ONE prefix
 *      -sum axis and group headers occupy real scroll height.
 *   2. Height cache + prefix sums — estimated heights corrected by measured
 *      ones, lazily re-summed (dirty flag) so a burst of ResizeObserver
 *      reports rebuilds the offsets once, on next read.
 *   3. Visible window — binary search over the (monotonic) offsets with an
 *      overscan buffer on both ends.
 *   4. scrollTo math — pixel / row-key / group-key targets × top/bottom/auto
 *      alignment resolved to a target scrollTop. The headless layer never
 *      touches the DOM; it RETURNS the number and the renderer scrolls.
 *
 * Variable row heights are first-class (Listy: "rows do not need the same
 * height") — estimates are corrected as rows render and measure.
 */

/** One expanded row: an item row or a group-header row. */
export type ListRow<T = unknown, K = unknown> = {
  kind: 'item' | 'groupHeader'
  /** Index into the expanded row sequence (what the height cache is keyed on). */
  row: number
  /** Source-array index for item rows (-1 for group headers). */
  index: number
  item?: T
  groupKey?: K
  /** Items belonging to the group (group headers only). */
  groupItems?: T[]
}

export type ListGroupConfig<T, K> = {
  /** Group key extractor; items with the same key are grouped adjacently. */
  key: (item: T) => K
  /** Render the group header (renderer concern — kept here so the row tree is self-describing). */
  title?: (groupKey: K, items: T[]) => unknown
}

export type ListScrollAlign = 'top' | 'bottom' | 'auto'

/** ref.scrollTo() configuration — Listy's ListyScrollToConfig shapes. */
export type ListScrollToConfig =
  | number
  | { top?: number; left?: number }
  | { key: string | number; align?: ListScrollAlign; offset?: number }
  | { groupKey: string | number; align?: ListScrollAlign; offset?: number }

export type ListConfig<T = unknown, K = unknown> = {
  items: () => T[]
  /** Unique key per item: a field name or a getter. */
  rowKey?: (item: T, index: number) => string | number
  /** Initial per-row height estimate (px). Default 44. */
  estimateRowHeight?: number
  /** Group-header height estimate (px). Default 40. */
  estimateGroupHeaderHeight?: number
  /** Rows rendered above/below the viewport. Default 5. */
  overscan?: number
  group?: () => ListGroupConfig<T, K> | undefined
}

export type ListIns<T = unknown, K = unknown> = {
  /** Expanded row tree (item rows + group headers), reactive to items/group. */
  rows: () => ListRow<T, K>[]
  /** Total scroll height (px) — the last prefix sum. */
  totalHeight: () => number
  /** [start, end) inclusive-exclusive visible row window including overscan. */
  visibleRange: () => [number, number]
  /** Top offset of a row (px) — the prefix sum before it. */
  rowTop: (row: number) => number
  /** Height of a row (px): measured if known, else the estimate. */
  rowHeight: (row: number) => number
  /** Rendered spacer paddings: [top, bottom] px around the visible slice. */
  spacerPadding: () => [number, number]
  /** Viewport size reported by the renderer (px). */
  viewport: () => number
  /** Current scroll offset (px). */
  scrollTop: () => number
  // ---- renderer → headless injections ------------------------------------
  setViewport: (px: number) => void
  setScrollTop: (px: number) => void
  /** Report a measured row height (ResizeObserver). Returns true when the cache changed. */
  setRowHeight: (row: number, px: number) => boolean
  /**
   * Anchor drift after a measurement pass: how much the first visible row's
   * top has moved relative to the current scrollTop (px). The renderer adds
   * this to container.scrollTop to keep the visible content pinned while
   * rows above get their real heights. Zero when nothing drifted.
   */
  anchorDelta: () => number
  // ---- imperative scroll math ----------------------------------------------
  /** Resolve any scrollTo config to a target scrollTop (NaN = nothing to do). */
  resolveScrollTo: (config: ListScrollToConfig) => number
  /** Row index whose rowKey matches (-1 when absent). */
  rowIndexOfKey: (key: string | number) => number
  /** Row index of a group's header (-1 when absent). */
  rowIndexOfGroupKey: (groupKey: string | number) => number
}

export const listSplits: (keyof ListConfig)[] = ['rowKey', 'estimateRowHeight', 'estimateGroupHeaderHeight', 'overscan']

const DEFAULT_ITEM_HEIGHT = 44
const DEFAULT_GROUP_HEADER_HEIGHT = 40
const DEFAULT_OVERSCAN = 5
/** Measured heights within this delta of the cache are ignored (RO noise). */
const HEIGHT_EPSILON = 0.5
/**
 * Height-cache stability window: re-measurements of an ALREADY-measured row
 * within this many px of the cached value are ignored. Without it, a row
 * whose height oscillates ±1px between renders (font rounding, subpixel
 * borders) makes totalHeight jitter, which visibly wiggles the scrollbar
 * thumb and (before overflow-anchor:none) triggered scroll compensations.
 */
const HEIGHT_STABILITY = 2

export const createList = <T = unknown, K = unknown>(
  config: ListConfig<T, K>,
): ListIns<T, K> => {
  const configuredEstimate = () => config.estimateRowHeight ?? DEFAULT_ITEM_HEIGHT
  const estimateHeader = () => config.estimateGroupHeaderHeight ?? DEFAULT_GROUP_HEADER_HEIGHT
  const overscan = () => Math.max(0, config.overscan ?? DEFAULT_OVERSCAN)

  // ---- self-learning estimate --------------------------------------------------
  // The single biggest source of virtual-list "snap" artifacts: a row the
  // user is scrolling toward was ESTIMATED at the configured default while
  // every measured row around it is ~2x that. When that row enters the
  // window and measures, everything below it shifts by the gap — a visible
  // one-row jump exactly when a row boundary crosses the viewport edge.
  // Once the renderer reports a handful of real heights, their MEDIAN
  // replaces the configured estimate for UNMEASURED rows, so entering rows
  // are expected at (nearly) their true height and the correction on
  // measurement is ~0. Median (not mean) so one pathological row can't
  // skew it; a minimum sample count before it kicks in.
  //
  // SAMPLE HYGIENE: only measurements that MATERIALLY differ from the
  // current estimate feed the samples. The RO first callback can fire
  // pre-layout (empty row box ≈ the estimate) — sampling those would pin
  // the median to the estimate and freeze learning at the wrong value.
  const MIN_SAMPLES_FOR_LEARNING = 4
  const [_learnedEstimate, _setLearnedEstimate] = createSignal<number | null>(null, { ownedWrite: true })
  let _estimateSamples: number[] = []

  const learnHeight = (px: number) => {
    // Skip estimate-shaped values: a measurement that merely echoes the
    // current estimate carries no new information (and is often the
    // pre-layout box).
    const est = _learnedEstimate() ?? configuredEstimate()
    if (Math.abs(px - est) <= 1) return
    _estimateSamples.push(px)
    if (_estimateSamples.length > 32) _estimateSamples = _estimateSamples.slice(-32)
    if (_estimateSamples.length >= MIN_SAMPLES_FOR_LEARNING) {
      const sorted = [..._estimateSamples].sort((a, b) => a - b)
      const median = sorted[sorted.length >> 1]
      const current = _learnedEstimate()
      // First learning (current === null) always commits; afterwards only
      // medians that materially moved replace the previous estimate.
      if (current === null || Math.abs(median - current) > 0.5) {
        _setLearnedEstimate(median)
      }
    }
  }

  const estimateItem = (): number => _learnedEstimate() ?? configuredEstimate()

  // ---- row tree -------------------------------------------------------------
  // Items expand to item rows; with grouping, a group-header row precedes
  // each run of same-key items. Grouping PRESERVES source order within a
  // group and groups appear in first-occurrence order (Listy semantics).
  const rows = createMemo<ListRow<T, K>[]>(() => {
    const items = config.items() ?? []
    const group = config.group?.()
    if (!group) {
      return items.map((item, index) => ({ kind: 'item' as const, row: index, index, item }))
    }
    const out: ListRow<T, K>[] = []
    let row = 0
    let index = 0
    let currentKey: K | undefined
    let currentItems: T[] = []
    let started = false
    const flushHeader = () => {
      out.push({ kind: 'groupHeader', row: row++, index: -1, groupKey: currentKey, groupItems: currentItems })
    }
    for (const item of items) {
      const key = group.key(item)
      if (!started || key !== currentKey) {
        // NOTE: same-key items scattered through the array create separate
        // groups per run (adjacent grouping), matching how sticky headers
        // read naturally while scrolling. Listy groups adjacently too.
        currentKey = key
        currentItems = []
        flushHeader() // header comes BEFORE its items
        started = true
      }
      currentItems.push(item)
      out.push({ kind: 'item', row: row++, index: index++, item, groupKey: key })
    }
    return out
  })

  // ---- height cache + prefix sums -------------------------------------------
  // heights[i] is the CURRENT height of row i (measured or estimate);
  // offsets is the lazy prefix sum (length N+1, offsets[N] = totalHeight).
  // A version signal marks cache mutations: reading memos depend on it so a
  // measurement (or a row-tree swap) re-runs them. Solid 2 memos only
  // recompute when a DEPENDENCY changes — the plain `_dirty` flag alone is
  // invisible to reactivity, so setRowHeight would write the flag and the
  // memos would keep serving the stale offsets.
  let _heights: number[] = []
  let _offsets: number[] = [0]
  let _syncedVersion = -1
  let _syncedLearned: number | null = null
  // ownedWrite: bumped from the row-identity effect (an owned scope) and
  // from setRowHeight's ResizeObserver callbacks — both event sources.
  const [_version, _setVersion] = createSignal(0, { ownedWrite: true })

  const bump = () => _setVersion((v) => v + 1)

  const rowHeightAt = (row: number, rs: ListRow<T, K>[]): number => {
    const measured = _heights[row]
    if (measured !== undefined) return measured
    return rs[row]?.kind === 'groupHeader' ? estimateHeader() : estimateItem()
  }

  const syncOffsets = (): { rows: ListRow<T, K>[]; offsets: number[] } => {
    const version = _version() // reactive dependency: mutations bump this
    // The learned estimate is ALSO a reactive dependency: when the median
    // flips (enough new samples), every unmeasured row's height changes and
    // the offsets must be rebuilt even if no single row was re-measured.
    const learned = _learnedEstimate()
    const rs = rows()
    if (rs.length !== _offsets.length - 1 || version !== _syncedVersion || learned !== _syncedLearned) {
      const offsets = new Array<number>(rs.length + 1)
      offsets[0] = 0
      for (let i = 0; i < rs.length; i++) {
        offsets[i + 1] = offsets[i] + rowHeightAt(i, rs)
      }
      _offsets = offsets
      _syncedVersion = version
      _syncedLearned = learned
    }
    return { rows: rs, offsets: _offsets }
  }

  // Track row-tree identity: when rows() returns a NEW array (any items or
  // group change), stale measured heights must be dropped — row i now means
  // a different thing. EXCEPT append-only growth (infinite loading appends
  // and every prior row keeps its identity, so measured heights survive.
  // The rows memo REBUILDS row objects on every items change (even when the
  // underlying items are the same source objects), so wrapper identity can't
  // detect appends — compare by ITEM identity: every old row's item must be
  // reference-equal to the corresponding new row's item (row wrappers are
  // rebuilt, but the item payloads are shared), lengths must grow, and rows
  // must align 1:1 in kind (an interleaved new groupHeader shifts row
  // indices and invalidates positions).
  let _prevRows: ListRow<T, K>[] | undefined
  createEffect(
    () => rows(),
    (rs) => {
      const prev = _prevRows
      if (prev !== undefined && rs !== prev) {
        const appended =
          rs.length > prev.length &&
          prev.length <= rs.length &&
          prev.every((p, i) => {
            const n = rs[i]
            return n !== undefined && n.kind === p.kind && n.item === p.item
          })
        if (!appended) _heights = []
        bump()
      }
      _prevRows = rs
    },
  )

  const totalHeight = createMemo(() => syncOffsets().offsets[syncOffsets().rows.length])

  // ---- viewport / scroll -----------------------------------------------------
  // ownedWrite: setScrollTop fires from high-frequency scroll events and
  // setViewport from ResizeObserver callbacks — event sources, not template
  // computations.
  const [_viewport, _setViewport] = createSignal(0, { ownedWrite: true })
  const [_scrollTop, _setScrollTop] = createSignal(0, { ownedWrite: true })

  // untrack：注入协议（ref 回调/RO/scroll 事件）在非追踪作用域执行，
  // 命令式读取信号会触发 STRICT_READ_UNTRACKED 刷屏。
  const setViewport = (px: number) => {
    if (!Number.isFinite(px) || px < 0) return
    if (untrack(() => px === _viewport())) return
    _setViewport(px)
  }

  const setScrollTop = (px: number) => {
    if (!Number.isFinite(px) || px < 0) return
    if (untrack(() => px === _scrollTop())) return
    _setScrollTop(px)
  }

  // ---- visible window --------------------------------------------------------
  /** First row whose bottom edge is past `y` (binary search over offsets). */
  const findRowAt = (y: number, offsets: number[]): number => {
    let lo = 0
    let hi = offsets.length - 1
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (offsets[mid + 1] <= y) lo = mid + 1
      else hi = mid
    }
    return lo
  }

  const visibleRange = createMemo<[number, number]>(() => {
    const { rows: rs, offsets } = syncOffsets()
    if (rs.length === 0) return [0, 0]
    const viewport = _viewport()
    if (viewport <= 0) {
      // Unmeasured viewport: render the head only (first paint before RO).
      const end = Math.min(rs.length, overscan() + 1)
      return [0, end]
    }
    const top = _scrollTop()
    const total = offsets[rs.length]
    // Clamp scroll into the scrollable range (browsers rubber-band).
    const clampedTop = Math.max(0, Math.min(top, Math.max(0, total - viewport)))
    const first = findRowAt(clampedTop, offsets)
    const lastExclusive = findRowAt(Math.min(clampedTop + viewport, total), offsets) + 1
    const start = Math.max(0, first - overscan())
    const end = Math.min(rs.length, lastExclusive + overscan())
    return [start, end]
  })

  const rowTop = (row: number) => {
    const { offsets } = syncOffsets()
    return offsets[Math.max(0, Math.min(row, offsets.length - 1))]
  }

  const rowHeight = (row: number) => {
    const rs = rows()
    if (row < 0 || row >= rs.length) return 0
    return rowHeightAt(row, rs)
  }

  const spacerPadding = createMemo<[number, number]>(() => {
    const { rows: rs, offsets } = syncOffsets()
    const [start, end] = visibleRange()
    const total = offsets[rs.length]
    return [offsets[start] ?? 0, Math.max(0, total - (offsets[end] ?? total))]
  })

  // ---- measured heights ------------------------------------------------------
  // ANCHOR PRESERVATION (the react-window/tanstack fix for the classic
  // virtual-list jump): when a row ABOVE the first visible row changes its
  // height (estimate → measured), every offset below it shifts and the
  // content under the current scrollTop becomes a DIFFERENT row — the user
  // sees a flicker/jump. The fix: after applying the height delta, report
  // the accumulated delta for rows above the anchor so the renderer can
  // adjust container.scrollTop by the same amount, keeping the anchor row
  // visually pinned.
  const anchorDelta = (): number => {
    const { rows: rs, offsets } = syncOffsets()
    const top = _scrollTop()
    const first = findRowAt(top, offsets)
    // Rows above `first` that were just re-measured contribute their delta;
    // we approximate by comparing the CURRENT offsets[first] against the
    // value the scrollTop was set against (top). When offsets[first] > top
    // the anchor slid BELOW the scroll position — the renderer must add the
    // difference; when it's less, subtract.
    return offsets[first] - top
  }

  const setRowHeight = (row: number, px: number) => {
    const rs = rows()
    if (row < 0 || row >= rs.length) return false
    if (!Number.isFinite(px) || px <= 0) return false
    const current = rowHeightAt(row, rs)
    const cached = _heights[row]
    // Once a row has been measured, small drift is noise — only accept
    // corrections that materially change the layout. First measurement
    // (cached === undefined) always applies, flipping estimate → real.
    const tolerance = cached !== undefined ? HEIGHT_STABILITY : HEIGHT_EPSILON
    if (Math.abs(current - px) <= tolerance) return false
    // Grow the sparse array as needed.
    if (_heights.length < rs.length) {
      const grown = new Array<number>(rs.length)
      for (let i = 0; i < _heights.length; i++) grown[i] = _heights[i]
      _heights = grown
    }
    _heights[row] = px
    // Feed the self-learning estimate (item rows only).
    if (rs[row]?.kind === 'item') learnHeight(px)
    bump()
    return true
  }

  // ---- key lookups -------------------------------------------------------------
  const keyOf = (item: T, index: number): string | number | undefined => {
    const getter = config.rowKey
    if (!getter) return undefined
    return getter(item, index)
  }

  const rowIndexOfKey = (key: string | number): number => {
    const rs = rows()
    for (let i = 0; i < rs.length; i++) {
      const r = rs[i]
      if (r.kind !== 'item' || r.item === undefined) continue
      const k = keyOf(r.item, r.index)
      if (k !== undefined && String(k) === String(key)) return i
    }
    return -1
  }

  const rowIndexOfGroupKey = (groupKey: string | number): number => {
    const rs = rows()
    for (let i = 0; i < rs.length; i++) {
      const r = rs[i]
      if (r.kind === 'groupHeader' && r.groupKey !== undefined && String(r.groupKey) === String(groupKey)) return i
    }
    return -1
  }

  // ---- scrollTo math ------------------------------------------------------------
  // Resolved against CURRENT measurements. `auto` aligns an in-view row to
  // no-op and an above/below row to the nearest edge (Listy/rc-virtual-list).
  const alignRowTop = (row: number, align: ListScrollAlign, offset: number): number => {
    const { rows: rs, offsets } = syncOffsets()
    if (row < 0 || row >= rs.length) return NaN
    const viewport = _viewport()
    const top = offsets[row]
    const bottom = offsets[row + 1] - viewport
    if (align === 'top') return top + offset
    if (align === 'bottom') return Math.max(0, bottom) + offset
    // auto
    const current = _scrollTop()
    if (top < current) return top + offset
    if (offsets[row + 1] > current + viewport) return Math.max(0, bottom) + offset
    return NaN // already in view — no scroll
  }

  const resolveScrollTo = (config2: ListScrollToConfig): number => {
    if (typeof config2 === 'number') return Math.max(0, config2)
    if ('top' in config2) return Math.max(0, config2.top ?? 0)
    if ('groupKey' in config2) {
      const row = rowIndexOfGroupKey(config2.groupKey)
      return alignRowTop(row, config2.align ?? 'top', config2.offset ?? 0)
    }
    if ('key' in config2) {
      const row = rowIndexOfKey(config2.key)
      return alignRowTop(row, config2.align ?? 'top', config2.offset ?? 0)
    }
    return NaN
  }

  return {
    rows,
    totalHeight,
    visibleRange,
    rowTop,
    rowHeight,
    spacerPadding,
    viewport: () => _viewport(),
    scrollTop: () => _scrollTop(),
    setViewport,
    setScrollTop,
    setRowHeight,
    anchorDelta,
    resolveScrollTo,
    rowIndexOfKey,
    rowIndexOfGroupKey,
  }
}
