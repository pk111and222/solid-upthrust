import { render } from '@solidjs/web'
import { createSignal, flush } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Affix from '../../../components/lib/Affix/index'
import type { AffixIns } from 'upthrust-competence'
let dispose: (() => void) | undefined
const mount = (view: Parameters<typeof render>[0]) => { const host = document.createElement('div'); document.body.append(host); dispose = render(view, host); flush(); return host }
const rect = (top: number, height = 50, width = 200) => ({ top, left: 40, width, height, right: 40 + width, bottom: top + height, x: 40, y: top, toJSON() {} })
afterEach(() => { dispose?.(); document.body.innerHTML = ''; vi.restoreAllMocks(); flush() })
describe('Affix material', () => {
  // 窗口目标：进入 / 离开 fixed 时占位保留高度，子节点不重建，onChange 只在切换时触发。
  it('preserves layout and children while entering and leaving window affix', () => {
    let instance!: AffixIns
    const onChange = vi.fn()
    const host = mount(() => <Affix ref={value => { instance = value }} offsetTop={12} onChange={onChange}><input value="preserved" /></Affix>)
    const placeholder = host.firstElementChild as HTMLElement, content = placeholder.firstElementChild as HTMLElement, input = content.firstElementChild
    let top = 50, height = 50
    vi.spyOn(placeholder, 'getBoundingClientRect').mockImplementation(() => rect(top))
    vi.spyOn(content, 'getBoundingClientRect').mockImplementation(() => rect(top, height))
    instance.updatePosition(); flush(); expect(instance.affixed()).toBe(false)
    top = -20; instance.updatePosition(); flush()
    expect(content.style.position).toBe('fixed'); expect(content.style.top).toBe('12px'); expect(placeholder.style.height).toBe('50px')
    height = 80; instance.updatePosition(); flush(); expect(placeholder.style.height).toBe('80px')
    expect(content.firstElementChild).toBe(input); expect(onChange).toHaveBeenCalledTimes(1)
    top = 100; instance.updatePosition(); flush(); expect(content.style.position).toBe(''); expect(placeholder.style.height).toBe('')
    expect(onChange.mock.calls).toEqual([[true], [false]])
  })
  // 元素目标：在占位块内 absolute 相对定位；响应式 disabled 立即恢复文档流。
  it('uses relative positioning inside a custom target and responds to disabling', () => {
    let target!: HTMLDivElement, instance!: AffixIns
    const [disabled, setDisabled] = createSignal(false, { ownedWrite: true })
    const host = mount(() => <div ref={target}><Affix target={() => target} offsetBottom={10} disabled={disabled()} ref={value => { instance = value }}><span>Save</span></Affix></div>)
    const placeholder = host.firstElementChild!.firstElementChild as HTMLElement, content = placeholder.firstElementChild as HTMLElement
    vi.spyOn(target, 'getBoundingClientRect').mockReturnValue(rect(20, 200))
    Object.defineProperty(target, 'clientHeight', { configurable: true, value: 200 })
    vi.spyOn(placeholder, 'getBoundingClientRect').mockReturnValue(rect(500))
    vi.spyOn(content, 'getBoundingClientRect').mockReturnValue(rect(500))
    instance.updatePosition(); flush()
    expect(content.style.position).toBe('absolute'); expect(content.style.top).toBe('-340px')
    setDisabled(true); flush(); expect(instance.affixed()).toBe(false)
  })
  // 响应式 target 变空时解除固定并移除监听；卸载后 updatePosition 不再固定。
  it('releases affix when a reactive target disappears and cleans up listeners', () => {
    const remove = vi.spyOn(window, 'removeEventListener')
    let instance!: AffixIns
    const [target, setTarget] = createSignal<Window | undefined>(window, { ownedWrite: true })
    const host = mount(() => <Affix target={target} ref={value => { instance = value }}><span>Anchor</span></Affix>)
    const placeholder = host.firstElementChild as HTMLElement, content = placeholder.firstElementChild as HTMLElement
    vi.spyOn(placeholder, 'getBoundingClientRect').mockReturnValue(rect(-30))
    vi.spyOn(content, 'getBoundingClientRect').mockReturnValue(rect(-30))
    instance.updatePosition(); flush(); expect(instance.affixed()).toBe(true)
    setTarget(undefined); flush(); expect(instance.affixed()).toBe(false)
    expect(remove.mock.calls.some(([name]) => name === 'scroll')).toBe(true)
    dispose?.(); dispose = undefined
    instance.updatePosition(); expect(instance.affixed()).toBe(false)
  })
  // scroll / resize 用 rAF 合并；卸载时取消挂起的帧并不再响应事件。
  it('coalesces scroll/resize work and cancels a pending frame on disposal', () => {
    const request = vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(123)
    const cancel = vi.spyOn(window, 'cancelAnimationFrame')
    mount(() => <Affix><span>Anchor</span></Affix>)
    window.dispatchEvent(new Event('resize')); window.dispatchEvent(new Event('scroll')); window.dispatchEvent(new Event('resize'))
    expect(request).toHaveBeenCalledTimes(1)
    dispose?.(); dispose = undefined
    expect(cancel).toHaveBeenCalledWith(123)
    window.dispatchEvent(new Event('resize')); expect(request).toHaveBeenCalledTimes(1)
  })

})
