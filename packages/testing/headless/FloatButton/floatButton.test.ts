import { createRoot, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import {
  createFloatButton, createFloatButtonGroup, easeInOutCubic, floatButtonGroupPlacement, getFloatScrollTop,
} from '../../../competence/src/floatButton'

const step = (fn: () => void) => { fn(); flush() }

/** 可控 scrollY 的 window 桩（`window === self` 让 isWindow 命中）。 */
const mkWindow = (initial = 0) => {
  const w = {
    scrollY: initial,
    pageXOffset: 0,
    listeners: new Set<() => void>(),
    addEventListener: (_t: string, fn: () => void) => { w.listeners.add(fn) },
    removeEventListener: (_t: string, fn: () => void) => { w.listeners.delete(fn) },
    scrollTo: vi.fn((_x: number, y: number) => { w.scrollY = y }),
    fire: () => { for (const l of w.listeners) l() },
  } as Record<string, unknown> & { scrollY: number; listeners: Set<() => void>; scrollTo: ReturnType<typeof vi.fn>; fire: () => void }
  w.window = w
  return w
}

/** 同步 rAF 注入：滚动检测在 step 内完成。 */
const syncRaf = {
  requestAnimationFrame: (cb: () => void) => { cb(); return 0 },
  cancelAnimationFrame: () => {},
}

describe('createFloatButton — visibility', () => {
  // 不设 visibilityHeight 时恒可见（普通 FloatButton）。
  it('[float-button.headless.always] without visibilityHeight the button is always visible', () => {
    createRoot(() => {
      expect(createFloatButton({}).visible()).toBe(true)
    })
  })

  // antd：scrollTop >= visibilityHeight 才可见（恰好等于阈值也可见），回落后隐藏并上报。
  it('[float-button.headless.threshold] visible at scrollTop >= threshold, hides again', () => {
    createRoot(() => {
      const win = mkWindow(0)
      const onVisibleChange = vi.fn()
      const ins = createFloatButton({ visibilityHeight: 400, getScrollContainer: () => win as unknown as Window, onVisibleChange, ...syncRaf })
      expect(ins.visible()).toBe(false)
      step(() => { win.scrollY = 400; win.fire() })
      expect(ins.visible()).toBe(true)
      expect(onVisibleChange).toHaveBeenLastCalledWith(true)
      step(() => { win.scrollY = 100; win.fire() })
      expect(ins.visible()).toBe(false)
      expect(onVisibleChange).toHaveBeenLastCalledWith(false)
      expect(onVisibleChange).toHaveBeenCalledTimes(2)
    })
  })

  // visibilityHeight 0 一开始就可见；初始滚动位置已过阈值时绑定后立即可见。
  it('[float-button.headless.initial] visibilityHeight 0 and an initial position past the threshold', () => {
    createRoot(() => {
      expect(createFloatButton({ visibilityHeight: 0, getScrollContainer: () => mkWindow(0) as unknown as Window, ...syncRaf }).visible()).toBe(true)
      const ins = createFloatButton({ visibilityHeight: 400, getScrollContainer: () => mkWindow(900) as unknown as Window, ...syncRaf })
      flush()
      expect(ins.visible()).toBe(true)
    })
  })

  // 受控 visible 优先于滚动监听。
  it('[float-button.headless.controlled] controlled visible wins over scroll-spy', () => {
    createRoot(() => {
      const win = mkWindow(0)
      const ins = createFloatButton({ visible: true, visibilityHeight: 400, getScrollContainer: () => win as unknown as Window, ...syncRaf })
      step(() => { win.scrollY = 5000; win.fire() })
      expect(ins.visible()).toBe(true)
    })
  })

  // containerRef 注册元素滚动容器：绑定监听并立即检测一次。
  it('[float-button.headless.container-ref] containerRef binds an element container', () => {
    createRoot(() => {
      const listeners = new Set<() => void>()
      const el = { scrollTop: 800, addEventListener: (_t: string, fn: () => void) => { listeners.add(fn) }, removeEventListener: () => {} }
      const ins = createFloatButton({ visibilityHeight: 400, getScrollContainer: () => undefined, ...syncRaf })
      step(() => ins.containerRef(el as unknown as HTMLElement))
      expect(ins.visible()).toBe(true)
      step(() => { el.scrollTop = 100; for (const l of listeners) l() })
      expect(ins.visible()).toBe(false)
    })
  })

  // 离开 owner 时解绑滚动监听。
  it('[float-button.headless.cleanup] disposing the owner unbinds the scroll listener', () => {
    const win = mkWindow(0)
    createRoot((dispose) => {
      createFloatButton({ visibilityHeight: 400, getScrollContainer: () => win as unknown as Window, ...syncRaf })
      expect(win.listeners.size).toBe(1)
      dispose()
    })
    expect(win.listeners.size).toBe(0)
  })
})

describe('createFloatButton — back to top', () => {
  // BackTop 点击：注入的 scrollToTop 收到 duration（默认 450，可覆盖），随后触发 onClick；非 BackTop 只触发 onClick。
  it('[float-button.headless.back-top] click scrolls with the duration, then reports onClick', () => {
    createRoot(() => {
      const scrollToTop = vi.fn()
      const onClick = vi.fn()
      const back = createFloatButton({ backTop: true, visibilityHeight: 400, getScrollContainer: () => mkWindow(900) as unknown as Window, scrollToTop, onClick, ...syncRaf })
      expect(back.isBackTop()).toBe(true)
      step(() => back.handleClick())
      expect(scrollToTop).toHaveBeenCalledWith(450)
      expect(onClick).toHaveBeenCalledOnce()
      const slow = createFloatButton({ backTop: true, duration: 1000, scrollToTop, ...syncRaf })
      step(() => slow.handleClick())
      expect(scrollToTop).toHaveBeenLastCalledWith(1000)
      const plain = createFloatButton({ onClick })
      expect(plain.isBackTop()).toBe(false)
      step(() => plain.handleClick())
      expect(onClick).toHaveBeenCalledTimes(2)
      expect(scrollToTop).toHaveBeenCalledTimes(2)
    })
  })

  // 默认滚动动画（antd _util/scrollTo）：逐帧按 easeInOutCubic 从当前位置滚到 0，时长用尽后停止。
  it('[float-button.headless.animate] default animation eases the container to 0 over duration', () => {
    createRoot(() => {
      const win = mkWindow(1000)
      let clock = 0
      const frames: (() => void)[] = []
      const ins = createFloatButton({
        backTop: true, visibilityHeight: 400, duration: 400, getScrollContainer: () => win as unknown as Window,
        requestAnimationFrame: (cb) => { frames.push(cb); return frames.length }, cancelAnimationFrame: () => {}, now: () => clock,
      })
      frames.length = 0
      ins.handleClick()
      const run = (t: number) => { clock = t; frames.shift()!() }
      run(0)
      expect(win.scrollY).toBe(1000)
      run(200)
      expect(win.scrollY).toBe(500)
      run(300)
      expect(win.scrollY).toBeCloseTo(easeInOutCubic(300, 1000, 0, 400))
      run(500)
      expect(win.scrollY).toBe(0)
      expect(frames).toHaveLength(0)
    })
  })

  // easeInOutCubic 端点与中点；getFloatScrollTop 兼容 window / 元素。
  it('[float-button.headless.helpers] easing endpoints and getFloatScrollTop', () => {
    expect(easeInOutCubic(0, 800, 0, 450)).toBe(800)
    expect(easeInOutCubic(225, 800, 0, 450)).toBe(400)
    expect(easeInOutCubic(450, 800, 0, 450)).toBe(0)
    expect(getFloatScrollTop(mkWindow(321) as unknown as Window)).toBe(321)
    expect(getFloatScrollTop({ scrollTop: 42 })).toBe(42)
  })
})

describe('createFloatButtonGroup', () => {
  // 默认收起，defaultOpen 展开；无 trigger 时不是菜单模式。
  it('[float-button.headless.group-initial] collapsed by default, defaultOpen, menuMode', () => {
    createRoot(() => {
      expect(createFloatButtonGroup({}).open()).toBe(false)
      expect(createFloatButtonGroup({ defaultOpen: true }).open()).toBe(true)
      expect(createFloatButtonGroup({}).menuMode()).toBe(false)
      expect(createFloatButtonGroup({ trigger: 'click' }).menuMode()).toBe(true)
      expect(createFloatButtonGroup({ trigger: 'hover' }).menuMode()).toBe(true)
    })
  })

  // click 模式：触发按钮切换、组外点击关闭；hover 事件不生效。每次变化上报一次，相同值不重复上报。
  it('[float-button.headless.group-click] click trigger toggles and outside click closes', () => {
    createRoot(() => {
      const onOpenChange = vi.fn()
      const ins = createFloatButtonGroup({ trigger: 'click', onOpenChange })
      step(() => ins.onMouseEnter())
      expect(ins.open()).toBe(false)
      step(() => ins.onTriggerClick())
      expect(ins.open()).toBe(true)
      step(() => ins.onOutsideClick())
      expect(ins.open()).toBe(false)
      step(() => ins.onOutsideClick())
      expect(onOpenChange.mock.calls).toEqual([[true], [false]])
    })
  })

  // hover 模式：移入展开、移出收起；触发按钮点击与组外点击都不生效。
  it('[float-button.headless.group-hover] hover trigger opens on enter and closes on leave', () => {
    createRoot(() => {
      const ins = createFloatButtonGroup({ trigger: 'hover' })
      step(() => ins.onTriggerClick())
      expect(ins.open()).toBe(false)
      step(() => ins.onMouseEnter())
      expect(ins.open()).toBe(true)
      step(() => ins.onOutsideClick())
      expect(ins.open()).toBe(true)
      step(() => ins.onMouseLeave())
      expect(ins.open()).toBe(false)
    })
  })

  // 同一批次内连续切换基于同步镜像，不会因批处理读到旧值而抵消。
  it('[float-button.headless.group-batch] consecutive toggles in one batch compose', () => {
    createRoot(() => {
      const onOpenChange = vi.fn()
      const ins = createFloatButtonGroup({ trigger: 'click', onOpenChange })
      step(() => { ins.toggle(); ins.toggle(); ins.toggle() })
      expect(ins.open()).toBe(true)
      expect(onOpenChange.mock.calls).toEqual([[true], [false], [true]])
    })
  })

  // 受控 open 锁定状态，意图照常上报。
  it('[float-button.headless.group-controlled] controlled open pins the state and reports the intent', () => {
    createRoot(() => {
      const onOpenChange = vi.fn()
      const ins = createFloatButtonGroup({ trigger: 'click', open: true, onOpenChange })
      step(() => ins.toggle())
      expect(ins.open()).toBe(true)
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  // placement 合法值直通、非法值回退 top；废弃 direction 映射（up→top、down→bottom），placement 优先。
  it('[float-button.headless.placement] placement normalisation and legacy direction', () => {
    expect(floatButtonGroupPlacement()).toBe('top')
    expect(floatButtonGroupPlacement('left')).toBe('left')
    expect(floatButtonGroupPlacement('rt')).toBe('top')
    expect(floatButtonGroupPlacement(undefined, 'down')).toBe('bottom')
    expect(floatButtonGroupPlacement(undefined, 'up')).toBe('top')
    expect(floatButtonGroupPlacement(undefined, 'right')).toBe('right')
    expect(floatButtonGroupPlacement('bottom', 'left')).toBe('bottom')
  })
})
