import { createSignal, flush } from 'solid-js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Modal from '../../../components/lib/Modal'
import Watermark from '../../../components/lib/Watermark'
import { mount } from '../../utils/mount'

// happy-dom 无 2D 上下文：桩出绘制所需的最小 API，toDataURL 返回可识别的串。
const stubCanvas = () => {
  const ctx = new Proxy({ measureText: (t: string) => ({ width: t.length * 8, fontBoundingBoxAscent: 14, fontBoundingBoxDescent: 4 }) }, {
    get: (target, key) => (key in target ? target[key as keyof typeof target] : () => {}),
    set: () => true,
  })
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => ctx as never)
  vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockImplementation(() => 'data:image/png;base64,MARK')
}

let view: ReturnType<typeof mount>
beforeEach(stubCanvas)
afterEach(() => { view?.dispose(); vi.restoreAllMocks() })
const root = () => view.host.firstElementChild as HTMLElement
const mark = (holder: Element = root()) => [...holder.children].find(el => (el as HTMLElement).style.backgroundImage) as HTMLElement | undefined
const tick = async () => { await new Promise(r => setTimeout(r, 30)); flush() }

describe('Watermark DOM contracts', () => {
  // 默认：水印节点为容器最后一个子元素，z-index 999、absolute 铺满、不拦截事件、背景为 canvas 图。
  it('[watermark.default] appends mark with antd defaults', () => {
    view = mount(() => <Watermark content="Ant Design"><p>child</p></Watermark>)
    const m = mark()!
    expect(root().lastElementChild).toBe(m)
    expect([m.style.zIndex, m.style.position, m.style.pointerEvents, m.style.backgroundRepeat]).toEqual(['999', 'absolute', 'none', 'repeat'])
    expect(m.style.backgroundImage).toContain('MARK')
    expect([root().style.position, root().style.overflow]).toEqual(['relative', 'hidden'])
  })

  // 参数联动：zIndex / gap 变化后重绘到同一节点。
  it('[watermark.reactive] zIndex and gap updates', () => {
    const [z, setZ] = createSignal(5)
    view = mount(() => <Watermark content="x" zIndex={z()} gap={[40, 40]} offset={[50, 20]} />)
    expect(mark()!.style.zIndex).toBe('5')
    expect(mark()!.style.left).toBe('30px')
    setZ(7); flush()
    expect(mark()!.style.zIndex).toBe('7')
    expect(root().querySelectorAll(':scope > div')).toHaveLength(1)
  })

  // 防篡改：删除水印节点 → 自动恢复并触发 onRemove；改水印样式 → 恢复；改容器 overflow → 恢复。
  it('[watermark.tamper] restores removed or restyled mark', async () => {
    const onRemove = vi.fn()
    view = mount(() => <Watermark content="x" onRemove={onRemove} />)
    mark()!.remove(); await tick()
    expect(mark()).toBeDefined()
    expect(onRemove).toHaveBeenCalledTimes(1)
    mark()!.setAttribute('style', 'display: none'); await tick()
    expect(mark()!.style.backgroundImage).toContain('MARK')
    root().style.overflow = 'visible'; await tick()
    expect(root().style.overflow).toBe('hidden')
  })

  // 弹层传导：inherit 默认把 Modal 面板登记为水印目标；inherit={false} 不传导；卸载时清除。
  it('[watermark.inherit] modal panel receives mark unless inherit is false', async () => {
    const [open, setOpen] = createSignal(true)
    view = mount(() => <>
      <Watermark content="x"><Modal open={open()} title="in">body</Modal></Watermark>
      <Watermark content="x" inherit={false}><Modal open title="out">body</Modal></Watermark>
    </>)
    const dialogs = [...document.querySelectorAll<HTMLElement>('[role="dialog"]')]
    const inside = dialogs.find(el => el.textContent?.includes('in') && !el.textContent.includes('out'))!
    const outside = dialogs.find(el => el.textContent?.includes('out'))!
    expect(mark(inside)?.style.zIndex).toBe('999')
    expect(mark(outside)).toBeUndefined()
    // 面板在离场动画（≤300ms 兜底）结束后才注销。
    setOpen(false); flush()
    await new Promise(r => setTimeout(r, 400)); flush()
    expect(mark(inside)).toBeUndefined()
  })
})
