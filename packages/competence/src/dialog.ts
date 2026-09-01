import { createSignal, createMemo } from "solid-js";

/**
 * Headless logic shared by Modal and Drawer — the rc-dialog / rc-drawer state
 * core. Both components are the SAME machine under the skin:
 *
 *  - controlled or uncontrolled `open`
 *  - `animatedOpen` lags `open` by one leave-animation: while a close plays,
 *    the panel must stay mounted and visible; the DOM is only allowed to
 *    disappear when the animation finishes
 *  - lazy mount + destroyOnHidden teardown sequencing (reopen cancels the
 *    pending destroy and reuses the live DOM)
 *  - an async close GATE: a closing intent whose handler returns a promise
 *    keeps the dialog open (busy) until it settles — antd's confirmLoading
 *    pattern generalized
 *  - intent routing (mask click / Escape / close icon / ok / cancel) with a
 *    single `shouldClose` hook the consumer can veto or defer
 *
 * The UI layer owns: portal, mask/panel DOM, the actual animation classes,
 * focus trapping internals and scroll-lock side effects (all driven by the
 * signals exposed here).
 */

export type DialogIntent = 'mask' | 'keyboard' | 'close' | 'ok' | 'cancel'

export type DialogConfig = {
  open?: boolean
  defaultOpen?: boolean
  /** veto/defer a close intent; return false (or a promise resolving false) to stay open. */
  shouldClose?: (intent: DialogIntent) => boolean | Promise<boolean>
  onClose?: (intent: DialogIntent) => void
  afterClose?: () => void
  afterOpenChange?: (open: boolean) => void
  /**
   * Unmount the panel DOM after the leave animation instead of keeping it
   * alive. Default false (rc-dialog keep-alive; antd destroyOnHidden).
   */
  destroyOnHidden?: boolean
  /** Extra ms after the animation window before the destroy fires. Default 0. */
  destroyDelay?: number
}

export type DialogIns = {
  /** Effective open (controlled value wins over the internal signal). */
  open: () => boolean
  setOpen: (v: boolean) => void
  /**
   * True from the first open until the leave animation finishes — the panel
   * DOM must exist and stay interactive-blocked while this is true. Flips
   * false only after the leave window, which is when destroyOnHidden may
   * unmount it.
   */
  animatedOpen: () => boolean
  /** True while an async shouldClose/onClose promise is pending. */
  busy: () => boolean
  /** Route a closing intent through the gate (mask/Escape/×/ok/cancel). */
  requestClose: (intent: DialogIntent) => void
  /** UI calls this when the leave animation has finished. */
  notifyLeaveDone: () => void
  /** The last element focused outside the dialog — restore on close. */
  lastActiveElement: () => HTMLElement | undefined
  setLastActiveElement: (el: HTMLElement | undefined) => void
}

/** Leave-animation headroom before the DOM may be destroyed, ms. */
const LEAVE_ANIMATION_MS = 300

export const createDialog = (config: DialogConfig = {}): DialogIns => {
  const [_open, _setOpen] = createSignal(config.defaultOpen ?? false, { ownedWrite: true })
  // Seed from the effective open so a defaultOpen dialog starts animated.
  const [_animatedOpen, _setAnimatedOpen] = createSignal(
    (config.open ?? config.defaultOpen ?? false) === true,
    { ownedWrite: true },
  )
  const [_busy, _setBusy] = createSignal(false, { ownedWrite: true })
  const [_lastActive, _setLastActive] = createSignal<HTMLElement | undefined>(undefined, { ownedWrite: true })

  let _destroyTimer: ReturnType<typeof setTimeout> | undefined

  const open = createMemo(() => config.open !== undefined ? config.open : _open())

  const setOpen = (v: boolean) => {
    if (v === open()) return
    if (!v) {
      // Leave: keep animatedOpen true for the animation window; the renderer
      // calls notifyLeaveDone() when it finishes (or the timer below forces
      // it — belt and braces for renderers that forget).
      if (config.open === undefined) _setOpen(false)
      scheduleLeaveDone()
    } else {
      // Reopen cancels any pending destroy so quick toggles reuse the DOM.
      if (_destroyTimer) { clearTimeout(_destroyTimer); _destroyTimer = undefined }
      if (config.open === undefined) _setOpen(true)
      _setAnimatedOpen(true)
      config.afterOpenChange?.(true)
    }
  }

  const finishLeave = () => {
    if (!open() && _animatedOpen()) {
      _setAnimatedOpen(false)
      config.afterClose?.()
      config.afterOpenChange?.(false)
      if (config.destroyOnHidden) {
        // destroyOnHidden: drop the DOM a beat after the animation ended.
        // (The renderer gates its <Show> on animatedOpen, so the unmount
        // happens when the flag flips; the timer exists for reopen-race
        // safety and to expose the destroyDelay contract.)
        const delay = config.destroyDelay ?? 0
        if (delay <= 0) return
        _destroyTimer = setTimeout(() => { _destroyTimer = undefined }, delay)
      }
    }
  }

  const scheduleLeaveDone = () => {
    if (_destroyTimer) { clearTimeout(_destroyTimer); _destroyTimer = undefined }
    _destroyTimer = setTimeout(() => {
      _destroyTimer = undefined
      finishLeave()
    }, LEAVE_ANIMATION_MS)
  }

  const notifyLeaveDone = () => {
    if (_destroyTimer) { clearTimeout(_destroyTimer); _destroyTimer = undefined }
    finishLeave()
  }

  /** Intent gate: sync veto → async gate → close. */
  const requestClose = (intent: DialogIntent) => {
    if (!open() || _busy()) return
    const verdict = config.shouldClose?.(intent)
    if (verdict === false) return
    if (verdict && typeof (verdict as Promise<boolean>).then === 'function') {
      // Async gate: hold the dialog open (busy) until the promise settles.
      _setBusy(true)
      ;(verdict as Promise<boolean>).then(allowed => {
        _setBusy(false)
        if (allowed === false) return
        config.onClose?.(intent)
        setOpen(false)
      }).catch(() => {
        // A rejected gate reads as "allow" (matching the Popconfirm
        // convention: errors surface to the app, the dialog still closes).
        _setBusy(false)
        config.onClose?.(intent)
        setOpen(false)
      })
      return
    }
    config.onClose?.(intent)
    setOpen(false)
  }

  // Controlled-prop synchronization: in controlled mode setOpen() is bypassed,
  // so the memo below is the ONLY place that observes prop flips. It plays the
  // same role setOpen does for uncontrolled dialogs:
  //  - open prop flipping TRUE must raise _animatedOpen (and cancel a pending
  //    destroy so a quick toggle reuses the DOM)
  //  - open prop flipping FALSE must start the leave sequencing
  // Checked lazily on every animatedOpen() read — a subscribe-free watcher
  // keeps this layer free of effects (headless purity: no owner required).
  const controlledClose = createMemo(() => config.open === false)
  const controlledOpen = createMemo(() => config.open === true)
  let _prevControlledClose = false
  let _prevControlledOpen = false
  const syncControlled = () => {
    if (controlledOpen() && !_prevControlledOpen) {
      if (_destroyTimer) { clearTimeout(_destroyTimer); _destroyTimer = undefined }
      _setAnimatedOpen(true)
      config.afterOpenChange?.(true)
    }
    if (controlledClose() && !_prevControlledClose) {
      if (_animatedOpen()) scheduleLeaveDone()
    }
    _prevControlledOpen = controlledOpen()
    _prevControlledClose = controlledClose()
  }
  const animatedOpen = createMemo(() => {
    syncControlled()
    // While open (or until the leave finishes) the panel stays mounted.
    return open() || _animatedOpen() || _busy()
  })

  const requestOpen = () => setOpen(true)

  return {
    open,
    setOpen,
    animatedOpen,
    busy: () => _busy(),
    requestClose,
    notifyLeaveDone,
    lastActiveElement: () => _lastActive(),
    setLastActiveElement: (el) => { _setLastActive(el) },
    // re-exported for consumers that open programmatically
    ...({ requestOpen } as object),
  } as DialogIns
}

export const dialogSplits: (keyof DialogConfig)[] = [
  'open', 'defaultOpen', 'shouldClose', 'onClose', 'afterClose',
  'afterOpenChange', 'destroyOnHidden', 'destroyDelay',
]
