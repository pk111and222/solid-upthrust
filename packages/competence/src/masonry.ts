import { createEffect, createMemo, createSignal } from "solid-js";
import { BREAKPOINTS, BREAKPOINT_KEYS, type Breakpoint } from "./breakpoint";

export type MasonryColumns = number | Partial<Record<Breakpoint, number>>

export type MasonryConfig = {
  columns: MasonryColumns;
  sequential?: boolean;
  /** Dependency injection for tests / non-browser environments. */
  matchMedia?: (query: string) => MediaQueryList;
}

export type MasonryIns<T = unknown> = {
  columnCount: () => number;
  distribute: (items: readonly T[]) => T[][];
}

const DEFAULT_COLUMNS = 4

const resolveMatchMedia = (config: MasonryConfig) => {
  if (config.matchMedia) return config.matchMedia
  return typeof globalThis.matchMedia === 'function'
    ? globalThis.matchMedia.bind(globalThis)
    : undefined
}

const validKeys = (columns: Partial<Record<Breakpoint, number>>): Breakpoint[] =>
  BREAKPOINT_KEYS.filter((bp) => typeof columns[bp] === 'number')

const byWidthDesc = (a: Breakpoint, b: Breakpoint) => BREAKPOINTS[b] - BREAKPOINTS[a]

export const createMasonry = <T = unknown>(config: MasonryConfig): MasonryIns<T> => {
  const [_matches, _setMatches] = createSignal<Partial<Record<Breakpoint, boolean>>>({}, { ownedWrite: true })

  // Subscribe to a media query per defined breakpoint key. The compute returns
  // the serialized key set so replacing the columns object with a different
  // key set (same type, new identity) re-subscribes correctly.
  createEffect(
    () => {
      const columns = config.columns
      if (typeof columns === 'number') return ''
      return validKeys(columns).sort(byWidthDesc).join('|')
    },
    (key) => {
      if (!key) return
      const mm = resolveMatchMedia(config)
      if (!mm) return

      const keys = key.split('|') as Breakpoint[]
      const initial: Partial<Record<Breakpoint, boolean>> = {}
      const cleanups: (() => void)[] = []
      for (const bp of keys) {
        const mql = mm(`(min-width: ${BREAKPOINTS[bp]}px)`)
        initial[bp] = mql.matches
        const handleChange = (e: MediaQueryListEvent) => {
          _setMatches((prev) => ({ ...prev, [bp]: e.matches }))
        }
        mql.addEventListener('change', handleChange)
        cleanups.push(() => mql.removeEventListener('change', handleChange))
      }
      // Synchronous initial read prevents a first-frame default-columns flash.
      _setMatches(initial)
      return () => {
        for (const cleanup of cleanups) cleanup()
      }
    }
  )

  const columnCount = createMemo(() => {
    const columns = config.columns
    if (typeof columns === 'number') return columns
    const keys = validKeys(columns).sort(byWidthDesc)
    if (keys.length === 0) return DEFAULT_COLUMNS
    const matches = _matches()
    const hit = keys.find((bp) => matches[bp])
    if (hit) return columns[hit] as number
    // Below every defined breakpoint: fall back to the smallest one.
    return columns[keys[keys.length - 1]] as number
  })

  const distribute = (items: readonly T[]): T[][] => {
    const count = Math.max(1, columnCount())
    const cols: T[][] = Array.from({ length: count }, () => [])

    if (config.sequential) {
      // Balanced sequential fill: earlier columns take the remainder so no
      // trailing column stays empty (12 items / 5 columns -> 3,3,2,2,2).
      const base = Math.floor(items.length / count)
      const remainder = items.length % count
      const capacities = Array.from({ length: count }, (_, i) => base + (i < remainder ? 1 : 0))
      let col = 0
      for (const item of items) {
        while (col < count && capacities[col] <= 0) col++
        if (col >= count) break
        cols[col].push(item)
        capacities[col] -= 1
      }
    } else {
      items.forEach((item, i) => cols[i % count].push(item))
    }

    return cols
  }

  return {
    columnCount,
    distribute
  }
}

export const masonrySplits: (keyof MasonryConfig)[] = ['columns', 'sequential']
