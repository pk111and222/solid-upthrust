import { createEffect, createMemo, createSignal, untrack } from "solid-js";

/**
 * Panel size in px (`number`, e.g. `240`) or percent (`` `${number}%` ``).
 */
export type SplitterSize = number | `${number}%`

export type SplitterPanelConfig = {
  defaultSize?: SplitterSize;
  min?: SplitterSize;
  max?: SplitterSize;
  resizable?: boolean;
}

export type SplitterPanelHandle = {
  /** Reactive index inside the current panel registry (-1 once disposed). */
  index: () => number;
  dispose: () => void;
}

export type SplitterConfig = {
  layout?: 'horizontal' | 'vertical';
  keyboardStep?: number;
  onResize?: (sizes: number[]) => void;
  onResizeEnd?: (sizes: number[]) => void;
}

export type SplitterIns = {
  /** Panel sizes in px; empty until the container is first measured. */
  sizes: () => number[];
  panels: () => SplitterPanelConfig[];
  isHorizontal: () => boolean;
  register: (panel: SplitterPanelConfig) => SplitterPanelHandle;
  /** Bar after panel `barIndex` is disabled when either neighbor is non-resizable. */
  isBarDisabled: (barIndex: number) => boolean;
  /** Report the measured container size (px). First call normalizes sizes; later calls rescale. */
  setContainerSize: (px: number) => void;
  /** Positive delta grows panel `barIndex`, shrinking the next one; preserves the pair sum. */
  resizeBy: (barIndex: number, deltaPx: number) => boolean;
  /** Arrow keys step by `keyboardStep`; Home/End jump to the panel min/max. Returns handled. */
  keyboardResize: (barIndex: number, key: string) => boolean;
  endResize: () => void;
  aria: (barIndex: number) => { valueNow: number; valueMin: number; valueMax: number };
}

export const splitterSplits: (keyof SplitterConfig)[] = ['layout', 'onResize', 'onResizeEnd']

const DEFAULT_KEYBOARD_STEP = 16
const EPSILON = 1e-9

interface RegistryEntry {
  id: number;
  config: SplitterPanelConfig;
}

const resolveSize = (size: SplitterSize | undefined, total: number): number | undefined => {
  if (size === undefined) return undefined
  if (typeof size === 'number') return size
  const pct = parseFloat(size)
  return Number.isNaN(pct) ? undefined : (total * pct) / 100
}

export const createSplitter = (config: SplitterConfig = {}): SplitterIns => {
  const keyboardStep = () => config.keyboardStep ?? DEFAULT_KEYBOARD_STEP

  // ownedWrite: register()/resizeBy()/setContainerSize() are imperative APIs
  // invoked from event handlers and panel render — both owned scopes in dev.
  const [_entries, _setEntries] = createSignal<RegistryEntry[]>([], { ownedWrite: true })
  let _nextId = 1

  const [_sizes, _setSizes] = createSignal<number[]>([], { ownedWrite: true })
  const [_containerSize, _setContainerSize] = createSignal(0, { ownedWrite: true })

  const isHorizontal = createMemo(() => (config.layout ?? 'horizontal') === 'horizontal')

  const panels = createMemo(() => _entries().map((entry) => entry.config))

  const register = (panel: SplitterPanelConfig): SplitterPanelHandle => {
    const id = _nextId++
    _setEntries((prev) => [...prev, { id, config: panel }])
    return {
      index: () => _entries().findIndex((entry) => entry.id === id),
      dispose: () => _setEntries((prev) => prev.filter((entry) => entry.id !== id)),
    }
  }

  const constraintsOf = (index: number, total: number) => {
    const list = panels()
    const panel = list[index]
    const min = resolveSize(panel?.min, total) ?? 0
    const max = resolveSize(panel?.max, total) ?? Number.POSITIVE_INFINITY
    return { min, max: Math.max(min, max) }
  }

  /** Resolve defaultSize (px/%) for every panel; panels without one share the rest. */
  const normalize = (total: number): number[] => {
    const list = panels()
    const resolved = list.map((panel) => resolveSize(panel.defaultSize, total))
    const fixedTotal = resolved.reduce((sum: number, v) => sum + (v ?? 0), 0)
    const flexCount = resolved.filter((v) => v === undefined).length
    const flexShare = flexCount > 0 ? Math.max(0, total - fixedTotal) / flexCount : 0
    return applyBounds(resolved.map((v) => v ?? flexShare), total)
  }

  /**
   * Clamp panels to their min/max, then redistribute the created slack across
   * unclamped panels so the sum still matches the container. When every panel
   * is bound-locked the total over/underflows — the documented degenerate case.
   */
  const applyBounds = (sizes: number[], total: number): number[] => {
    const list = panels()
    const result = [...sizes]
    for (let pass = 0; pass <= list.length; pass++) {
      let slack = 0
      const locked = new Set<number>()
      for (let i = 0; i < list.length; i++) {
        const { min, max } = constraintsOf(i, total)
        if (result[i] < min) {
          slack -= min - result[i]
          result[i] = min
          locked.add(i)
        } else if (result[i] > max) {
          slack += result[i] - max
          result[i] = max
          locked.add(i)
        }
      }
      const free = list.map((_, i) => i).filter((i) => !locked.has(i))
      if (slack === 0 || free.length === 0) break
      const share = slack / free.length
      for (const i of free) result[i] += share
    }
    return result
  }

  // Normalize on first measurement, rescale proportionally on container
  // resize, re-normalize when the panel set changes. The effect callback reads
  // sizes/constraints untracked — every write is derived from the compute
  // snapshot, never from reactive reads inside the effect body.
  createEffect(
    () => ({ count: panels().length, container: _containerSize() }),
    ({ count, container }) => {
      if (count === 0) {
        _setSizes([])
        return
      }
      if (container <= 0) return
      _setSizes((prev) => {
        if (prev.length === count) {
          const prevTotal = prev.reduce((sum, v) => sum + v, 0)
          if (prevTotal > 0) {
            const ratio = container / prevTotal
            return untrack(() => applyBounds(prev.map((v) => v * ratio), container))
          }
        }
        return untrack(() => normalize(container))
      })
    }
  )

  const setContainerSize = (px: number) => {
    if (px > 0) _setContainerSize(px)
  }

  /** Move the boundary between panels `i` and `i+1` to `target` px for panel i,
   *  clamping both sides while keeping the pair sum strictly constant. */
  const pairResize = (i: number, target: number): boolean => {
    const sizes = _sizes()
    if (i < 0 || i + 1 >= sizes.length) return false
    const container = _containerSize()
    const a = sizes[i]
    const b = sizes[i + 1]
    const { min: minA, max: maxA } = constraintsOf(i, container)
    const { min: minB, max: maxB } = constraintsOf(i + 1, container)

    const aTarget = Math.min(Math.max(target, minA), maxA)
    const bTarget = Math.min(Math.max(b - (aTarget - a), minB), maxB)
    const aFinal = a + (b - bTarget)
    // Both-side constraint conflict (or no actual change): give up this move.
    if (aFinal < minA - EPSILON || aFinal > maxA + EPSILON) return false
    if (Math.abs(aFinal - a) < EPSILON && Math.abs(bTarget - b) < EPSILON) return false

    const next = [...sizes]
    next[i] = aFinal
    next[i + 1] = bTarget
    _setSizes(next)
    config.onResize?.(next)
    return true
  }

  const resizeBy = (barIndex: number, deltaPx: number): boolean => {
    const sizes = _sizes()
    if (barIndex < 0 || barIndex + 1 >= sizes.length) return false
    return pairResize(barIndex, sizes[barIndex] + deltaPx)
  }

  const keyboardResize = (barIndex: number, key: string): boolean => {
    const step = keyboardStep()
    if (isHorizontal()) {
      if (key === 'ArrowRight') return resizeBy(barIndex, step)
      if (key === 'ArrowLeft') return resizeBy(barIndex, -step)
    } else {
      if (key === 'ArrowDown') return resizeBy(barIndex, step)
      if (key === 'ArrowUp') return resizeBy(barIndex, -step)
    }
    if (key === 'Home' || key === 'End') {
      const sizes = _sizes()
      if (barIndex < 0 || barIndex + 1 >= sizes.length) return false
      const container = _containerSize()
      const basis = container > 0 ? container : sizes[barIndex] + sizes[barIndex + 1]
      const { min, max } = constraintsOf(barIndex, basis)
      const pairTotal = sizes[barIndex] + sizes[barIndex + 1]
      const target = key === 'Home' ? min : Math.min(max, pairTotal)
      return pairResize(barIndex, target)
    }
    return false
  }

  const endResize = () => {
    config.onResizeEnd?.([..._sizes()])
  }

  const isBarDisabled = (barIndex: number): boolean => {
    const list = panels()
    const start = list[barIndex]?.resizable ?? true
    const end = list[barIndex + 1]?.resizable ?? true
    return !(start && end)
  }

  const aria = (barIndex: number) => {
    const sizes = _sizes()
    const container = _containerSize()
    const pairTotal = (sizes[barIndex] ?? 0) + (sizes[barIndex + 1] ?? 0)
    const basis = container > 0 ? container : pairTotal
    const { min, max } = constraintsOf(barIndex, basis)
    return {
      valueNow: Math.round(sizes[barIndex] ?? 0),
      valueMin: Math.round(min),
      valueMax: Math.round(Math.min(max, pairTotal)),
    }
  }

  return {
    sizes: _sizes,
    panels,
    isHorizontal,
    register,
    isBarDisabled,
    setContainerSize,
    resizeBy,
    keyboardResize,
    endResize,
    aria
  }
}
