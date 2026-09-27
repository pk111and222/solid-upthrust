import { createEffect, createMemo, createSignal, untrack } from "solid-js";
import { BREAKPOINTS, SCREEN_MIN_WIDTHS, type Breakpoint } from "./breakpoint";

/** 收起/展开的来源：点击触发器，或断点响应（antd 同名 'responsive'）。 */
export type SiderCollapseType = 'clickTrigger' | 'responsive'

/** Sider 可用的响应断点：BREAKPOINTS 六档 + xxxl。 */
export type SiderBreakpoint = Breakpoint | 'xxxl'

/**
 * 各断点的 max-width 阈值（px）：宽度 ≤ 该值即视为“低于断点”。
 * xs…xxl 取 BREAKPOINTS − 0.02（与 antd 一致）；xxxl 与 Grid 的 xxxl（≥1920）对齐，
 * 而非 antd Sider 的 1839.98。
 */
export const SIDER_BREAKPOINT_MAX_WIDTHS: Record<SiderBreakpoint, number> = {
  xs: BREAKPOINTS.xs - 0.02,
  sm: BREAKPOINTS.sm - 0.02,
  md: BREAKPOINTS.md - 0.02,
  lg: BREAKPOINTS.lg - 0.02,
  xl: BREAKPOINTS.xl - 0.02,
  xxl: BREAKPOINTS.xxl - 0.02,
  xxxl: SCREEN_MIN_WIDTHS.xxxl - 0.02,
}

/** 断点对应的媒体查询。 */
export const siderBreakpointQuery = (breakpoint: SiderBreakpoint) =>
  `(max-width: ${SIDER_BREAKPOINT_MAX_WIDTHS[breakpoint]}px)`

export type SiderConfig = {
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  collapsible?: boolean;
  breakpoint?: SiderBreakpoint;
  onCollapse?: (collapsed: boolean, type: SiderCollapseType) => void;
  onBreakpoint?: (broken: boolean) => void;
  /** 依赖注入：测试或非浏览器环境传入自定义 matchMedia。 */
  matchMedia?: (query: string) => MediaQueryList;
}

export type SiderIns = {
  /** 当前是否收起（受控值优先）。 */
  collapsed: () => boolean;
  /** 当前宽度是否低于 breakpoint；未设置 breakpoint 时恒为 false。 */
  broken: () => boolean;
  /** 切换收起状态，来源记为 'clickTrigger'。 */
  toggle: () => void;
}

const resolveMatchMedia = (config: SiderConfig) => {
  if (config.matchMedia) return config.matchMedia
  return typeof globalThis.matchMedia === 'function'
    ? globalThis.matchMedia.bind(globalThis)
    : undefined
}

export const createSider = (config: SiderConfig = {}): SiderIns => {
  // ownedWrite：toggle 从事件处理器调用，断点回调从媒体查询监听器调用。
  const [_collapsed, _setCollapsed] = createSignal(!!config.defaultCollapsed, { ownedWrite: true })
  const [_broken, _setBroken] = createSignal(false, { ownedWrite: true })

  const collapsed = createMemo(() => config.collapsed !== undefined ? config.collapsed : _collapsed())

  const applyCollapsed = (next: boolean, type: SiderCollapseType) => {
    _setCollapsed(next)
    config.onCollapse?.(next, type)
  }

  const toggle = () => applyCollapsed(!untrack(collapsed), 'clickTrigger')

  // 监听断点媒体查询：低于断点时收起，回到断点以上时展开。挂载时立即按当前宽度同步一次。
  createEffect(
    () => config.breakpoint ?? null,
    (breakpoint) => {
      if (!breakpoint || !(breakpoint in SIDER_BREAKPOINT_MAX_WIDTHS)) {
        _setBroken(false)
        return
      }
      const mm = resolveMatchMedia(config)?.(siderBreakpointQuery(breakpoint))
      if (!mm) return

      const applyMatch = (matches: boolean) => {
        _setBroken(matches)
        config.onBreakpoint?.(matches)
        // 与 antd 一致：只有状态确实需要变化时才通知 onCollapse。
        if (untrack(collapsed) !== matches) applyCollapsed(matches, 'responsive')
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
