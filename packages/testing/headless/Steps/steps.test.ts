import { createRoot, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { createSteps } from '../../../competence/src/steps'

describe('createSteps status derivation', () => {
  // 当前步骤之前为 finish、当前为 process、之后为 wait。
  it('derives finish/process/wait from current', () => {
    createRoot((dispose) => {
      const s = createSteps({ current: 1, items: [{ title: 'a' }, { title: 'b' }, { title: 'c' }] })
      expect(s.getStepStatus(0)).toBe('finish')
      expect(s.getStepStatus(1)).toBe('process')
      expect(s.getStepStatus(2)).toBe('wait')
      expect(s.isFinish(0)).toBe(true)
      expect(s.isProcess(1)).toBe(true)
      expect(s.isError(1)).toBe(false)
      dispose()
    })
  })

  // 单项 status 覆盖由 current 推导出的状态。
  it('per-item status overrides derivation', () => {
    createRoot((dispose) => {
      const s = createSteps({
        current: 1,
        items: [
          { title: 'a', status: 'error' },
          { title: 'b' },
        ],
      })
      expect(s.getStepStatus(0)).toBe('error')
      expect(s.getStepStatus(1)).toBe('process')
      dispose()
    })
  })

  // config.status 只作用于当前步骤。
  it('config.status overrides the current step status', () => {
    createRoot((dispose) => {
      const s = createSteps({ current: 1, status: 'error', items: [{ title: 'a' }, { title: 'b' }] })
      expect(s.getStepStatus(1)).toBe('error')
      dispose()
    })
  })
})

describe('createSteps navigation', () => {
  // next / prev 在范围内移动并回调 onChange，越界时不移动也不回调。
  it('next/prev move within bounds and fire onChange', () => {
    createRoot((dispose) => {
      const onChange = vi.fn()
      const s = createSteps({ items: [{ title: 'a' }, { title: 'b' }, { title: 'c' }], onChange })
      s.next()
      flush()
      expect(s.current()).toBe(1)
      expect(onChange).toHaveBeenCalledWith(1)
      s.prev()
      flush()
      expect(s.current()).toBe(0)
      s.prev() // below zero — guard blocks, no callback
      flush()
      expect(s.current()).toBe(0)
      expect(onChange).toHaveBeenCalledTimes(2)
      dispose()
    })
  })

  // 受控 current 优先于内部状态：next 不改变显示的当前步骤。
  it('controlled current wins over internal state', () => {
    createRoot((dispose) => {
      const s = createSteps({ current: 2, items: [{ title: 'a' }, { title: 'b' }, { title: 'c' }] })
      s.next()
      flush()
      expect(s.current()).toBe(2)
      dispose()
    })
  })

  // 非受控时从 0 开始，由内部信号前进。
  it('uncontrolled mode starts at 0 and navigates internally', () => {
    createRoot((dispose) => {
      const s = createSteps({ items: [{ title: 'a' }, { title: 'b' }] })
      expect(s.current()).toBe(0)
      s.next()
      flush()
      expect(s.current()).toBe(1)
      dispose()
    })
  })

  // goTo 不带前跳守卫，可直接跳到任意步骤，但禁用步骤不可到达。
  it('goTo skips nothing but blocks disabled steps', () => {
    createRoot((dispose) => {
      const s = createSteps({
        items: [{ title: 'a' }, { title: 'b', disabled: true }, { title: 'c' }],
      })
      s.goTo(1)
      flush()
      expect(s.current()).toBe(0) // disabled blocked
      s.goTo(2)
      flush()
      expect(s.current()).toBe(2) // goTo itself allows free jump
      dispose()
    })
  })

  // navigateTo 走前跳守卫：可回退或前进一步，不能越过未完成步骤；越界不可到达。
  it('navigateTo honors the click guard: no forward jumps over unfinished steps', () => {
    createRoot((dispose) => {
      const s = createSteps({ items: [{ title: 'a' }, { title: 'b' }, { title: 'c' }] })
      expect(s.canGoTo(2)).toBe(false) // two ahead — blocked
      expect(s.canGoTo(1)).toBe(true)  // one ahead — natural next
      expect(s.canGoTo(0)).toBe(true)  // current — ok
      s.navigateTo(2) // blocked by guard
      flush()
      expect(s.current()).toBe(0)
      s.navigateTo(1) // allowed
      flush()
      expect(s.current()).toBe(1)
      // now at 1: back to 0 allowed, jumping to 2 allowed (cur+1)
      expect(s.canGoTo(0)).toBe(true)
      expect(s.canGoTo(2)).toBe(true)
      expect(s.canGoTo(3)).toBe(false) // out of range
      dispose()
    })
  })

  // clickNavigable=false 关闭守卫，navigateTo 可自由跳转。
  it('clickNavigable=false allows free navigation', () => {
    createRoot((dispose) => {
      const s = createSteps({ clickNavigable: false, items: [{ title: 'a' }, { title: 'b' }, { title: 'c' }] })
      expect(s.canGoTo(2)).toBe(true)
      s.navigateTo(2)
      flush()
      expect(s.current()).toBe(2)
      dispose()
    })
  })

  // reset 回到第一步并回调 onChange(0)。
  it('reset returns to the first step', () => {
    createRoot((dispose) => {
      const onChange = vi.fn()
      const s = createSteps({ items: [{ title: 'a' }, { title: 'b' }, { title: 'c' }], onChange })
      s.goTo(2)
      flush()
      expect(s.current()).toBe(2)
      s.reset()
      flush()
      expect(s.current()).toBe(0)
      expect(onChange).toHaveBeenCalledWith(0)
      dispose()
    })
  })

  // 下一步为禁用步骤时，next 经守卫拦截停在原地。
  it('next skips disabled steps via the guard path', () => {
    createRoot((dispose) => {
      const s = createSteps({
        items: [{ title: 'a' }, { title: 'b', disabled: true }, { title: 'c' }],
      })
      s.next() // cur+1 is disabled → canGoTo false → stays
      flush()
      expect(s.current()).toBe(0)
      dispose()
    })
  })
})

describe('createSteps percent', () => {
  // 整体进度 = (current + percent/100) / 总数，四舍五入。
  it('blends current step percent into overall progress', () => {
    createRoot((dispose) => {
      const s = createSteps({ current: 1, percent: 50, items: [{ title: 'a' }, { title: 'b' }, { title: 'c' }, { title: 'd' }] })
      // (1 + 0.5) / 4 = 37.5 → 38
      expect(s.percentOf()).toBe(38)
      dispose()
    })
  })

  // 未设置 percent 时当前步骤贡献 0。
  it('without percent the current step contributes 0', () => {
    createRoot((dispose) => {
      const s = createSteps({ current: 2, items: [{ title: 'a' }, { title: 'b' }, { title: 'c' }] })
      // 2/3 = 66.67 → 67
      expect(s.percentOf()).toBe(67)
      dispose()
    })
  })

  // percent 超出 0–100 时被钳制。
  it('clamps out-of-range percent', () => {
    createRoot((dispose) => {
      const s = createSteps({ current: 0, percent: 200, items: [{ title: 'a' }, { title: 'b' }] })
      // (0 + 1) / 2 = 50
      expect(s.percentOf()).toBe(50)
      dispose()
    })
  })

  // 空步骤列表的进度与总数都为 0。
  it('empty items yield 0', () => {
    createRoot((dispose) => {
      const s = createSteps({ items: [] })
      expect(s.percentOf()).toBe(0)
      expect(s.total()).toBe(0)
      dispose()
    })
  })
})
