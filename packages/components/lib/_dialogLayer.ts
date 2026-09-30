import { createEffect, createMemo, createSignal, onCleanup, untrack } from 'solid-js'
import type { DialogIns } from 'upthrust-competence'
import { registerDialog, unregisterDialog, isPushed, isTopDialog } from './_dialogStack'

/**
 * DOM side effects shared by Modal and Drawer (the headless `createDialog`
 * owns state; this owns the document). One implementation for both:
 *
 *  - enter phase: the tree mounts carrying its final classes, so `visible`
 *    stays false for one macrotask after every animatedOpen rising edge —
 *    the class flip then lands on a mounted element and the transition runs
 *  - stack membership while open (Escape routing + drawer push)
 *  - focus: save the outside element on open, move focus into the panel,
 *    trap Tab / stray focus while top-most, restore on close
 *    (`focusable.trap` / `focusable.focusTriggerAfterClose`)
 *  - scroll lock with a page-wide counter, scrollbar-width compensation and
 *    restoration of the body's previous inline styles
 */
export type DialogLayerConfig = {
  dialog: DialogIns
  kind: 'modal' | 'drawer'
  zIndex: () => number
  keyboard: () => boolean
  onEscape: () => void
  panel: () => HTMLElement | undefined
  /** Trap focus inside the panel while top-most. Default true. */
  trap: () => boolean
  /** Restore focus to the opener after close. Default true. */
  restoreFocus: () => boolean
  /** Lock body scroll while shown. */
  lock: () => boolean
}

/** antd mask: `boolean | { enabled, blur, closable }`; `maskClosable` is the deprecated fallback. */
export type DialogMaskConfig = { enabled?: boolean; blur?: boolean; closable?: boolean }
/** antd focusable. */
export type DialogFocusable = { trap?: boolean; focusTriggerAfterClose?: boolean }

export const resolveMask = (mask: boolean | DialogMaskConfig | undefined, maskClosable: boolean | undefined) => {
  const config = typeof mask === 'object' && mask !== null ? mask : { enabled: mask !== false }
  return {
    enabled: config.enabled !== false,
    blur: config.blur === true,
    closable: config.closable ?? maskClosable ?? true,
  }
}

/**
 * antd useClosable: `closable` true/object shows the button; `closeIcon`
 * null/false hides it; an object may carry its own closeIcon / disabled.
 */
export const resolveClosable = <T extends { closeIcon?: unknown; disabled?: boolean }>(
  closable: boolean | T | undefined, closeIcon: unknown, fallback: boolean,
) => {
  const config = typeof closable === 'object' && closable !== null ? closable : undefined
  const icon = config?.closeIcon !== undefined ? config.closeIcon : closeIcon
  const show = (closable === undefined ? fallback : closable !== false) && icon !== null && icon !== false
  return { show, icon: icon === undefined || icon === true ? undefined : icon, disabled: config?.disabled === true, config }
}

/** Number / numeric string → px; other strings pass through. */
export const cssSize = (value: number | string | undefined) => {
  if (value === undefined) return undefined
  if (typeof value === 'number') return `${value}px`
  return /^\d+(\.\d+)?$/.test(value) ? `${value}px` : value
}

const FOCUSABLE ='button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'

// ---- scroll lock (page-wide counter) ---------------------------------------
let lockCount = 0
let savedBody: { overflow: string; paddingRight: string } | undefined

const lockBody = () => {
  lockCount += 1
  document.body.dataset.utDialogLock = String(lockCount)
  if (lockCount > 1) return
  const body = document.body
  savedBody = { overflow: body.style.overflow, paddingRight: body.style.paddingRight }
  // Scrollbar compensation: hiding the scrollbar widens the page, so pad the
  // body by the scrollbar width to keep the layout still (rc-util locker).
  const scrollbar = window.innerWidth - document.documentElement.clientWidth
  if (scrollbar > 0) {
    const current = Number.parseFloat(getComputedStyle(body).paddingRight) || 0
    body.style.paddingRight = `${current + scrollbar}px`
  }
  body.style.overflow = 'hidden'
}

const unlockBody = () => {
  if (lockCount === 0) return
  lockCount -= 1
  if (lockCount > 0) { document.body.dataset.utDialogLock = String(lockCount); return }
  delete document.body.dataset.utDialogLock
  document.body.style.overflow = savedBody?.overflow ?? ''
  document.body.style.paddingRight = savedBody?.paddingRight ?? ''
  savedBody = undefined
}

/** Page-wide scroll lock shared with Tour (rc-tour Portal autoLock). Every lock must be paired with one unlock. */
export const lockBodyScroll = () => lockBody()
export const unlockBodyScroll = () => unlockBody()

export const createDialogLayer = (config: DialogLayerConfig) => {
  const { dialog } = config
  const stackId = Symbol(config.kind)

  // ---- enter phase ---------------------------------------------------------
  const [phase, setPhase] = createSignal<'idle' | 'enter' | 'live'>('idle', { ownedWrite: true })
  createEffect(
    () => dialog.animatedOpen(),
    (animated, prev) => {
      // Rising edge only; a reopen inside the leave window reverses the live
      // transition and needs no re-enter.
      if (animated && prev !== true) {
        setPhase('enter')
        const timer = setTimeout(() => setPhase('live'), 0)
        return () => clearTimeout(timer)
      }
    },
  )
  const visible = createMemo(() => phase() === 'enter' ? false : dialog.open())

  // ---- stack ---------------------------------------------------------------
  createEffect(
    () => ({ open: dialog.open(), zIndex: config.zIndex() }),
    ({ open, zIndex }) => {
      if (!open) return
      registerDialog({
        id: stackId,
        zIndex,
        kind: config.kind,
        onEscape: () => untrack(() => { if (config.keyboard()) config.onEscape() }),
      })
      return () => unregisterDialog(stackId)
    },
  )
  onCleanup(() => unregisterDialog(stackId))

  // ---- focus ---------------------------------------------------------------
  let opener: HTMLElement | undefined
  createEffect(
    () => dialog.open(),
    (open) => {
      if (typeof document === 'undefined') return
      if (!open) {
        const target = opener
        opener = undefined
        dialog.setLastActiveElement(undefined)
        if (target?.isConnected && untrack(config.restoreFocus)) target.focus({ preventScroll: true })
        return
      }
      const active = document.activeElement
      const panelNow = untrack(config.panel)
      if (active instanceof HTMLElement && !panelNow?.contains(active)) {
        opener = active
        dialog.setLastActiveElement(active)
      }
      // The panel ref runs before insertion; move focus one macrotask later.
      const timer = setTimeout(() => {
        const panel = untrack(config.panel)
        if (panel && !panel.contains(document.activeElement)) panel.focus({ preventScroll: true })
      }, 0)
      const trapping = () => untrack(() => config.trap() && isTopDialog(stackId) && !!config.panel())
      const onFocusIn = (event: FocusEvent) => {
        if (!trapping()) return
        const panel = untrack(config.panel)!
        if (!panel.contains(event.target as Node)) panel.focus({ preventScroll: true })
      }
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key !== 'Tab' || !trapping()) return
        const panel = untrack(config.panel)!
        const nodes = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(el => el.getClientRects().length)
        const first = nodes[0]
        const last = nodes.at(-1)
        if (!first) { event.preventDefault(); panel.focus(); return }
        const current = document.activeElement
        if (event.shiftKey && (current === first || current === panel || !panel.contains(current))) {
          event.preventDefault(); last!.focus()
        } else if (!event.shiftKey && (current === last || !panel.contains(current))) {
          event.preventDefault(); first.focus()
        }
      }
      document.addEventListener('focusin', onFocusIn)
      document.addEventListener('keydown', onKeyDown)
      return () => {
        clearTimeout(timer)
        document.removeEventListener('focusin', onFocusIn)
        document.removeEventListener('keydown', onKeyDown)
      }
    },
  )

  // ---- scroll lock ---------------------------------------------------------
  createEffect(
    () => dialog.animatedOpen() && config.lock(),
    (locked) => {
      if (!locked || typeof document === 'undefined') return
      lockBody()
      return unlockBody
    },
  )

  const pushed = createMemo(() => dialog.open() && isPushed(stackId, config.zIndex()))

  return { stackId, visible, pushed }
}
