import { createMemo, createSignal } from "solid-js";
import { createTrigger, type TriggerAction, type TriggerPlacement } from "./trigger";

/**
 * Headless logic for Popconfirm — a click-to-confirm floating panel built on
 * the shared createTrigger mechanics.
 *
 * Popconfirm-specific behavior layered on top:
 *  - default trigger is `click`, placement `top` (antd parity)
 *  - confirm / cancel intents close the panel and fire the matching callback
 *    (with optional loading state on the OK button — `onConfirm` may return a
 *    promise; the panel stays open until it settles)
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
    arrow: true,
  })

  // True while an async onConfirm is in flight — the OK button renders its
  // loading state and the panel refuses to close.
  const [_loading, _setLoading] = createSignal(false, { ownedWrite: true })

  const runIntent = (action: 'confirm' | 'cancel', e?: Event) => {
    const cb = action === 'confirm' ? config.onConfirm : config.onCancel
    const result = cb?.(e)
    if (result && typeof (result as Promise<unknown>).then === 'function') {
      // Async handler: hold the panel open with a loading OK button until the
      // promise settles, then close. Rejection closes too — surfacing errors
      // is the app's job, not the popconfirm's.
      _setLoading(true)
      ;(result as Promise<unknown>).finally(() => {
        _setLoading(false)
        trigger.setOpen(false)
      })
      return
    }
    trigger.setOpen(false)
  }

  const confirm = (e?: Event) => runIntent('confirm', e)
  const cancel = (e?: Event) => runIntent('cancel', e)

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
  'onOpenChange', 'getContainer', 'onConfirm', 'onCancel',
]
