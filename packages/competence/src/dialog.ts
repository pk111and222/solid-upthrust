import { createSignal, createMemo, createEffect, untrack } from "solid-js";

/**
 * Headless logic shared by Modal and Drawer — the rc-dialog / rc-drawer state
 * core. Both components are the SAME machine under the skin:
 *
 *  - controlled or uncontrolled `open`
 *  - `animatedOpen` lags `open` by one leave-animation: while a close plays,
 *    the panel must stay mounted and visible; it flips false only when the
 *    animation finishes
 *  - `mounted`: rc-dialog keep-alive — the DOM is created on the first open
 *    (or immediately with `forceRender`) and survives later closes (hidden),
 *    unless `destroyOnHidden` drops it after the leave animation
 *  - an async close GATE: a closing intent whose handler returns a promise
 *    keeps the dialog open (busy) until it settles; a rejection or `false`
 *    keeps it open (antd Modal.confirm: reject = stay for retry)
 *  - intent routing (mask click / Escape / close icon / ok / cancel) with a
 *    single `shouldClose` hook the consumer can veto or defer
 *
 * DOM side effects (stack, focus trap/restore, scroll lock, enter phase) live
 * in the UI package's shared `createDialogLayer` (components/lib/_dialogLayer),
 * which consumes this machine for both Modal and Drawer.
 */

export type DialogIntent = 'mask' | 'keyboard' | 'close' | 'ok' | 'cancel'

export type DialogConfig = {
  open?: boolean
  defaultOpen?: boolean
  /** veto/defer a close intent; return false (or a promise resolving false / rejecting) to stay open. */
  shouldClose?: (intent: DialogIntent) => boolean | Promise<boolean>
  onClose?: (intent: DialogIntent) => void
  afterClose?: () => void
  afterOpenChange?: (open: boolean) => void
  /** Unmount the panel DOM after the leave animation instead of keeping it alive. Default false. */
  destroyOnHidden?: boolean
  /** Create the DOM before the first open. Default false. */
  forceRender?: boolean
}

export type DialogIns = {
  /** Effective open (controlled value wins over the internal signal). */
  open: () => boolean
  setOpen: (v: boolean) => void
  /** True from open until the leave animation finishes. */
  animatedOpen: () => boolean
  /** Whether the dialog DOM should exist (keep-alive / forceRender / destroyOnHidden). */
  mounted: () => boolean
  /** True while an async shouldClose promise is pending. */
  busy: () => boolean
  /** Route a closing intent through the gate (mask/Escape/×/ok/cancel). */
  requestClose: (intent: DialogIntent) => void
  /** UI calls this when the leave animation has finished. */
  notifyLeaveDone: () => void
  /** The last element focused outside the dialog — restore on close. */
  lastActiveElement: () => HTMLElement | undefined
  setLastActiveElement: (el: HTMLElement | undefined) => void
}

/** Leave-animation headroom before the machine forces the leave to finish, ms. */
export const DIALOG_LEAVE_MS = 300

const isThenable = (value: unknown): value is PromiseLike<unknown> =>
  !!value && typeof (value as PromiseLike<unknown>).then === 'function'

export const createDialog = (config: DialogConfig = {}): DialogIns => {
  const initial = (config.open ?? config.defaultOpen ?? false) === true
  const [_open, _setOpen] = createSignal(config.defaultOpen ?? false, { ownedWrite: true })
  const [_animatedOpen, _setAnimatedOpen] = createSignal(initial, { ownedWrite: true })
  const [_everOpened, _setEverOpened] = createSignal(initial, { ownedWrite: true })
  const [_busy, _setBusy] = createSignal(false, { ownedWrite: true })
  const [_lastActive, _setLastActive] = createSignal<HTMLElement | undefined>(undefined, { ownedWrite: true })
  // Synchronous mirrors: signal writes commit in batches, so imperative calls
  // in the same tick (setOpen(false) then setOpen(true)) must read these.
  let openNow = initial
  let animatedNow = initial
  let busyNow = false
  let leaveTimer: ReturnType<typeof setTimeout> | undefined

  const open = createMemo(() => config.open !== undefined ? config.open === true : _open())

  const clearLeave = () => { if (leaveTimer) { clearTimeout(leaveTimer); leaveTimer = undefined } }

  const rise = () => {
    clearLeave()
    openNow = true
    animatedNow = true
    _setAnimatedOpen(true)
    _setEverOpened(true)
    config.afterOpenChange?.(true)
  }

  const finishLeave = () => {
    clearLeave()
    if (openNow || !animatedNow) return
    animatedNow = false
    _setAnimatedOpen(false)
    config.afterClose?.()
    config.afterOpenChange?.(false)
  }

  // The renderer reports completion via notifyLeaveDone; the timer is the
  // belt-and-braces fallback for renderers without a transition.
  const fall = () => {
    openNow = false
    clearLeave()
    if (animatedNow) leaveTimer = setTimeout(finishLeave, DIALOG_LEAVE_MS)
  }

  const setOpen = (v: boolean) => {
    if (config.open !== undefined) return
    if (v === openNow) return
    _setOpen(v)
    if (v) rise(); else fall()
  }

  // Controlled prop flips: observed by an effect (the renderer's owner), so
  // no signal is written from inside a memo.
  createEffect(
    () => config.open,
    (value, prev) => {
      if (value === undefined) return
      if (value === true && openNow !== true) rise()
      else if (value === false && (openNow || prev === true)) fall()
    },
  )

  const requestClose = (intent: DialogIntent) => {
    // Controlled: the prop is the truth (the watcher effect may not have run
    // yet in this tick); uncontrolled: the synchronous mirror.
    const isOpen = config.open !== undefined ? untrack(() => config.open) === true : openNow
    if (!isOpen || busyNow) return
    const verdict = config.shouldClose?.(intent)
    if (verdict === false) return
    const close = () => { config.onClose?.(intent); setOpen(false) }
    if (isThenable(verdict)) {
      busyNow = true
      _setBusy(true)
      const settle = (allowed: boolean) => {
        busyNow = false
        _setBusy(false)
        if (allowed) close()
      }
      Promise.resolve(verdict).then(value => settle(value !== false), () => settle(false))
      return
    }
    close()
  }

  const animatedOpen = createMemo(() => open() || _animatedOpen() || _busy())
  const mounted = createMemo(() => {
    if (animatedOpen()) return true
    if (config.destroyOnHidden) return false
    return _everOpened() || !!config.forceRender
  })

  return {
    open,
    setOpen,
    animatedOpen,
    mounted,
    busy: () => _busy(),
    requestClose,
    notifyLeaveDone: finishLeave,
    lastActiveElement: () => _lastActive(),
    setLastActiveElement: (el) => { _setLastActive(el) },
  }
}

export const dialogSplits: (keyof DialogConfig)[] = [
  'open', 'defaultOpen', 'shouldClose', 'onClose', 'afterClose',
  'afterOpenChange', 'destroyOnHidden', 'forceRender',
]
