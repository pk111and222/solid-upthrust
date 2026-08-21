import { createEffect, createMemo, createSignal } from "solid-js";
import { BREAKPOINTS, type Breakpoint } from "./breakpoint";

export type SiderCollapseType = 'clickTrigger' | 'breakpoint'

export type SiderConfig = {
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  collapsible?: boolean;
  breakpoint?: Breakpoint;
  onCollapse?: (collapsed: boolean, type: SiderCollapseType) => void;
  onBreakpoint?: (broken: boolean) => void;
  /** Dependency injection for tests / non-browser environments. */
  matchMedia?: (query: string) => MediaQueryList;
}

export type SiderIns = {
  collapsed: () => boolean;
  broken: () => boolean;
  toggle: () => void;
}

const resolveMatchMedia = (config: SiderConfig) => {
  if (config.matchMedia) return config.matchMedia
  return typeof globalThis.matchMedia === 'function'
    ? globalThis.matchMedia.bind(globalThis)
    : undefined
}

export const createSider = (config: SiderConfig = {}): SiderIns => {
  // ownedWrite: toggle() is an imperative API invoked from event handlers.
  const [_collapsed, _setCollapsed] = createSignal(!!config.defaultCollapsed, { ownedWrite: true })
  const [_broken, _setBroken] = createSignal(false, { ownedWrite: true })

  const collapsed = createMemo(() => config.collapsed !== undefined ? config.collapsed : _collapsed())

  const applyCollapsed = (next: boolean, type: SiderCollapseType) => {
    _setCollapsed(next)
    config.onCollapse?.(next, type)
  }

  const toggle = () => applyCollapsed(!collapsed(), 'clickTrigger')

  // Watch the breakpoint media query: below it the sider auto-collapses.
  createEffect(
    () => config.breakpoint ?? null,
    (breakpoint) => {
      if (!breakpoint) return
      const mm = resolveMatchMedia(config)?.(`(max-width: ${BREAKPOINTS[breakpoint] - 0.02}px)`)
      if (!mm) return

      const applyMatch = (matches: boolean) => {
        _setBroken(matches)
        config.onBreakpoint?.(matches)
        applyCollapsed(matches, 'breakpoint')
      }

      applyMatch(mm.matches)
      const handleChange = (e: MediaQueryListEvent) => applyMatch(e.matches)
      mm.addEventListener('change', handleChange)
      return () => mm.removeEventListener('change', handleChange)
    }
  )

  return {
    collapsed,
    broken: _broken,
    toggle
  }
}

export const siderSplits: (keyof SiderConfig)[] = [
  'collapsed',
  'defaultCollapsed',
  'collapsible',
  'breakpoint',
  'onCollapse',
  'onBreakpoint',
]
