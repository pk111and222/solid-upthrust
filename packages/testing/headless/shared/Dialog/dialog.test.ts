import { createRoot, flush } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { createDialog } from '../../../../competence/src/dialog'

const tick = (ms = 350) => new Promise(r => setTimeout(r, ms))

describe('createDialog', () => {
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

  it('defaultOpen starts open and animated', () => {
    createRoot((dispose) => {
      const d = createDialog({ defaultOpen: true })
      expect(d.open()).toBe(true)
      expect(d.animatedOpen()).toBe(true)
      dispose()
    })
  })

  it('controlled open wins over the internal signal', () => {
    createRoot((dispose) => {
      const d = createDialog({ open: true })
      d.setOpen(false) // ignored in controlled mode
      flush()
      expect(d.open()).toBe(true)
      dispose()
    })
  })

  it('animatedOpen stays true during the leave window, then flips (notifyLeaveDone)', async () => {
    createRoot(async (dispose) => {
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

  it('animatedOpen self-flips after the leave timeout even without notifyLeaveDone', async () => {
    createRoot(async (dispose) => {
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

  it('reopening cancels the pending leave completion (quick toggle keeps DOM)', async () => {
    createRoot(async (dispose) => {
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

  it('async shouldClose holds busy until resolve, then closes', async () => {
    createRoot(async (dispose) => {
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

  it('async shouldClose resolving false keeps the dialog open', async () => {
    createRoot(async (dispose) => {
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

  it('requestClose is a no-op while busy (double-click guard)', async () => {
    createRoot(async (dispose) => {
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

  it('controlled open=false (prop flip) runs the leave sequencing', async () => {
    createRoot(async (dispose) => {
      let controlled: boolean | undefined = true
      const afterClose = vi.fn()
      const d = createDialog({
        get open() { return controlled },
        afterClose,
      })
      expect(d.open()).toBe(true)
      expect(d.animatedOpen()).toBe(true)
      controlled = false
      flush()
      // reading animatedOpen syncs the controlled watcher
      expect(d.animatedOpen()).toBe(true) // still animating out
      await tick()
      expect(d.animatedOpen()).toBe(false)
      expect(afterClose).toHaveBeenCalledTimes(1)
      dispose()
    })
  })

  it('afterOpenChange fires on open and on leave completion', async () => {
    createRoot(async (dispose) => {
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
