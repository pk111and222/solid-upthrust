import { createSignal, onCleanup, type Accessor } from 'solid-js'
import { SCREEN_KEYS, SCREEN_QUERIES, type Screen } from './breakpoint'

/** Which screens currently match; missing keys mean "not known" (SSR) rather than false. */
export type ScreenMap = Partial<Record<Screen, boolean>>

/** A per-screen value map, e.g. `{ xs: 8, md: 16 }`. */
export type ResponsiveValue<T> = Partial<Record<Screen, T>>

type MatchMedia = (query: string) => MediaQueryList

export type BreakpointConfig = {
  /** Dependency injection for tests / non-browser environments. Defaults to `globalThis.matchMedia`. */
  matchMedia?: MatchMedia
}

export type BreakpointIns = {
  /** Current screen map, or `null` when the environment has no matchMedia (SSR). */
  screens: Accessor<ScreenMap | null>
}

/** Widest screen first: responsive lookups take the widest matching screen that defines a value. */
const WIDE_FIRST = [...SCREEN_KEYS].reverse()

type Observer = {
  snapshot: () => ScreenMap
  subscribe: (listener: (screens: ScreenMap) => void) => () => void
}

/**
 * One observer per matchMedia implementation: every Grid/useBreakpoint on the
 * page shares a single set of 7 MediaQueryList listeners, registered with the
 * first subscriber and removed with the last one.
 */
const observers = new WeakMap<MatchMedia, Observer>()

const getObserver = (matchMedia: MatchMedia): Observer => {
  const existing = observers.get(matchMedia)
  if (existing) return existing

  const query = (screen: Screen) => matchMedia.call(globalThis, SCREEN_QUERIES[screen])
  const read = (): ScreenMap => Object.fromEntries(SCREEN_KEYS.map((screen) => [screen, query(screen).matches]))
  const listeners = new Set<(screens: ScreenMap) => void>()
  let current: ScreenMap = {}
  let teardown: (() => void)[] = []

  const observer: Observer = {
    snapshot: () => (listeners.size ? current : read()),
    subscribe(listener) {
      if (listeners.size === 0) {
        current = read()
        for (const screen of SCREEN_KEYS) {
          const mql = query(screen)
          const onChange = (event: MediaQueryListEvent) => {
            if (current[screen] === event.matches) return
            current = { ...current, [screen]: event.matches }
            for (const notify of [...listeners]) notify(current)
          }
          mql.addEventListener('change', onChange)
          teardown.push(() => mql.removeEventListener('change', onChange))
        }
      }
      listeners.add(listener)
      return () => {
        if (!listeners.delete(listener) || listeners.size) return
        for (const remove of teardown) remove()
        teardown = []
      }
    },
  }
  observers.set(matchMedia, observer)
  return observer
}

const resolveMatchMedia = (config: BreakpointConfig): MatchMedia | undefined =>
  config.matchMedia ?? (typeof globalThis.matchMedia === 'function' ? globalThis.matchMedia : undefined)

/**
 * Reactive screen map. The initial value is read synchronously (no first-frame
 * flash); the subscription is released with the calling owner, so call it
 * inside a component or `createRoot`.
 */
export const createBreakpoint = (config: BreakpointConfig = {}): BreakpointIns => {
  const matchMedia = resolveMatchMedia(config)
  if (!matchMedia) return { screens: () => null }

  const observer = getObserver(matchMedia)
  const [screens, setScreens] = createSignal<ScreenMap | null>(observer.snapshot())
  onCleanup(observer.subscribe((next) => setScreens(next)))
  return { screens }
}

const isResponsiveMap = <T>(value: T | ResponsiveValue<T>): value is ResponsiveValue<T> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/**
 * Resolve a plain-or-responsive value: plain values pass through; for a map,
 * return the value of the widest matching screen that defines one. `null`
 * screens (SSR) count every screen as matching, so the widest defined value wins.
 */
export const resolveResponsive = <T>(value: T | ResponsiveValue<T> | undefined, screens: ScreenMap | null): T | undefined => {
  if (value === undefined || !isResponsiveMap(value)) return value
  for (const screen of WIDE_FIRST) {
    if (screens && !screens[screen]) continue
    if (value[screen] !== undefined) return value[screen]
  }
  return undefined
}
