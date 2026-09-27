import { createRoot, createSignal, flush } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  SIDER_BREAKPOINT_MAX_WIDTHS, createSider, siderBreakpointQuery, siderSplits,
  type SiderBreakpoint, type SiderConfig,
} from '../../../competence/src/sider'
import { createFakeMatchMedia } from '../../utils/matchMedia'

const mdQuery = siderBreakpointQuery('md')
const lgQuery = siderBreakpointQuery('lg')

let dispose = () => {}
afterEach(() => { dispose(); dispose = () => {}; vi.unstubAllGlobals() })

/** 在独立 owner 里创建 sider；测试结束统一释放。 */
const setup = (config: SiderConfig) => createRoot((release) => {
  dispose = release
  const sider = createSider(config)
  flush()
  return sider
})

describe('createSider 收起状态', () => {
  // 默认展开；defaultCollapsed 决定非受控初始值。
  it('[sider.state.default] defaults to expanded and honors defaultCollapsed', () => {
    expect(setup({}).collapsed()).toBe(false)
    dispose()
    expect(setup({ defaultCollapsed: true }).collapsed()).toBe(true)
  })

  // 非受控：toggle 翻转内部状态，每次都以 'clickTrigger' 通知 onCollapse。
  it('[sider.state.toggle] toggles internal state and reports clickTrigger', () => {
    const onCollapse = vi.fn()
    const sider = setup({ onCollapse })
    sider.toggle(); flush()
    expect(sider.collapsed()).toBe(true)
    sider.toggle(); flush()
    expect(sider.collapsed()).toBe(false)
    expect(onCollapse.mock.calls).toEqual([[true, 'clickTrigger'], [false, 'clickTrigger']])
  })

  // 受控：collapsed 以 prop 为准，toggle 只通知期望的新值；prop 更新后状态随之变化。
  it('[sider.state.controlled] follows the controlled prop and reports the requested value', () => {
    const onCollapse = vi.fn()
    const [collapsed, setCollapsed] = createSignal(true)
    const sider = setup({ get collapsed() { return collapsed() }, onCollapse })
    expect(sider.collapsed()).toBe(true)
    sider.toggle(); flush()
    expect(sider.collapsed()).toBe(true)
    expect(onCollapse).toHaveBeenLastCalledWith(false, 'clickTrigger')
    setCollapsed(false); flush()
    expect(sider.collapsed()).toBe(false)
    sider.toggle(); flush()
    expect(onCollapse).toHaveBeenLastCalledWith(true, 'clickTrigger')
  })

  // 同一批次内连续 toggle 以已提交值为基准，结果可预测（与 React setState 同步语义一致）。
  it('[sider.state.toggle-batch] reads the committed value on every toggle', () => {
    const onCollapse = vi.fn()
    const sider = setup({ onCollapse })
    sider.toggle(); flush(); sider.toggle(); flush(); sider.toggle(); flush()
    expect(sider.collapsed()).toBe(true)
    expect(onCollapse.mock.calls.map(([value]) => value)).toEqual([true, false, true])
  })
})

describe('createSider 响应式断点', () => {
  // 断点阈值：xs…xxl 为 BREAKPOINTS − 0.02（与 antd 一致），xxxl 与 Grid 的 1920 对齐。
  it('[sider.breakpoint.queries] maps every breakpoint to a max-width query', () => {
    expect(SIDER_BREAKPOINT_MAX_WIDTHS).toEqual({
      xs: 479.98, sm: 575.98, md: 767.98, lg: 991.98, xl: 1199.98, xxl: 1599.98, xxxl: 1919.98,
    })
    const keys = Object.keys(SIDER_BREAKPOINT_MAX_WIDTHS) as SiderBreakpoint[]
    expect(keys.map(siderBreakpointQuery)).toEqual([
      '(max-width: 479.98px)', '(max-width: 575.98px)', '(max-width: 767.98px)', '(max-width: 991.98px)',
      '(max-width: 1199.98px)', '(max-width: 1599.98px)', '(max-width: 1919.98px)',
    ])
  })

  // 低于断点收起、回到断点以上展开，来源记为 'responsive'；onBreakpoint 报告命中变化。
  it('[sider.breakpoint.change] collapses below the breakpoint and restores above it', () => {
    const mm = createFakeMatchMedia({ [mdQuery]: false })
    const onCollapse = vi.fn()
    const onBreakpoint = vi.fn()
    const sider = setup({ breakpoint: 'md', onCollapse, onBreakpoint, matchMedia: mm.matchMedia })
    expect(sider.broken()).toBe(false)
    expect(sider.collapsed()).toBe(false)

    mm.setMatch(mdQuery, true); flush()
    expect(sider.broken()).toBe(true)
    expect(sider.collapsed()).toBe(true)
    expect(onBreakpoint).toHaveBeenLastCalledWith(true)
    expect(onCollapse).toHaveBeenLastCalledWith(true, 'responsive')

    mm.setMatch(mdQuery, false); flush()
    expect(sider.broken()).toBe(false)
    expect(sider.collapsed()).toBe(false)
    expect(onCollapse).toHaveBeenLastCalledWith(false, 'responsive')
  })

  // 挂载时按当前宽度同步一次：已低于断点则立即收起，并通知 onBreakpoint(true)。
  it('[sider.breakpoint.initial-broken] applies the initial broken state on mount', () => {
    const mm = createFakeMatchMedia({ [mdQuery]: true })
    const onBreakpoint = vi.fn()
    const onCollapse = vi.fn()
    const sider = setup({ breakpoint: 'md', matchMedia: mm.matchMedia, onBreakpoint, onCollapse })
    expect(sider.broken()).toBe(true)
    expect(sider.collapsed()).toBe(true)
    expect(onBreakpoint.mock.calls).toEqual([[true]])
    expect(onCollapse.mock.calls).toEqual([[true, 'responsive']])
  })

  // 挂载时状态已一致：onBreakpoint(false) 照常调用，但 onCollapse 不应被调用（回归：旧实现无条件调用）。
  it('[sider.breakpoint.no-redundant-collapse] does not report onCollapse when the state already matches', () => {
    const mm = createFakeMatchMedia({ [mdQuery]: false })
    const onBreakpoint = vi.fn()
    const onCollapse = vi.fn()
    setup({ breakpoint: 'md', matchMedia: mm.matchMedia, onBreakpoint, onCollapse })
    expect(onBreakpoint.mock.calls).toEqual([[false]])
    expect(onCollapse).not.toHaveBeenCalled()
  })

  // 与 antd 一致：设置了 breakpoint 时，挂载时的断点结果覆盖 defaultCollapsed。
  it('[sider.breakpoint.default-collapsed] the breakpoint result overrides defaultCollapsed on mount', () => {
    const mm = createFakeMatchMedia({ [mdQuery]: false })
    const onCollapse = vi.fn()
    const sider = setup({ breakpoint: 'md', defaultCollapsed: true, matchMedia: mm.matchMedia, onCollapse })
    expect(sider.collapsed()).toBe(false)
    expect(onCollapse.mock.calls).toEqual([[false, 'responsive']])
  })

  // 手动展开后再跨过断点：只有状态需要变化时才通知；已收起时再次命中断点不重复通知。
  it('[sider.breakpoint.manual] mixes manual toggles with breakpoint changes', () => {
    const mm = createFakeMatchMedia({ [mdQuery]: true })
    const onCollapse = vi.fn()
    const sider = setup({ breakpoint: 'md', matchMedia: mm.matchMedia, onCollapse })
    sider.toggle(); flush()
    expect(sider.collapsed()).toBe(false)
    mm.setMatch(mdQuery, false); flush()
    expect(sider.collapsed()).toBe(false)
    expect(onCollapse.mock.calls).toEqual([[true, 'responsive'], [false, 'clickTrigger']])
    mm.setMatch(mdQuery, true); flush()
    expect(sider.collapsed()).toBe(true)
    expect(onCollapse).toHaveBeenLastCalledWith(true, 'responsive')
  })

  // 受控 + 断点：断点只通知期望值，状态仍以 prop 为准；父级采纳后后续变化按新 prop 比较。
  it('[sider.breakpoint.controlled] reports responsive changes without overriding the controlled prop', () => {
    const mm = createFakeMatchMedia({ [mdQuery]: false })
    const [collapsed, setCollapsed] = createSignal(false)
    const onCollapse = vi.fn()
    const sider = setup({ get collapsed() { return collapsed() }, breakpoint: 'md', matchMedia: mm.matchMedia, onCollapse })
    mm.setMatch(mdQuery, true); flush()
    expect(sider.broken()).toBe(true)
    expect(sider.collapsed()).toBe(false)
    expect(onCollapse).toHaveBeenLastCalledWith(true, 'responsive')
    setCollapsed(true); flush()
    mm.setMatch(mdQuery, false); flush()
    expect(onCollapse).toHaveBeenLastCalledWith(false, 'responsive')
    expect(onCollapse).toHaveBeenCalledTimes(2)
  })

  // breakpoint 可动态切换：旧查询的监听被移除，新查询立即生效；清空 breakpoint 后 broken 复位。
  it('[sider.breakpoint.dynamic] re-subscribes when the breakpoint changes', () => {
    const mm = createFakeMatchMedia({ [mdQuery]: false, [lgQuery]: true })
    const [breakpoint, setBreakpoint] = createSignal<SiderBreakpoint | undefined>('md')
    const onBreakpoint = vi.fn()
    const sider = setup({ get breakpoint() { return breakpoint() }, matchMedia: mm.matchMedia, onBreakpoint })
    expect(sider.broken()).toBe(false)

    setBreakpoint('lg'); flush()
    expect(sider.broken()).toBe(true)
    expect(sider.collapsed()).toBe(true)
    const calls = onBreakpoint.mock.calls.length
    mm.setMatch(mdQuery, true); flush()
    expect(onBreakpoint).toHaveBeenCalledTimes(calls)

    setBreakpoint(undefined); flush()
    expect(sider.broken()).toBe(false)
    expect(sider.collapsed()).toBe(true)
    mm.setMatch(lgQuery, false); flush()
    expect(onBreakpoint).toHaveBeenCalledTimes(calls)
  })

  // 释放 owner 后移除媒体查询监听，之后的宽度变化不再触发回调。
  it('[sider.breakpoint.cleanup] removes the media listener on dispose', () => {
    const mm = createFakeMatchMedia({ [mdQuery]: false })
    const onBreakpoint = vi.fn()
    setup({ breakpoint: 'md', matchMedia: mm.matchMedia, onBreakpoint })
    dispose(); dispose = () => {}
    mm.setMatch(mdQuery, true)
    expect(onBreakpoint).toHaveBeenCalledTimes(1)
  })

  // 没有 matchMedia（SSR）或断点名非法时静默忽略，不抛错、不收起。
  it('[sider.breakpoint.unsupported] ignores missing matchMedia and unknown breakpoints', () => {
    vi.stubGlobal('matchMedia', undefined)
    const ssr = setup({ breakpoint: 'md' })
    expect(ssr.broken()).toBe(false)
    expect(ssr.collapsed()).toBe(false)
    dispose()
    const mm = createFakeMatchMedia({})
    const spy = vi.fn(mm.matchMedia)
    const bogus = setup({ breakpoint: 'bogus' as SiderBreakpoint, matchMedia: spy })
    expect(spy).not.toHaveBeenCalled()
    expect(bogus.broken()).toBe(false)
  })

  // 未注入 matchMedia 时使用全局 matchMedia。
  it('[sider.breakpoint.global] falls back to the global matchMedia', () => {
    const mm = createFakeMatchMedia({ [siderBreakpointQuery('xxxl')]: true })
    vi.stubGlobal('matchMedia', mm.matchMedia)
    expect(setup({ breakpoint: 'xxxl' }).collapsed()).toBe(true)
  })
})

// splitProps 用的键表覆盖全部配置项（matchMedia 为测试注入，不属于组件 props）。
it('[sider.splits] lists every component-facing config key', () => {
  expect([...siderSplits].sort()).toEqual(['breakpoint', 'collapsed', 'collapsible', 'defaultCollapsed', 'onBreakpoint', 'onCollapse'])
})
