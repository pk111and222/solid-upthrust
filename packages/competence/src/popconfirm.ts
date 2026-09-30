import { createMemo, createSignal } from "solid-js";
import { createTrigger, type TriggerAction, type TriggerPlacement } from "./trigger";

/**
 * Headless logic for Popconfirm — a click-to-confirm floating panel built on
 * the shared createTrigger mechanics.
 *
 * Popconfirm-specific behavior layered on top:
 *  - default trigger is `click`, placement `top` (antd parity)
 *  - antd ActionButton semantics for OK: a sync `onConfirm` closes at once; a
 *    returned promise shows a loading OK button, closes on resolve and STAYS
 *    OPEN on reject; clicks while in flight are ignored (no double submit)
 *  - cancel closes first, then fires `onCancel` (never async-gated)
 *  - the raw trigger API (layerStyle, actualPlacement, …) passes through so
 *    the UI layer reuses the Dropdown rendering pipeline
 */

export type PopconfirmConfig = {
  open?: boolean
  defaultOpen?: boolean
  disabled?: boolean
  /** How the popconfirm opens. Default 'click'. */
  trigger?: TriggerAction
  /** Default 'top'. */
  placement?: TriggerPlacement
  onOpenChange?: (open: boolean) => void
  getContainer?: () => HTMLElement
  onConfirm?: (e?: Event) => void | Promise<unknown>
  onCancel?: (e?: Event) => void | Promise<unknown>
  /** Render the pointing arrow. Default true. */
  arrow?: boolean
  /** Hover open delay, ms (hover trigger only). Default 100. */
  mouseEnterDelay?: number
  /** Hover close delay, ms. Default 100. */
  mouseLeaveDelay?: number
}

export type PopconfirmIns = {
  open: () => boolean
  setOpen: (v: boolean) => void
  confirm: (e?: Event) => void
  cancel: (e?: Event) => void
  loading: () => boolean
}

export const createPopconfirm = (config: PopconfirmConfig = {}) => {
  const trigger = createTrigger({
    get open() { return config.open },
    get defaultOpen() { return config.defaultOpen },
    get disabled() { return config.disabled },
    get action() { return config.trigger ?? 'click' },
    get placement() { return config.placement ?? 'top' },
    get onOpenChange() { return config.onOpenChange },
    get getContainer() { return config.getContainer },
    get arrow() { return config.arrow ?? true },
    get hoverOpenDelay() { return config.mouseEnterDelay ?? 100 },
    get hoverDelay() { return config.mouseLeaveDelay ?? 100 },
  })

  // True while an async onConfirm is in flight — the OK button renders its
  // loading state and the panel refuses to close.
  const [_loading, _setLoading] = createSignal(false, { ownedWrite: true })

  // Synchronous in-flight guard: the loading signal commits in a batch, so a
  // second click in the same tick would still read false.
  let pending = false

  const confirm = (e?: Event) => {
    if (pending) return
    const result = config.onConfirm?.(e)
    if (!result || typeof (result as Promise<unknown>).then !== 'function') {
      trigger.setOpen(false)
      return
    }
    pending = true
    _setLoading(true)
    ;(result as Promise<unknown>).then(
      () => { pending = false; _setLoading(false); trigger.setOpen(false) },
      // Rejection keeps the panel open so the user can retry; surfacing the
      // error is the app's job.
      () => { pending = false; _setLoading(false) },
    )
  }

  const cancel = (e?: Event) => {
    trigger.setOpen(false)
    config.onCancel?.(e)
  }

  const open = createMemo(() => trigger.open())
  const loading = createMemo(() => _loading())

  const refs: PopconfirmIns = {
    open,
    setOpen: trigger.setOpen,
    confirm,
    cancel,
    loading,
  }

  return {
    ...trigger,
    open,
    confirm,
    cancel,
    loading,
    refs,
  }
}

export const popconfirmSplits: (keyof PopconfirmConfig)[] = [
  'open', 'defaultOpen', 'disabled', 'trigger', 'placement',
  'onOpenChange', 'getContainer', 'onConfirm', 'onCancel', 'arrow', 'mouseEnterDelay', 'mouseLeaveDelay',
]
