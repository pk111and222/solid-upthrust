import { createSignal, flush } from 'solid-js'
import { expect, it, vi } from 'vitest'
import Rate from '../../../components/lib/Rate'
import { mount } from '../../utils/mount'

// defaultValue 的后续变化不应重建状态机覆盖用户评分。
it('[rate.default.initial-only] preserves user input', () => {
  const [initial, setInitial] = createSignal(2, { ownedWrite: true })
  const { host, dispose } = mount(() => <Rate defaultValue={initial()} />)
  try {
    host.querySelectorAll<HTMLElement>('li')[3].click(); flush()
    setInitial(1); flush()
    expect((host.querySelectorAll('li')[3].children[1] as HTMLElement).style.clipPath).toBe('inset(0 0% 0 0)')
  } finally { dispose() }
})

// 指针悬停期间按 0 应同时清空提交值与当前显示。
it('[rate.keyboard.reset-hover] clears preview', () => {
  const change = vi.fn()
  const { host, dispose } = mount(() => <Rate defaultValue={2} onChange={change} />)
  try {
    const star = host.querySelectorAll('li')[3]
    star.dispatchEvent(new MouseEvent('mousemove', { bubbles: true })); flush()
    host.querySelector('ul')!.dispatchEvent(new KeyboardEvent('keydown', { key: '0', bubbles: true })); flush()
    expect(change).toHaveBeenCalledWith(0, undefined)
    expect((star.children[1] as HTMLElement).style.clipPath).toBe('inset(0 100% 0 0)')
  } finally { dispose() }
})

// 半星与整星均通过一个 slider 精确公开当前值，星形只负责绘制。
it('[rate.a11y.value] exposes exact fractional rating', () => {
  const { host, dispose } = mount(() => <Rate value={2.5} allowHalf aria-label="满意度" />)
  try {
    const slider = host.querySelector('[role="slider"]')!
    expect(slider).not.toBeNull()
    expect(slider.getAttribute('aria-valuenow')).toBe('2.5')
    expect(slider.getAttribute('aria-valuemin')).toBe('0')
    expect(slider.getAttribute('aria-valuemax')).toBe('5')
    expect(slider.getAttribute('aria-valuetext')).toBe('2.5 / 5 星')
    expect(host.querySelectorAll('[role="radio"]')).toHaveLength(0)
  } finally { dispose() }
})

// count/allowHalf/disabled 更新应保留状态机并正确限制后续指针与键盘操作。
it('[rate.dynamic.modes] updates count, half step and disabled gates', () => {
  const [count, setCount] = createSignal(5, { ownedWrite: true })
  const [half, setHalf] = createSignal(false, { ownedWrite: true })
  const [disabled, setDisabled] = createSignal(false, { ownedWrite: true })
  const { host, dispose } = mount(() => <Rate count={count()} allowHalf={half()} disabled={disabled()} defaultValue={4} />)
  try {
    const slider = host.querySelector('ul')!
    setCount(3); flush()
    expect(host.querySelectorAll('li')).toHaveLength(3)
    expect(slider.getAttribute('aria-valuenow')).toBe('3')
    setHalf(true); flush()
    slider.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true })); flush()
    slider.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })); flush()
    expect(slider.getAttribute('aria-valuenow')).toBe('0.5')
    host.querySelectorAll('li')[2].dispatchEvent(new MouseEvent('mousemove', { bubbles: true })); flush()
    setDisabled(true); flush()
    expect(slider.getAttribute('tabindex')).toBe('-1')
    host.querySelectorAll<HTMLElement>('li')[2].click()
    slider.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true })); flush()
    expect(slider.getAttribute('aria-valuenow')).toBe('0.5')
    expect((host.querySelectorAll('li')[2].children[1] as HTMLElement).style.clipPath).toBe('inset(0 100% 0 0)')
    setDisabled(false); flush()
    slider.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true })); flush()
    expect(slider.getAttribute('aria-valuenow')).toBe('3')
    slider.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })); flush()
    expect(slider.getAttribute('aria-valuenow')).toBe('2.5')
    setHalf(false); flush()
    slider.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })); flush()
    expect(slider.getAttribute('aria-valuenow')).toBe('2')
  } finally { dispose() }
})
