import { createRoot, createSignal, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { createDialog } from '../../../../competence/src/dialog'

const tick = (ms = 350) => new Promise(r => setTimeout(r, ms))

describe('createDialog', () => {
  // 非受控默认关闭，setOpen 打开
  it('starts closed (uncontrolled) and opens via setOpen', () => {
    createRoot((dispose) => {
      const d = createDialog()
      expect(d.open()).toBe(false)
      expect(d.animatedOpen()).toBe(false)
      d.setOpen(true)
      flush()
      expect(d.open()).toBe(true)
      expect(d.animatedOpen()).toBe(true)
      dispose()
    })
  })

  // defaultOpen 初始即打开且处于动画态
  it('defaultOpen starts open and animated', () => {
    createRoot((dispose) => {
      const d = createDialog({ defaultOpen: true })
      expect(d.open()).toBe(true)
      expect(d.animatedOpen()).toBe(true)
      dispose()
    })
  })

  // 受控 open 优先于内部信号
  it('controlled open wins over the internal signal', () => {
    createRoot((dispose) => {
      const d = createDialog({ open: true })
      d.setOpen(false) // ignored in controlled mode
      flush()
      expect(d.open()).toBe(true)
      dispose()
    })
  })

  // 离场动画期间 animatedOpen 保持 true，notifyLeaveDone 后翻转
  it('animatedOpen stays true during the leave window, then flips (notifyLeaveDone)', async () => {
    await createRoot(async (dispose) => {
      const afterClose = vi.fn()
      const d = createDialog({ afterClose })
      d.setOpen(true)
      flush()
      d.setOpen(false)
      flush()
      expect(d.open()).toBe(false)
      expect(d.animatedOpen()).toBe(true) // leave animation playing
      d.notifyLeaveDone()
      flush()
      expect(d.animatedOpen()).toBe(false)
      expect(afterClose).toHaveBeenCalledTimes(1)
      dispose()
    })
  })

  // 未上报离场完成时由兜底定时器翻转
  it('animatedOpen self-flips after the leave timeout even without notifyLeaveDone', async () => {
    await createRoot(async (dispose) => {
      const d = createDialog()
      d.setOpen(true)
      flush()
      d.setOpen(false)
      flush()
      expect(d.animatedOpen()).toBe(true)
      await tick()
      expect(d.animatedOpen()).toBe(false)
      dispose()
    })
  })

  // 离场窗口内重开取消待完成的离场（DOM 复用）
  it('reopening cancels the pending leave completion (quick toggle keeps DOM)', async () => {
    await createRoot(async (dispose) => {
      const afterClose = vi.fn()
      const d = createDialog({ afterClose })
      d.setOpen(true)
      flush()
      d.setOpen(false)
      d.setOpen(true) // reopen before the leave window ends
      flush()
      await tick()
      expect(d.open()).toBe(true)
      expect(d.animatedOpen()).toBe(true)
      expect(afterClose).not.toHaveBeenCalled()
      dispose()
    })
  })

  // requestClose 经 onClose 路由意图并关闭
  it('requestClose routes intents through onClose and closes', () => {
    createRoot((dispose) => {
      const onClose = vi.fn()
      const d = createDialog({ onClose })
      d.setOpen(true)
      flush()
      d.requestClose('mask')
      flush()
      expect(onClose).toHaveBeenCalledWith('mask')
      expect(d.open()).toBe(false)
      dispose()
    })
  })

  // shouldClose 返回 false 否决关闭
  it('shouldClose=false vetoes the close', () => {
    createRoot((dispose) => {
      const d = createDialog({ shouldClose: () => false })
      d.setOpen(true)
      flush()
      d.requestClose('keyboard')
      flush()
      expect(d.open()).toBe(true)
      dispose()
    })
  })

  // 异步关闭门挂起期间 busy，resolve 后关闭
  it('async shouldClose holds busy until resolve, then closes', async () => {
    await createRoot(async (dispose) => {
      const onClose = vi.fn()
      let resolveGate: (v: boolean) => void = () => {}
      const d = createDialog({
        shouldClose: () => new Promise<boolean>(r => { resolveGate = r }),
        onClose,
      })
      d.setOpen(true)
      flush()
      d.requestClose('ok')
      flush()
      expect(d.busy()).toBe(true)
      expect(d.open()).toBe(true) // held open while the gate is pending
      resolveGate(true)
      await tick(20)
      expect(d.busy()).toBe(false)
      expect(d.open()).toBe(false)
      expect(onClose).toHaveBeenCalledWith('ok')
      dispose()
    })
  })

  // 异步关闭门 resolve(false) 保持打开
  it('async shouldClose resolving false keeps the dialog open', async () => {
    await createRoot(async (dispose) => {
      let resolveGate: (v: boolean) => void = () => {}
      const d = createDialog({ shouldClose: () => new Promise<boolean>(r => { resolveGate = r }) })
      d.setOpen(true)
      flush()
      d.requestClose('mask')
      resolveGate(false)
      await tick(20)
      expect(d.open()).toBe(true)
      expect(d.busy()).toBe(false)
      dispose()
    })
  })

  // busy 期间重复 requestClose 被忽略（防双击）
  it('requestClose is a no-op while busy (double-click guard)', async () => {
    await createRoot(async (dispose) => {
      const onClose = vi.fn()
      let resolveGate: (v: boolean) => void = () => {}
      const d = createDialog({
        shouldClose: () => new Promise<boolean>(r => { resolveGate = r }),
        onClose,
      })
      d.setOpen(true)
      flush()
      d.requestClose('ok')
      d.requestClose('ok') // second click while busy
      flush()
      resolveGate(true)
      await tick(20)
      expect(onClose).toHaveBeenCalledTimes(1)
      dispose()
    })
  })

  // 受控 open 由 true 翻到 false：由 effect 观察 prop（不在 memo 内写信号），走离场时序
  it('controlled open=false (prop flip) runs the leave sequencing', async () => {
    const afterClose = vi.fn()
    let d!: ReturnType<typeof createDialog>
    let setControlled!: (v: boolean) => void
    const dispose = createRoot((dispose) => {
      const [controlled, set] = createSignal(true)
      setControlled = set
      d = createDialog({ get open() { return controlled() }, afterClose })
      return dispose
    })
    flush()
    expect(d.open()).toBe(true)
    expect(d.animatedOpen()).toBe(true)
    setControlled(false)
    flush()
    expect(d.open()).toBe(false)
    expect(d.animatedOpen()).toBe(true) // still animating out
    await tick()
    expect(d.animatedOpen()).toBe(false)
    expect(afterClose).toHaveBeenCalledTimes(1)
    dispose()
  })

  // 受控模式下 requestClose 只通知 onClose，是否关闭由使用者改 prop 决定
  it('controlled requestClose only reports the intent', () => {
    const onClose = vi.fn()
    let d!: ReturnType<typeof createDialog>
    const dispose = createRoot((dispose) => {
      d = createDialog({ open: true, onClose })
      return dispose
    })
    flush()
    d.requestClose('mask')
    flush()
    expect(onClose).toHaveBeenCalledWith('mask')
    expect(d.open()).toBe(true)
    dispose()
  })

  // 异步关闭门 reject：保持打开以便重试（antd Modal.confirm 语义），busy 复位
  it('async shouldClose rejecting keeps the dialog open', async () => {
    const onClose = vi.fn()
    let d!: ReturnType<typeof createDialog>
    const dispose = createRoot((dispose) => {
      d = createDialog({ shouldClose: () => Promise.reject(new Error('x')), onClose })
      return dispose
    })
    d.setOpen(true)
    flush()
    d.requestClose('ok')
    flush()
    expect(d.busy()).toBe(true)
    await tick(20)
    flush()
    expect(d.busy()).toBe(false)
    expect(d.open()).toBe(true)
    expect(onClose).not.toHaveBeenCalled()
    dispose()
  })

  // mounted：首开前不建 DOM；关闭后默认保活；destroyOnHidden 离场后销毁；forceRender 预渲染
  it('mounted follows keep-alive / destroyOnHidden / forceRender', async () => {
    const make = (config: Parameters<typeof createDialog>[0]) => {
      let d!: ReturnType<typeof createDialog>
      const dispose = createRoot((dispose) => { d = createDialog(config); return dispose })
      return { d, dispose }
    }
    const keep = make({})
    const destroy = make({ destroyOnHidden: true })
    const force = make({ forceRender: true })
    flush()
    expect(keep.d.mounted()).toBe(false)
    expect(force.d.mounted()).toBe(true)
    for (const { d } of [keep, destroy]) d.setOpen(true)
    flush()
    expect(keep.d.mounted()).toBe(true)
    expect(destroy.d.mounted()).toBe(true)
    for (const { d } of [keep, destroy]) d.setOpen(false)
    flush()
    expect(destroy.d.mounted()).toBe(true) // leave animation still playing
    await tick()
    flush()
    expect(keep.d.mounted()).toBe(true)
    expect(destroy.d.mounted()).toBe(false)
    for (const { dispose } of [keep, destroy, force]) dispose()
  })

  // afterOpenChange 在打开与离场完成时各触发一次
  it('afterOpenChange fires on open and on leave completion', async () => {
    await createRoot(async (dispose) => {
      const changes: boolean[] = []
      const d = createDialog({ afterOpenChange: v => changes.push(v) })
      d.setOpen(true)
      flush()
      d.setOpen(false)
      await tick()
      expect(changes).toEqual([true, false])
      dispose()
    })
  })

  // lastActiveElement 读写往返（焦点恢复用）
  it('lastActiveElement round-trips for focus restore', () => {
    createRoot((dispose) => {
      const d = createDialog()
      const el = { focus: () => {} } as unknown as HTMLElement
      d.setLastActiveElement(el)
      flush()
      expect(d.lastActiveElement()).toBe(el)
      d.setLastActiveElement(undefined)
      flush()
      expect(d.lastActiveElement()).toBeUndefined()
      dispose()
    })
  })
})
