import { createMemo } from "solid-js";
import { createTrigger, type TriggerAction, type TriggerPlacement } from "./trigger";

/**
 * Headless logic for Tooltip — a thin createTrigger specialization.
 *
 * Tooltip semantics on top of the shared floating-layer mechanics:
 *  - default trigger is `hover` (antd parity), placement `top`
 *  - antd-style open/close delays: open waits `mouseEnterDelay` (default 0.1s),
 *    close waits `mouseLeaveDelay` (default 0.1s) — both mapped onto
 *    createTrigger's hoverOpenDelay / hoverDelay
 *  - exposes the full trigger API (layerStyle, actualPlacement, …) so the UI
 *    layer renders through the same Portal + measured-positioning pipeline
 *    as Dropdown
 */

export type TooltipConfig = {
  open?: boolean
  defaultOpen?: boolean
  disabled?: boolean
  /** How the tooltip opens. Default 'hover'. */
  trigger?: TriggerAction
  /** Default 'top'. */
  placement?: TriggerPlacement
  /** Delay before opening on hover, ms. Default 100. */
  mouseEnterDelay?: number
  /** Delay before closing on leave, ms. Default 100. */
  mouseLeaveDelay?: number
  onOpenChange?: (open: boolean) => void
  getContainer?: () => HTMLElement
}

export type TooltipIns = {
  open: () => boolean
  setOpen: (v: boolean) => void
}

export const createTooltip = (config: TooltipConfig = {}) => {
  const trigger = createTrigger({
    get open() { return config.open },
    get defaultOpen() { return config.defaultOpen },
    get disabled() { return config.disabled },
    get action() { return config.trigger ?? 'hover' },
    get placement() { return config.placement ?? 'top' },
    get onOpenChange() { return config.onOpenChange },
    get getContainer() { return config.getContainer },
    get hoverOpenDelay() { return config.mouseEnterDelay ?? 100 },
    get hoverDelay() { return config.mouseLeaveDelay ?? 100 },
    arrow: true,
  })

  const open = createMemo(() => trigger.open())

  const refs: TooltipIns = {
    open,
    setOpen: trigger.setOpen,
  }

  return {
    ...trigger,
    open,
    refs,
  }
}

export const tooltipSplits: (keyof TooltipConfig)[] = [
  'open', 'defaultOpen', 'disabled', 'trigger', 'placement',
  'mouseEnterDelay', 'mouseLeaveDelay', 'onOpenChange', 'getContainer',
]
