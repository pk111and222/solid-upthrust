import { ConfigPortal as Portal } from '../ConfigProvider/Portal'
import { useComponentProps } from '../ConfigProvider/context'
import { Component, createMemo, merge, Show, untrack } from 'solid-js'
import { type JSX } from '@solidjs/web'
import { createTooltip, type TooltipIns, type TriggerPlacement, type TriggerAction } from 'upthrust-competence'
import { tooltipOverlayClass, tooltipArrowClass } from './styles'
import { twMerge } from 'tailwind-merge'

export type { TooltipIns } from 'upthrust-competence'
export type TooltipPlacement = TriggerPlacement
export type TooltipTrigger = TriggerAction

export interface TooltipProps {
  /** Tooltip content. Empty title renders nothing (antd parity). */
  title?: JSX.Element
  /** Default 'hover'. */
  trigger?: TooltipTrigger
  /** Default 'top'. */
  placement?: TooltipPlacement
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  /** Delay before opening on hover, ms. Default 100. */
  mouseEnterDelay?: number
  /** Delay before closing on leave, ms. Default 100. */
  mouseLeaveDelay?: number
  getContainer?: () => HTMLElement
  overlayClass?: string
  overlayStyle?: JSX.CSSProperties
  children: JSX.Element
  class?: string
  style?: JSX.CSSProperties
  ref?: (val: TooltipIns) => void
}

const Tooltip: Component<TooltipProps> = (providedProps) => {
  const rawProps = useComponentProps('Tooltip', providedProps)
  const props = merge(
    { trigger: 'hover' as TooltipTrigger, placement: 'top' as TooltipPlacement },
    rawProps
  )

  const hasTitle = createMemo(() => props.title !== undefined && props.title !== null && props.title !== '' && props.title !== false)

  const tooltip = createTooltip({
    get open() { return props.open },
    get defaultOpen() { return props.defaultOpen },
    get disabled() { return props.disabled || !hasTitle() },
    get trigger() { return props.trigger },
    get placement() { return props.placement },
    get mouseEnterDelay() { return props.mouseEnterDelay },
    get mouseLeaveDelay() { return props.mouseLeaveDelay },
    get onOpenChange() { return props.onOpenChange },
    get getContainer() { return props.getContainer },
  })

  const visible = createMemo(() => tooltip.open() && hasTitle())

  untrack(() => props.ref?.(tooltip.refs))

  return (
    <div class={twMerge("relative inline-block", props.class)} style={props.style}>
      <div ref={tooltip.triggerRef}>
        {props.children}
      </div>
      <Portal mount={props.getContainer?.()}>
        <Show when={tooltip.mounted()}>
          <div
            ref={(el) => { tooltip.layerRef(el); tooltip.bindLayerHover() }}
            class={twMerge(
              tooltipOverlayClass({ visible: visible(), placement: tooltip.actualPlacement() }),
              props.overlayClass
            )}
            style={{ ...tooltip.layerStyle(), ...props.overlayStyle }}
            role="tooltip"
            aria-hidden={!visible() ? 'true' : undefined}
            inert={!visible()}
          >
            {props.title}
            <Show when={tooltip.arrow()}>
              {(arrow) => (
                <span
                  class={tooltipArrowClass(arrow().side)}
                  // Cross-axis position via inline style; the side class
                  // (-top/-bottom/-left/-right) owns the main axis. Never set
                  // both — over-constrained absolute positioning makes the
                  // inline one win and drops the arrow off the layer.
                  style={
                    arrow().side === 'left' || arrow().side === 'right'
                      ? { top: `${arrow().y}px` }
                      : { left: `${arrow().x}px` }
                  }
                />
              )}
            </Show>
          </div>
        </Show>
      </Portal>
    </div>
  )
}

export default Tooltip
