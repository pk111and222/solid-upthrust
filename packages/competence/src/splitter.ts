import { createMemo, createSignal, type Accessor } from "solid-js";

/**
 * Panel size: px as a number (`240`) or a numeric string (`'240'`), or a
 * percentage of the container (`'30%'`).
 */
export type SplitterSize = number | `${number}%` | `${number}`

export type SplitterOrientation = 'horizontal' | 'vertical'

/** Collapse-button visibility: `true` always, `false` never, `'auto'` on hover / focus. */
export type SplitterCollapsibleIconMode = boolean | 'auto'

export type SplitterPanelCollapsible =
  | boolean
  | { start?: boolean; end?: boolean; showCollapsibleIcon?: SplitterCollapsibleIconMode }

export type SplitterPanelConfig = {
  /** Controlled size. When ANY panel has `size`, every panel is controlled (unset ones share the rest). */
  size?: SplitterSize;
  defaultSize?: SplitterSize;
  min?: SplitterSize;
  max?: SplitterSize;
  resizable?: boolean;
  collapsible?: SplitterPanelCollapsible;
}

export type SplitterPanelHandle = {
  /** Reactive index inside the current panel registry (-1 once disposed). */
  index: () => number;
  dispose: () => void;
}

export type SplitterCollapseType = 'start' | 'end'

/** Per-bar capabilities derived from both neighbours (antd `useResizable`). */
export type SplitterBarInfo = {
  /** Both neighbours are resizable and neither is collapsed below its `min`. */
  resizable: boolean;
  /** The "start" button is available (collapses the previous panel, or expands a collapsed next one). */
  startCollapsible: boolean;
  /** The "end" button is available (collapses the next panel, or expands a collapsed previous one). */
  endCollapsible: boolean;
  showStartCollapsibleIcon: SplitterCollapsibleIconMode;
  showEndCollapsibleIcon: SplitterCollapsibleIconMode;
}

export type SplitterConfig = {
  orientation?: SplitterOrientation;
  /** Shorthand for `orientation="vertical"`; ignored when `orientation` is set. */
  vertical?: boolean;
  /** @deprecated use `orientation`. */
  layout?: SplitterOrientation;
  /**
   * Panel list. When omitted, panels come from `register()`. Keep the entries
   * referentially stable — dragged sizes are remembered per entry.
   */
  items?: readonly SplitterPanelConfig[];
  /** Arrow-key step in px (default 16). */
  keyboardStep?: number;
  onResizeStart?: (sizes: number[]) => void;
  onResize?: (sizes: number[]) => void;
  onResizeEnd?: (sizes: number[]) => void;
  /** Fired after a collapse button toggles; `collapsed[i]` is true for zero-size panels. */
  onCollapse?: (collapsed: boolean[], sizes: number[]) => void;
}

export type SplitterAria = { valueNow: number; valueMin: number; valueMax: number }

export type SplitterIns = {
  /** Panel sizes in px; empty until the container is first measured. */
  sizes: Accessor<number[]>;
  /**
   * Sizes to render: px once measured; before that (SSR / first frame) the raw
   * `size ?? defaultSize` so the markup can use it as `flex-basis` (`undefined` = auto).
   */
  panelSizes: Accessor<(number | string | undefined)[]>;
  panels: Accessor<readonly SplitterPanelConfig[]>;
  orientation: Accessor<SplitterOrientation>;
  isHorizontal: Accessor<boolean>;
  containerSize: Accessor<number>;
  /** Bar index being dragged (after direction confirmation), `undefined` when idle. */
  movingIndex: Accessor<number | undefined>;
  register: (panel: SplitterPanelConfig) => SplitterPanelHandle;
  barInfo: (barIndex: number) => SplitterBarInfo;
  /** Shorthand for `!barInfo(barIndex).resizable`. */
  isBarDisabled: (barIndex: number) => boolean;
  /** Report the measured container size (px); values <= 0 are ignored (hidden container). */
  setContainerSize: (px: number) => void;
  /** Begin a drag session on a bar. Returns false (and does nothing) when the bar is not resizable. */
  startResize: (barIndex: number) => boolean;
  /**
   * Move the bar by `offset` px measured from where the drag STARTED (not
   * incremental). Commits and fires `onResize`. Returns the new sizes.
   */
  updateResize: (barIndex: number, offset: number) => number[];
  /**
   * Finish the drag and fire `onResizeEnd`. With `lazyOffset` (lazy mode) the
   * offset is applied once here instead of during the drag.
   */
  endResize: (lazyOffset?: number) => void;
  /** Incremental low-level resize from the current sizes (fires `onResize` only). Returns whether sizes changed. */
  resizeBy: (barIndex: number, deltaPx: number) => boolean;
  /** Arrow keys step by `keyboardStep`; Home/End move as far as the limits allow. Returns handled. */
  keyboardResize: (barIndex: number, key: string) => boolean;
  /** Toggle via the bar's start / end collapse button. Returns false when that button is unavailable. */
  collapse: (barIndex: number, type: SplitterCollapseType) => boolean;
  /** Bar position and its movable range, as rounded percentages of the container. */
  aria: (barIndex: number) => SplitterAria;
  /** Clamp a raw drag offset (px) to the range the bar can actually move — used by the lazy preview. */
  constrainOffset: (barIndex: number, offset: number) => number;
}

export const splitterSplits: (keyof SplitterConfig)[] = [
  'orientation', 'vertical', 'layout', 'items', 'keyboardStep',
  'onResizeStart', 'onResize', 'onResizeEnd', 'onCollapse',
]

const DEFAULT_KEYBOARD_STEP = 16
const EPS = 1e-6

const sum = (list: readonly number[]) => list.reduce((total, value) => total + value, 0)
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const isOrientation = (value: unknown): value is SplitterOrientation => value === 'horizontal' || value === 'vertical'

/** `orientation` wins, then a boolean `vertical`, then the deprecated `layout`; default horizontal. */
export const resolveSplitterOrientation = (
  orientation?: SplitterOrientation,
  vertical?: boolean,
  layout?: SplitterOrientation,
): SplitterOrientation => {
  if (isOrientation(orientation)) return orientation
  if (typeof vertical === 'boolean') return vertical ? 'vertical' : 'horizontal'
  if (isOrientation(layout)) return layout
  return 'horizontal'
}

/** Resolve a size to px against `total`; `undefined` for missing or unparsable values. */
export const resolveSplitterSize = (size: SplitterSize | string | undefined | null, total: number): number | undefined => {
  if (size === undefined || size === null) return undefined
  if (typeof size === 'number') return Number.isFinite(size) ? size : undefined
  const text = size.trim()
  if (text.endsWith('%')) {
    const percent = text.length > 1 ? Number(text.slice(0, -1)) : Number.NaN
    return Number.isFinite(percent) ? (total * percent) / 100 : undefined
  }
  if (text === '') return undefined
  const px = Number(text)
  return Number.isFinite(px) ? px : undefined
}

export type SplitterNormalizedCollapsible = { start: boolean; end: boolean; showCollapsibleIcon: SplitterCollapsibleIconMode }

/** `true` → both directions; an object keeps its flags; the icon mode defaults to `'auto'`. */
export const normalizeCollapsible = (collapsible: SplitterPanelCollapsible | undefined): SplitterNormalizedCollapsible => {
  if (typeof collapsible === 'object' && collapsible !== null) {
    return {
      start: !!collapsible.start,
      end: !!collapsible.end,
      showCollapsibleIcon: collapsible.showCollapsibleIcon ?? 'auto',
    }
  }
  return { start: !!collapsible, end: !!collapsible, showCollapsibleIcon: 'auto' }
}

/**
 * Clamp every non-collapsed size into [min, max] and hand the created slack to
 * the panels that still have room, proportionally to that room. Collapsed (0)
 * panels stay 0. When the limits cannot fit `total` at all, sizes are kept.
 */
const fitSizes = (sizes: readonly number[], mins: readonly number[], maxs: readonly number[], total: number): number[] => {
  const low = sizes.map((size, i) => (size === 0 ? 0 : mins[i]))
  const high = sizes.map((size, i) => (size === 0 ? 0 : maxs[i]))
  if (low.some((min, i) => min > high[i] + EPS) || sum(low) > total + EPS || sum(high) < total - EPS) return [...sizes]
  const result = sizes.map((size, i) => clamp(size, low[i], high[i]))
  const rest = total - sum(result)
  if (Math.abs(rest) <= EPS) return result
  const room = result.map((size, i) => (rest > 0 ? high[i] - size : size - low[i]))
  const totalRoom = sum(room)
  if (totalRoom <= EPS) return result
  return result.map((size, i) => size + (rest * room[i]) / totalRoom)
}

/**
 * Fill undefined sizes so the list sums to `total` (px port of antd's
 * `autoPtgSizes`):
 * - all defined → scale to `total` (all zero → equal split);
 * - defined ones already overflow → scale them, undefined get 0;
 * - otherwise share the rest evenly when that respects every free panel's
 *   limits, else fill greedily (min first, then up to max, in order).
 * Unlike antd a final pass clamps defined sizes into their own min/max too.
 */
export const autoSplitterSizes = (
  sizes: readonly (number | undefined)[],
  mins: readonly (number | undefined)[],
  maxs: readonly (number | undefined)[],
  total: number,
): number[] => {
  const count = sizes.length
  if (count === 0) return []
  const minOf = (i: number) => mins[i] ?? 0
  const maxOf = (i: number) => maxs[i] ?? total
  const allMins = sizes.map((_, i) => minOf(i))
  const allMaxs = sizes.map((_, i) => maxOf(i))
  const free: number[] = []
  let defined = 0
  sizes.forEach((size, i) => {
    if (size === undefined) free.push(i)
    else defined += size
  })

  if (free.length === 0) {
    if (defined <= EPS) return sizes.map(() => total / count)
    const scaled = Math.abs(defined - total) <= EPS ? (sizes as number[]) : sizes.map((size) => ((size as number) * total) / defined)
    return fitSizes(scaled, allMins, allMaxs, total)
  }

  const rest = total - defined
  if (rest < -EPS) return sizes.map((size) => (size === undefined ? 0 : (size * total) / defined))

  let sumMin = 0
  let sumMax = 0
  let limitMin = 0
  let limitMax = total
  for (const i of free) {
    sumMin += minOf(i)
    sumMax += maxOf(i)
    limitMin = Math.max(limitMin, minOf(i))
    limitMax = Math.min(limitMax, maxOf(i))
  }

  const average = rest / free.length
  let result: number[]
  if (sumMin > rest + EPS || sumMax < rest - EPS || (limitMin <= average + EPS && average <= limitMax + EPS)) {
    // Either the free limits cannot be met (share evenly, the fit pass decides)
    // or an even share already satisfies all of them.
    result = sizes.map((size) => size ?? average)
  } else {
    result = sizes.map((size) => size ?? 0)
    let remain = rest - sumMin
    for (const i of free) {
      const add = Math.min(maxOf(i) - minOf(i), remain)
      result[i] = minOf(i) + add
      remain -= add
    }
  }
  return fitSizes(result, allMins, allMaxs, total)
}

type Overrides = { refs: readonly SplitterPanelConfig[]; sizes: readonly number[] }

interface RegistryEntry {
  id: number;
  config: SplitterPanelConfig;
}

interface Session {
  index: number;
  confirmed: boolean;
  cache: number[];
  latest: number[];
}

const sameSizes = (a: readonly number[], b: readonly number[]) =>
  a.length === b.length && a.every((value, i) => Math.abs(value - b[i]) <= EPS)

const showIconOf = (
  prev: { collapsible: boolean; mode: SplitterCollapsibleIconMode },
  next: { collapsible: boolean; mode: SplitterCollapsibleIconMode },
): SplitterCollapsibleIconMode => {
  if (prev.collapsible && next.collapsible) {
    if (prev.mode === true || next.mode === true) return true
    if (prev.mode === 'auto' || next.mode === 'auto') return 'auto'
    return false
  }
  if (prev.collapsible) return prev.mode
  if (next.collapsible) return next.mode
  return false
}

const NO_BAR: SplitterBarInfo = {
  resizable: false,
  startCollapsible: false,
  endCollapsible: false,
  showStartCollapsibleIcon: false,
  showEndCollapsibleIcon: false,
}

/** Capabilities of the bar between panels `i` and `i + 1` for the given px sizes. */
const barInfoFor = (list: readonly SplitterPanelConfig[], sizes: readonly number[], i: number): SplitterBarInfo => {
  const prev = list[i]
  const next = list[i + 1]
  if (!prev || !next || sizes.length !== list.length) return NO_BAR
  const prevSize = sizes[i]
  const nextSize = sizes[i + 1]
  const prevCollapsible = normalizeCollapsible(prev.collapsible)
  const nextCollapsible = normalizeCollapsible(next.collapsible)
  const resizable = (prev.resizable ?? true) && (next.resizable ?? true)
    // A panel collapsed below its min cannot be dragged open, only expanded via its button.
    && (prevSize !== 0 || !prev.min)
    && (nextSize !== 0 || !next.min)

  const prevEndCollapsible = prevCollapsible.end && prevSize > 0
  const nextStartExpandable = nextCollapsible.start && nextSize === 0 && prevSize > 0
  const nextStartCollapsible = nextCollapsible.start && nextSize > 0
  const prevEndExpandable = prevCollapsible.end && prevSize === 0 && nextSize > 0
  return {
    resizable,
    startCollapsible: prevEndCollapsible || nextStartExpandable,
    endCollapsible: nextStartCollapsible || prevEndExpandable,
    showStartCollapsibleIcon: showIconOf(
      { collapsible: prevEndCollapsible, mode: prevCollapsible.showCollapsibleIcon },
      { collapsible: nextStartExpandable, mode: nextCollapsible.showCollapsibleIcon },
    ),
    showEndCollapsibleIcon: showIconOf(
      { collapsible: nextStartCollapsible, mode: nextCollapsible.showCollapsibleIcon },
      { collapsible: prevEndExpandable, mode: prevCollapsible.showCollapsibleIcon },
    ),
  }
}

/** Sizes a panel list starts from, before auto-fill: controlled `size`, remembered drag sizes, or `defaultSize`. */
const baseSizes = (list: readonly SplitterPanelConfig[], overrides: Overrides | null, total: number): (number | undefined)[] => {
  if (list.some((panel) => panel.size !== undefined)) return list.map((panel) => resolveSplitterSize(panel.size, total))
  if (overrides) {
    const byRef = list.map((panel) => {
      const at = overrides.refs.indexOf(panel)
      return at < 0 ? undefined : overrides.sizes[at]
    })
    if (byRef.every((size) => size !== undefined)) return byRef
    // Entries recreated on every read (inline literals): fall back to position.
    if (byRef.every((size) => size === undefined) && list.length === overrides.sizes.length) return [...overrides.sizes]
  }
  return list.map((panel) => resolveSplitterSize(panel.defaultSize, total))
}

const computeSizes = (list: readonly SplitterPanelConfig[], overrides: Overrides | null, total: number): number[] => {
  if (total <= 0 || list.length === 0) return []
  return autoSplitterSizes(
    baseSizes(list, overrides, total),
    list.map((panel) => resolveSplitterSize(panel.min, total)),
    list.map((panel) => resolveSplitterSize(panel.max, total)),
    total,
  )
}

const limitOf = (size: SplitterSize | undefined, total: number, fallback: number) => resolveSplitterSize(size, total) ?? fallback

/** Move the boundary after panel `index` by `offset` px; clamp order follows antd (start min, end min, start max, end max). */
const applyOffset = (list: readonly SplitterPanelConfig[], base: readonly number[], index: number, offset: number, total: number): number[] => {
  const next = [...base]
  const end = index + 1
  if (index < 0 || end >= next.length || !list[index] || !list[end]) return next
  const startMin = limitOf(list[index].min, total, 0)
  const endMin = limitOf(list[end].min, total, 0)
  const startMax = limitOf(list[index].max, total, total)
  const endMax = limitOf(list[end].max, total, total)
  let moved = offset
  if (next[index] + moved < startMin) moved = startMin - next[index]
  if (next[end] - moved < endMin) moved = next[end] - endMin
  if (next[index] + moved > startMax) moved = startMax - next[index]
  if (next[end] - moved > endMax) moved = next[end] - endMax
  next[index] += moved
  next[end] -= moved
  return next
}

/** Raw (unrounded) bar position and movable range in px. */
const barRange = (list: readonly SplitterPanelConfig[], sizes: readonly number[], i: number, total: number) => {
  let stack = 0
  const stacks = sizes.map((size) => (stack += size))
  const prevStack = stacks[i - 1] ?? 0
  const nextStack = stacks[i + 1] ?? total
  const min = (at: number) => limitOf(list[at]?.min, total, 0)
  const max = (at: number) => limitOf(list[at]?.max, total, total)
  return {
    now: stacks[i] ?? 0,
    min: Math.max(prevStack + min(i), nextStack - max(i + 1)),
    max: Math.min(prevStack + max(i), nextStack - min(i + 1)),
  }
}

const percent = (px: number, total: number) => {
  const value = (px / total) * 100
  return Number.isFinite(value) ? Math.round(value) : 0
}

export const createSplitter = (config: SplitterConfig = {}): SplitterIns => {
  // ownedWrite: every writer here is an imperative API called from event
  // handlers or component bodies (owned scopes in dev).
  const [_entries, _setEntries] = createSignal<RegistryEntry[]>([], { ownedWrite: true })
  const [_container, _setContainer] = createSignal(0, { ownedWrite: true })
  const [_overrides, _setOverrides] = createSignal<Overrides | null>(null, { ownedWrite: true })
  const [_moving, _setMoving] = createSignal<number | undefined>(undefined, { ownedWrite: true })

  // Synchronous mirrors: Solid 2 batches signal writes, so imperative paths
  // (keyboard start→update→end in one handler, consecutive resizeBy calls)
  // read these instead of the not-yet-committed signals.
  let entriesNow: RegistryEntry[] = []
  let containerNow = 0
  let overridesNow: Overrides | null = null
  let nextId = 1
  let session: Session | undefined
  /** Size a panel had before a collapse button zeroed it, keyed by bar index. */
  const collapsedCache: number[] = []

  const orientation = createMemo(() => resolveSplitterOrientation(config.orientation, config.vertical, config.layout))
  const isHorizontal = createMemo(() => orientation() === 'horizontal')
  const panels = createMemo<readonly SplitterPanelConfig[]>(() => config.items ?? _entries().map((entry) => entry.config))
  const sizes = createMemo(() => computeSizes(panels(), _overrides(), _container()))

  const listNow = (): readonly SplitterPanelConfig[] => config.items ?? entriesNow.map((entry) => entry.config)
  const sizesNow = () => computeSizes(listNow(), overridesNow, containerNow)

  const panelSizes = createMemo<(number | string | undefined)[]>(() => {
    if (_container() > 0) return sizes()
    const list = panels()
    const overrides = _overrides()
    return list.map((panel, i) => {
      const remembered = overrides && overrides.refs[i] === panel ? overrides.sizes[i] : undefined
      return panel.size ?? remembered ?? panel.defaultSize
    })
  })

  const register = (panel: SplitterPanelConfig): SplitterPanelHandle => {
    const id = nextId++
    entriesNow = [...entriesNow, { id, config: panel }]
    _setEntries(entriesNow)
    return {
      index: () => _entries().findIndex((entry) => entry.id === id),
      dispose: () => {
        entriesNow = entriesNow.filter((entry) => entry.id !== id)
        _setEntries(entriesNow)
      },
    }
  }

  const setContainerSize = (px: number) => {
    if (!(px > 0)) return
    containerNow = px
    _setContainer(px)
  }

  const commit = (list: readonly SplitterPanelConfig[], next: number[]) => {
    overridesNow = { refs: [...list], sizes: [...next] }
    _setOverrides(overridesNow)
  }

  const setMoving = (index: number | undefined) => _setMoving(() => index)

  const barInfo = (barIndex: number) => barInfoFor(panels(), sizes(), barIndex)

  const startResize = (barIndex: number, confirmed = false): boolean => {
    const list = listNow()
    const cache = sizesNow()
    if (!barInfoFor(list, cache, barIndex).resizable) return false
    session = { index: barIndex, confirmed, cache, latest: cache }
    setMoving(barIndex)
    config.onResizeStart?.([...cache])
    return true
  }

  const offsetUpdate = (active: Session, offset: number): number[] => {
    const list = listNow()
    if (!active.confirmed && offset !== 0) {
      // Several bars can share one position (a zero-size panel between them).
      // Dragging forward moves the pressed bar; dragging backward moves the
      // nearest earlier bar whose panel still has size to give.
      if (offset > 0) active.confirmed = true
      else {
        for (let i = active.index; i >= 0; i -= 1) {
          if (active.cache[i] > 0 && barInfoFor(list, active.cache, i).resizable) {
            active.index = i
            active.confirmed = true
            break
          }
        }
      }
      setMoving(active.index)
    }
    const next = applyOffset(list, active.cache, active.index, offset, containerNow)
    active.latest = next
    commit(list, next)
    return next
  }

  const updateResize = (_barIndex: number, offset: number): number[] => {
    if (!session) return sizesNow()
    const next = offsetUpdate(session, offset)
    config.onResize?.([...next])
    return next
  }

  const endResize = (lazyOffset?: number) => {
    const active = session
    if (!active) {
      config.onResizeEnd?.(sizesNow())
      return
    }
    session = undefined
    const final = lazyOffset === undefined ? active.latest : offsetUpdate(active, lazyOffset)
    setMoving(undefined)
    config.onResizeEnd?.([...final])
  }

  const resizeBy = (barIndex: number, deltaPx: number): boolean => {
    const list = listNow()
    const base = sizesNow()
    if (!barInfoFor(list, base, barIndex).resizable) return false
    const next = applyOffset(list, base, barIndex, deltaPx, containerNow)
    if (sameSizes(next, base)) return false
    commit(list, next)
    config.onResize?.([...next])
    return true
  }

  const keyboardResize = (barIndex: number, key: string): boolean => {
    const step = config.keyboardStep ?? DEFAULT_KEYBOARD_STEP
    const horizontal = isHorizontal()
    const forward = horizontal ? 'ArrowRight' : 'ArrowDown'
    const backward = horizontal ? 'ArrowLeft' : 'ArrowUp'
    const offset = key === forward ? step
      : key === backward ? -step
        : key === 'Home' ? -containerNow
          : key === 'End' ? containerNow
            : undefined
    if (offset === undefined) return false
    // The focused bar itself moves: the session starts already confirmed.
    if (!startResize(barIndex, true)) return false
    updateResize(barIndex, offset)
    endResize()
    return true
  }

  const collapse = (barIndex: number, type: SplitterCollapseType): boolean => {
    const list = listNow()
    const current = sizesNow()
    const info = barInfoFor(list, current, barIndex)
    if (!(type === 'start' ? info.startCollapsible : info.endCollapsible)) return false
    const total = containerNow
    const next = [...current]
    const currentIndex = type === 'start' ? barIndex : barIndex + 1
    const targetIndex = type === 'start' ? barIndex + 1 : barIndex
    const currentSize = next[currentIndex]
    const targetSize = next[targetIndex]

    if (currentSize !== 0 && targetSize !== 0) {
      // Collapse: hand everything to the neighbour and remember the size.
      next[currentIndex] = 0
      next[targetIndex] += currentSize
      collapsedCache[barIndex] = currentSize
    } else {
      // Expand the zero-size target back out of `current`.
      const pair = currentSize + targetSize
      const currentMin = limitOf(list[currentIndex].min, total, 0)
      const currentMax = limitOf(list[currentIndex].max, total, total)
      const targetMin = limitOf(list[targetIndex].min, total, 0)
      const targetMax = limitOf(list[targetIndex].max, total, total)
      const limitStart = Math.max(currentMin, pair - targetMax)
      const limitEnd = Math.min(currentMax, pair - targetMin)
      const cached = collapsedCache[barIndex]
      const rest = pair - (cached ?? 0)
      const useCache = !!cached
        && cached <= targetMax && cached >= targetMin
        && rest <= currentMax && rest >= currentMin
      if (useCache) {
        next[targetIndex] = cached
        next[currentIndex] = rest
      } else {
        const half = targetMin || (limitEnd - limitStart) / 2
        next[currentIndex] -= half
        next[targetIndex] += half
      }
    }

    commit(list, next)
    config.onResize?.([...next])
    config.onResizeEnd?.([...next])
    config.onCollapse?.(next.map((size) => Math.abs(size) < EPS), [...next])
    return true
  }

  const aria = (barIndex: number): SplitterAria => {
    const total = _container()
    const range = barRange(panels(), sizes(), barIndex, total)
    return { valueNow: percent(range.now, total), valueMin: percent(range.min, total), valueMax: percent(range.max, total) }
  }

  const constrainOffset = (barIndex: number, offset: number): number => {
    const total = containerNow
    const range = barRange(listNow(), sizesNow(), barIndex, total)
    const min = Math.max(0, range.min)
    const max = Math.min(total, range.max)
    return clamp(range.now + offset, min, Math.max(min, max)) - range.now
  }

  return {
    sizes,
    panelSizes,
    panels,
    orientation,
    isHorizontal,
    containerSize: _container,
    movingIndex: _moving,
    register,
    barInfo,
    isBarDisabled: (barIndex) => !barInfo(barIndex).resizable,
    setContainerSize,
    startResize: (barIndex) => startResize(barIndex),
    updateResize,
    endResize,
    resizeBy,
    keyboardResize,
    collapse,
    aria,
    constrainOffset,
  }
}
