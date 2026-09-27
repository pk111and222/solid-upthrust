import { createMemo, type Accessor } from "solid-js";
import { createBreakpoint, resolveResponsive, type ResponsiveValue, type ScreenMap } from "./responsive";

/** Column count, fixed or per screen (`{ xs: 1, md: 2, xl: 4 }`, Grid screen semantics). */
export type MasonryColumns = number | ResponsiveValue<number>

export type MasonryConfig = {
  /** Default 3. A responsive map falls back to `xs`, then 1, when no defined screen matches. */
  columns?: MasonryColumns;
  /**
   * Extension (not in antd): assign items to columns in reading order with
   * balanced counts (12 items / 5 columns → 3,3,2,2,2) instead of "shortest column first".
   */
  sequential?: boolean;
  /** Dependency injection for tests / non-browser environments. */
  matchMedia?: (query: string) => MediaQueryList;
}

export type MasonryIns<T = unknown> = {
  columnCount: Accessor<number>;
  /** Current screen map (shared breakpoint observer) — lets the UI resolve other responsive props such as gutter. */
  screens: Accessor<ScreenMap | null>;
  /** Split items into columns without measuring: round-robin, or balanced sequential when `sequential`. */
  distribute: (items: readonly T[]) => T[][];
}

export type MasonryPosition = { column: number; top: number }

export type MasonryLayout = {
  positions: MasonryPosition[];
  /** Container height: the tallest column, without the trailing vertical gutter. */
  height: number;
}

export const DEFAULT_MASONRY_COLUMNS = 3

/** Coerce to a usable column count (a positive integer). */
const toCount = (value: number | undefined) =>
  typeof value === 'number' && Number.isFinite(value) && value >= 1 ? Math.floor(value) : 1

/**
 * Resolve the column count for the current screens: numbers pass through; a
 * map takes the widest matching screen that defines a value, else `xs`, else 1.
 */
export const resolveMasonryColumns = (columns: MasonryColumns | undefined, screens: ScreenMap | null): number => {
  if (columns === undefined) return DEFAULT_MASONRY_COLUMNS
  if (typeof columns === 'number') return toCount(columns)
  return toCount(resolveResponsive(columns, screens) ?? columns.xs ?? 1)
}

/** One gutter direction: px, a size name (small 8 / middle 16 / large 24), or a per-screen map of those. */
export type MasonryGutterValue = number | 'small' | 'middle' | 'large'
export type MasonryGutter = MasonryGutterValue | ResponsiveValue<MasonryGutterValue>

const NAMED_GUTTER: Record<string, number> = { small: 8, middle: 16, large: 24 }

const toGutterPx = (value: MasonryGutterValue | undefined): number | undefined => {
  if (typeof value === 'number') return Number.isFinite(value) && value > 0 ? value : 0
  if (typeof value === 'string') return NAMED_GUTTER[value] ?? 0
  return undefined
}

/**
 * Resolve `[horizontal, vertical]` px gutters for the current screens (antd useGutter
 * semantics): a single value applies to both directions; an unresolved vertical
 * value falls back to the horizontal one; the default is 0.
 */
export const resolveMasonryGutter = (
  gutter: MasonryGutter | [MasonryGutter, MasonryGutter] | undefined,
  screens: ScreenMap | null,
): [number, number] => {
  const [h, v] = Array.isArray(gutter) ? gutter : [gutter, undefined]
  const pick = (value: MasonryGutter | undefined) => toGutterPx(resolveResponsive(value, screens))
  const horizontal = pick(h) ?? 0
  return [horizontal, pick(v) ?? horizontal]
}

/**
 * Place items top-down: each goes to the currently shortest column (the first
 * one on ties) unless `pins[i]` fixes its column (clamped into range). Stable
 * by order — a later item never moves an earlier one.
 */
export const computeMasonryLayout = (
  heights: readonly number[],
  columnCount: number,
  verticalGap: number,
  pins?: readonly (number | undefined)[],
): MasonryLayout => {
  const count = toCount(columnCount)
  const columnHeights = new Array<number>(count).fill(0)
  const positions = heights.map((height, i) => {
    const pinned = pins?.[i]
    const target = typeof pinned === 'number' && Number.isFinite(pinned)
      ? Math.min(Math.max(0, Math.floor(pinned)), count - 1)
      : columnHeights.indexOf(Math.min(...columnHeights))
    const top = columnHeights[target]
    columnHeights[target] += height + verticalGap
    return { column: target, top }
  })
  return { positions, height: Math.max(0, Math.max(...columnHeights) - verticalGap) }
}

/** Balanced sequential column per item: earlier columns take the remainder (12 / 5 → 3,3,2,2,2). */
export const sequentialColumns = (itemCount: number, columnCount: number): number[] => {
  const count = toCount(columnCount)
  const base = Math.floor(itemCount / count)
  const remainder = itemCount % count
  const result: number[] = []
  for (let column = 0; column < count; column += 1) {
    const size = base + (column < remainder ? 1 : 0)
    for (let k = 0; k < size; k += 1) result.push(column)
  }
  return result
}

export const createMasonry = <T = unknown>(config: MasonryConfig = {}): MasonryIns<T> => {
  const breakpoint = createBreakpoint({ matchMedia: config.matchMedia })
  const columnCount = createMemo(() => resolveMasonryColumns(config.columns, breakpoint.screens()))

  const distribute = (items: readonly T[]): T[][] => {
    const count = columnCount()
    const columns: T[][] = Array.from({ length: count }, () => [])
    if (config.sequential) {
      const assigned = sequentialColumns(items.length, count)
      items.forEach((item, i) => columns[assigned[i]].push(item))
    } else {
      items.forEach((item, i) => columns[i % count].push(item))
    }
    return columns
  }

  return { columnCount, screens: breakpoint.screens, distribute }
}

export const masonrySplits: (keyof MasonryConfig)[] = ['columns', 'sequential', 'matchMedia']
