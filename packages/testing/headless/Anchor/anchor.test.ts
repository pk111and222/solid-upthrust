import { createRoot, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { ANCHOR_SCROLL_SETTLE, anchorTargetId, createAnchor, getScrollTop, type AnchorItem } from '../../../competence/src/anchor'

/**
 * Minimal DOM stand-ins: anchors only need getElementById + getBoundingClientRect
 * on the target sections, plus a scrollable container with scrollTo/addEventListener.
 */
type SectionRect = { top: number; height: number }

const makeSection = (rect: SectionRect) => ({
  getBoundingClientRect: () => ({ top: rect.top, height: rect.height }),
})

const makeContainer = (initialTop = 0) => {
  const listeners = new Set<() => void>()
  const container = {
    scrollTop: initialTop,
    getBoundingClientRect: () => ({ top: 0 }),
    addEventListener: (_t: string, fn: () => void) => listeners.add(fn),
    removeEventListener: (_t: string, fn: () => void) => listeners.delete(fn),
    scrollTo: vi.fn(),
    fire: () => listeners.forEach((fn) => fn()),
  }
  return container
}

const installDom = (sections: Record<string, SectionRect>) => {
  const els = new Map<string, ReturnType<typeof makeSection>>()
  for (const [id, rect] of Object.entries(sections)) els.set(id, makeSection(rect))
  const spy = vi.spyOn(document, 'getElementById').mockImplementation((id) =>
    (els.get(id) as unknown as HTMLElement) ?? null
  )
  return {
    setRect: (id: string, rect: SectionRect) => els.set(id, makeSection(rect)),
    restore: () => spy.mockRestore(),
  }
}

// rAF is synchronous in tests so handleScroll resolves immediately.
const syncRaf = { requestAnimationFrame: (cb: () => void) => { cb(); return 0 }, cancelAnimationFrame: () => {} }

const items: AnchorItem[] = [
  { key: 'a', href: '#a', title: 'A' },
  { key: 'b', href: '#b', title: 'B' },
  { key: 'c', href: '#c', title: 'C' },
]

describe('createAnchor', () => {
  // 向下滚动：高亮判定线（scrollTop + offset + bounds）之上的最后一个区块。
  it('activates the last section above the activation line (scrolling down)', () => {
    createRoot((dispose) => {
      const dom = installDom({
        a: { top: 0, height: 100 },
        b: { top: 90, height: 100 },
        c: { top: 190, height: 100 },
      })
      const container = makeContainer()
      const onChange = vi.fn()
      createAnchor({
        items,
        onChange,
        getScrollContainer: () => container as unknown as HTMLElement,
        requestAnimationFrame: syncRaf.requestAnimationFrame,
        cancelAnimationFrame: syncRaf.cancelAnimationFrame,
      })
      flush()

      // Container scrolled 100px: line = 100 + 0 + 5; tops (viewport-relative) shift up.
      container.scrollTop = 100
      dom.setRect('a', { top: -100, height: 100 })
      dom.setRect('b', { top: -10, height: 100 })
      dom.setRect('c', { top: 90, height: 100 })
      container.fire()
      flush()
      expect(onChange).toHaveBeenLastCalledWith('b')

      dispose()
      dom.restore()
    })
  })

  // 回归：向上滚动恢复更早的区块（旧实现只在向下滚动时生效）。
  it('re-activates the earlier section when scrolling back up (regression: was one-way)', () => {
    createRoot((dispose) => {
      const dom = installDom({
        a: { top: 0, height: 100 },
        b: { top: 90, height: 100 },
        c: { top: 190, height: 100 },
      })
      const container = makeContainer()
      const onChange = vi.fn()
      createAnchor({
        items,
        onChange,
        getScrollContainer: () => container as unknown as HTMLElement,
        requestAnimationFrame: syncRaf.requestAnimationFrame,
        cancelAnimationFrame: syncRaf.cancelAnimationFrame,
      })
      flush()

      // Scroll down to c
      container.scrollTop = 300
      dom.setRect('a', { top: -300, height: 100 })
      dom.setRect('b', { top: -210, height: 100 })
      dom.setRect('c', { top: -110, height: 100 })
      container.fire()
      flush()
      expect(onChange).toHaveBeenLastCalledWith('c')

      // Scroll back up past b
      container.scrollTop = 100
      dom.setRect('a', { top: -100, height: 100 })
      dom.setRect('b', { top: -10, height: 100 })
      dom.setRect('c', { top: 90, height: 100 })
      container.fire()
      flush()
      expect(onChange).toHaveBeenLastCalledWith('b')

      // And all the way up
      container.scrollTop = 0
      dom.setRect('a', { top: 0, height: 100 })
      dom.setRect('b', { top: 90, height: 100 })
      dom.setRect('c', { top: 190, height: 100 })
      container.fire()
      flush()
      expect(onChange).toHaveBeenLastCalledWith('a')

      dispose()
      dom.restore()
    })
  })

  // 所有区块都在判定线下方时，清空高亮。
  it('clears the active key when scrolled above every section', () => {
    createRoot((dispose) => {
      const dom = installDom({
        a: { top: 600, height: 100 },
        b: { top: 700, height: 100 },
      })
      const container = makeContainer()
      const onChange = vi.fn()
      const anchor = createAnchor({
        items: [{ key: 'a', href: '#a', title: 'A' }, { key: 'b', href: '#b', title: 'B' }],
        onChange,
        getScrollContainer: () => container as unknown as HTMLElement,
        requestAnimationFrame: syncRaf.requestAnimationFrame,
        cancelAnimationFrame: syncRaf.cancelAnimationFrame,
      })
      flush()

      // Scrolled down then back above the first section: nothing is active.
      container.scrollTop = 0
      dom.setRect('a', { top: 600, height: 100 })
      dom.setRect('b', { top: 700, height: 100 })
      container.fire()
      flush()
      expect(anchor.activeKey()).toBe('')

      dispose()
      dom.restore()
    })
  })

  // 滚过底部后最后一个区块保持高亮。
  it('keeps the last section active when scrolled past the bottom', () => {
    createRoot((dispose) => {
      const dom = installDom({
        a: { top: -500, height: 100 },
        b: { top: -400, height: 100 },
      })
      const container = makeContainer(600)
      const onChange = vi.fn()
      const anchor = createAnchor({
        items: [{ key: 'a', href: '#a', title: 'A' }, { key: 'b', href: '#b', title: 'B' }],
        onChange,
        getScrollContainer: () => container as unknown as HTMLElement,
        requestAnimationFrame: syncRaf.requestAnimationFrame,
        cancelAnimationFrame: syncRaf.cancelAnimationFrame,
      })
      flush()

      container.fire()
      flush()
      expect(anchor.activeKey()).toBe('b')

      dispose()
      dom.restore()
    })
  })

  // targetOffset 让判定线下移。
  it('honors targetOffset by shifting the activation line', () => {
    createRoot((dispose) => {
      const dom = installDom({
        a: { top: 0, height: 100 },
        b: { top: 90, height: 100 },
      })
      const container = makeContainer(200)
      const onChange = vi.fn()
      const anchor = createAnchor({
        items: [{ key: 'a', href: '#a', title: 'A' }, { key: 'b', href: '#b', title: 'B' }],
        targetOffset: 100,
        onChange,
        getScrollContainer: () => container as unknown as HTMLElement,
        requestAnimationFrame: syncRaf.requestAnimationFrame,
        cancelAnimationFrame: syncRaf.cancelAnimationFrame,
      })
      flush()

      // line = 200 + 100 + 5 = 305 > 90, so b wins even though it is below a.
      container.fire()
      flush()
      expect(anchor.activeKey()).toBe('b')

      dispose()
      dom.restore()
    })
  })

  // getCurrentAnchor 的返回值覆盖 scroll-spy（零参数写法保持兼容）。
  it('getCurrentAnchor overrides scroll-spy (controlled mode)', () => {
    createRoot((dispose) => {
      const dom = installDom({ a: { top: 0, height: 100 } })
      const container = makeContainer()
      const anchor = createAnchor({
        items: [{ key: 'a', href: '#a', title: 'A' }],
        getCurrentAnchor: () => 'pinned',
        getScrollContainer: () => container as unknown as HTMLElement,
        requestAnimationFrame: syncRaf.requestAnimationFrame,
        cancelAnimationFrame: syncRaf.cancelAnimationFrame,
      })
      flush()

      container.fire()
      flush()
      expect(anchor.activeKey()).toBe('pinned')

      dispose()
      dom.restore()
    })
  })

  // scrollTo 平滑滚动容器到目标内容偏移，并立即高亮目标。
  it('scrollTo scrolls the container and activates the target', () => {
    createRoot((dispose) => {
      // b sits 400px into the content; container already scrolled 100px.
      const dom = installDom({ a: { top: -100, height: 100 }, b: { top: 300, height: 100 } })
      const container = makeContainer(100)
      const onChange = vi.fn()
      const anchor = createAnchor({
        items: [{ key: 'a', href: '#a', title: 'A' }, { key: 'b', href: '#b', title: 'B' }],
        onChange,
        getScrollContainer: () => container as unknown as HTMLElement,
        requestAnimationFrame: syncRaf.requestAnimationFrame,
        cancelAnimationFrame: syncRaf.cancelAnimationFrame,
      })
      flush()

      anchor.scrollTo('b')
      // 300 (viewport-relative) + 100 (current scroll) = 400 content offset.
      expect(container.scrollTo).toHaveBeenCalledWith({ top: 400, behavior: 'smooth' })
      expect(onChange).toHaveBeenCalledWith('b')
      // activeKey memo propagates through the async ownedWrite commit —
      // asserted below after flush (Solid 2 rc batched-write behavior).
      flush()
      expect(anchor.activeKey()).toBe('b')

      dispose()
      dom.restore()
    })
  })

  // 嵌套 children 被展平为 scroll-spy 目标，文档顺序靠后的子项胜出。
  it('flattens nested children into scroll-spy targets', async () => {
    let result = ''
    createRoot((dispose) => {
      // Viewport-relative tops: parent already scrolled past (-200), child at
      // -110. Line = 200 + 5 = 205; content offsets: parent 0, child 90 —
      // both qualify, child is later in flat document order so it wins.
      const dom = installDom({
        parent: { top: -200, height: 100 },
        child: { top: -110, height: 100 },
      })
      const container = makeContainer(200)
      const anchor = createAnchor({
        items: [{
          key: 'p', href: '#parent', title: 'Parent',
          children: [{ key: 'c', href: '#child', title: 'Child' }],
        }],
        getScrollContainer: () => container as unknown as HTMLElement,
        requestAnimationFrame: syncRaf.requestAnimationFrame,
        cancelAnimationFrame: syncRaf.cancelAnimationFrame,
      })
      flush()

      container.fire()
      // The ownedWrite commit needs one more microtask to land (Solid 2 rc
      // batching).
      flush()
      result = anchor.activeKey()

      dispose()
      dom.restore()
    })
    await Promise.resolve()
    flush()
    expect(result).toBe('c')
  })
})

describe('getScrollTop', () => {
  // window 读 scrollY，元素读 scrollTop。
  it('reads scrollY for window-like containers and scrollTop for elements', () => {
    expect(getScrollTop({ scrollY: 123 } as unknown as Window)).toBe(123)
    expect(getScrollTop({ scrollTop: 45 } as unknown as HTMLElement)).toBe(45)
  })
})

/** 可手动推进的计时器：记录回调，advance() 触发所有未取消的计时器。 */
const manualTimers = () => {
  let seq = 0
  const pending = new Map<number, { cb: () => void; ms: number }>()
  return {
    setTimeout: (cb: () => void, ms: number) => { pending.set(++seq, { cb, ms }); return seq },
    clearTimeout: (id: unknown) => { pending.delete(id as number) },
    pending,
    advance: () => { const list = [...pending.values()]; pending.clear(); list.forEach(t => t.cb()) },
  }
}

describe('createAnchor · antd 6 regressions', () => {
  // 回归：默认容器是 window（旧实现落到 documentElement，页面滚动事件永远不会在它上面触发，高亮不动）。
  it('[anchor.headless.window] listens on window by default', () => {
    const add = vi.spyOn(window, 'addEventListener')
    const remove = vi.spyOn(window, 'removeEventListener')
    createRoot((dispose) => {
      createAnchor({ items, ...syncRaf })
      flush()
      expect(add.mock.calls.some(([name]) => name === 'scroll')).toBe(true)
      dispose()
    })
    flush()
    expect(remove.mock.calls.some(([name]) => name === 'scroll')).toBe(true)
    add.mockRestore(); remove.mockRestore()
  })

  // 回归：点击滚动期间的抑制持续到滚动静止（每个 scroll 事件重新计时），经过的区块不会闪烁高亮；静止后不回算。
  it('[anchor.headless.settle] suppresses scroll-spy until the smooth scroll settles', () => {
    createRoot((dispose) => {
      const dom = installDom({ a: { top: 0, height: 100 }, b: { top: 100, height: 100 }, c: { top: 200, height: 100 } })
      const container = makeContainer()
      const timers = manualTimers()
      const onChange = vi.fn()
      const anchor = createAnchor({ items, onChange, getScrollContainer: () => container as unknown as HTMLElement, ...syncRaf, ...timers })
      flush()
      onChange.mockClear()

      anchor.scrollTo('c')
      flush()
      expect(anchor.activeKey()).toBe('c')
      expect([...timers.pending.values()].map(t => t.ms)).toEqual([ANCHOR_SCROLL_SETTLE])
      // 平滑滚动途中经过 b：scroll 事件只重新计时，不改变高亮。
      container.scrollTop = 100
      dom.setRect('a', { top: -100, height: 100 }); dom.setRect('b', { top: 0, height: 100 }); dom.setRect('c', { top: 100, height: 100 })
      container.fire(); container.fire()
      flush()
      expect(timers.pending.size).toBe(1)
      expect(anchor.activeKey()).toBe('c')
      expect(onChange.mock.calls).toEqual([['c']])
      // 静止后释放：不回算，c 仍高亮（容器滚不动时最后一个短区块也保持高亮）。
      timers.advance()
      flush()
      expect(anchor.activeKey()).toBe('c')
      // 释放后恢复 scroll-spy。
      container.fire()
      flush()
      expect(anchor.activeKey()).toBe('b')

      dispose()
      dom.restore()
    })
  })

  // getCurrentAnchor 收到滚动计算出的原始 key（antd getCurrentAnchor(activeLink)），返回值决定高亮。
  it('[anchor.headless.currentAnchor] receives the scroll-spy key', () => {
    createRoot((dispose) => {
      const dom = installDom({ a: { top: -100, height: 100 }, b: { top: 0, height: 100 } })
      const container = makeContainer(100)
      const seen: string[] = []
      const anchor = createAnchor({
        items: items.slice(0, 2),
        getCurrentAnchor: key => { seen.push(key); return key === 'b' ? 'a' : key },
        getScrollContainer: () => container as unknown as HTMLElement,
        ...syncRaf,
      })
      flush()
      container.fire()
      flush()
      expect(anchor.activeKey()).toBe('a')
      expect(seen).toContain('b')
      dispose()
      dom.restore()
    })
  })

  // 卸载时清掉未到期的静止计时器。
  it('[anchor.headless.cleanup] clears a pending settle timer on dispose', () => {
    const timers = manualTimers()
    const dom = installDom({ a: { top: 0, height: 100 } })
    createRoot((dispose) => {
      const container = makeContainer()
      const anchor = createAnchor({ items: items.slice(0, 1), getScrollContainer: () => container as unknown as HTMLElement, ...syncRaf, ...timers })
      flush()
      anchor.scrollTo('a')
      expect(timers.pending.size).toBe(1)
      dispose()
    })
    expect(timers.pending.size).toBe(0)
    dom.restore()
  })

  // anchorTargetId 取最后一个 # 之后的部分（兼容完整 URL 与带空格的 id），无 # 时为 undefined。
  it('[anchor.headless.targetId] parses the section id from href', () => {
    expect(anchorTargetId('#part-1')).toBe('part-1')
    expect(anchorTargetId('/docs/page#part 2')).toBe('part 2')
    expect(anchorTargetId('https://example.com/a#b')).toBe('b')
    expect(anchorTargetId('/no-hash')).toBeUndefined()
  })
})
