import { ConfigPortal as Portal } from '../ConfigProvider/Portal'
import { useComponentProps } from '../ConfigProvider/context'
import { Component, createMemo, merge, Show } from 'solid-js'
import { type JSX } from '@solidjs/web'
import { createTrigger, type TriggerPlacement, type TriggerAction } from 'upthrust-competence'
import { popoverOverlayClass, popoverTitleClass, popoverInnerClass, popoverArrowClass } from './styles'
import { twMerge } from 'tailwind-merge'

export type PopoverPlacement = TriggerPlacement
export type PopoverTrigger = TriggerAction

export interface PopoverProps {
  /** Card title. */
  title?: JSX.Element
  /** Content of the card. */
  content?: JSX.Element
  /** Default 'hover'. */
  trigger?: PopoverTrigger
  /** Default 'top'. */
  placement?: PopoverPlacement
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  getContainer?: () => HTMLElement
  overlayClass?: string
  overlayStyle?: JSX.CSSProperties
  children: JSX.Element
  class?: string
  style?: JSX.CSSProperties
}

const Popover: Component<PopoverProps> = (providedProps) => {
  const rawProps = useComponentProps('Popover', providedProps)
  const props = merge(
    { trigger: 'hover' as PopoverTrigger, placement: 'top' as PopoverPlacement },
    rawProps
  )

  // Popover keeps no state of its own — it is a thin visual skin over the
  // shared createTrigger floating-layer mechanics (the rc-trigger subset),
  // exactly like Dropdown but rendering free-form title/content instead of a
  // menu.
  const hasTitle = createMemo(() => props.title !== undefined && props.title !== null && props.title !== '' && props.title !== false)
  const hasContent = createMemo(() => props.content !== undefined && props.content !== null && props.content !== '' && props.content !== false)
  const hasAnyContent = createMemo(() => hasTitle() || hasContent())

  const trigger = createTrigger({
    get open() { return props.open },
    get defaultOpen() { return props.defaultOpen },
    get disabled() { return props.disabled || !hasAnyContent() },
    get action() { return props.trigger },
    get placement() { return props.placement },
    get onOpenChange() { return props.onOpenChange },
    get getContainer() { return props.getContainer },
    arrow: true,
  })

  const visible = createMemo(() => trigger.open() && hasAnyContent())

  return (
    <div class={twMerge("relative inline-block", props.class)} style={props.style}>
      <div ref={trigger.triggerRef}>
        {props.children}
      </div>
      <Portal mount={props.getContainer?.()}>
        <Show when={trigger.mounted()}>
          <div
            ref={(el) => { trigger.layerRef(el); trigger.bindLayerHover() }}
            class={twMerge(
              popoverOverlayClass({ visible: visible(), placement: trigger.actualPlacement() }),
              props.overlayClass
            )}
            style={{ ...trigger.layerStyle(), ...props.overlayStyle }}
            role="dialog"
            aria-hidden={!visible() ? 'true' : undefined}
            inert={!visible()}
          >
            <Show when={hasTitle()}>
              <div class={popoverTitleClass({})}>{props.title}</div>
            </Show>
            <Show when={hasContent()}>
              <div class={popoverInnerClass({ hasTitle: hasTitle() })}>{props.content}</div>
            </Show>
            <Show when={trigger.arrow()}>
              {(arrow) => (
                <span
                  class={popoverArrowClass(arrow().side)}
                  // Cross-axis position via inline style; the side class owns
                  // the main axis. Never set both (over-constrained).
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

export default Popover
