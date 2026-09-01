import { Component, createMemo, merge, Show } from 'solid-js'
import { Portal, type JSX } from '@solidjs/web'
import { createPopconfirm, type PopconfirmIns, type TriggerPlacement, type TriggerAction } from 'upthrust-competence'
import { popconfirmOverlayClass, popconfirmMessageClass, popconfirmDescriptionClass, popconfirmIconClass, popconfirmActionsClass, popconfirmArrowClass } from './styles'
import Button, { type ButtonProps } from '../Button'
import { twMerge } from 'tailwind-merge'

export type PopconfirmPlacement = TriggerPlacement
export type PopconfirmTrigger = TriggerAction

export interface PopconfirmProps {
  /** Confirmation question, e.g. "确定删除吗?" */
  title?: JSX.Element
  /** Optional additional description shown under the title. */
  description?: JSX.Element
  /** Default 'click'. */
  trigger?: PopconfirmTrigger
  /** Default 'top'. */
  placement?: PopconfirmPlacement
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  /** Text of the confirm button. Default '确定'. */
  okText?: JSX.Element
  /** Text of the cancel button. Default '取消'. */
  cancelText?: JSX.Element
  /** Props passed to the confirm Button. */
  okButtonProps?: Partial<ButtonProps>
  /** Props passed to the cancel Button. */
  cancelButtonProps?: Partial<ButtonProps>
  /** Custom icon; pass false to hide. Default help icon. */
  icon?: JSX.Element | false
  onConfirm?: (e?: Event) => void | Promise<unknown>
  onCancel?: (e?: Event) => void | Promise<unknown>
  getContainer?: () => HTMLElement
  overlayClass?: string
  overlayStyle?: JSX.CSSProperties
  children: JSX.Element
  class?: string
  style?: JSX.CSSProperties
  ref?: (val: PopconfirmIns) => void
}

const Popconfirm: Component<PopconfirmProps> = (rawProps) => {
  const props = merge(
    { trigger: 'click' as PopconfirmTrigger, placement: 'top' as PopconfirmPlacement },
    rawProps
  )

  const popconfirm = createPopconfirm({
    get open() { return props.open },
    get defaultOpen() { return props.defaultOpen },
    get disabled() { return props.disabled },
    get trigger() { return props.trigger },
    get placement() { return props.placement },
    get onOpenChange() { return props.onOpenChange },
    get getContainer() { return props.getContainer },
    get onConfirm() { return props.onConfirm },
    get onCancel() { return props.onCancel },
  })

  const hasTitle = createMemo(() => props.title !== undefined && props.title !== null && props.title !== '')
  const hasDescription = createMemo(() => props.description !== undefined && props.description !== null && props.description !== '')
  const showIcon = createMemo(() => props.icon !== false)
  const loading = createMemo(() => popconfirm.loading())

  props.ref?.(popconfirm.refs)

  return (
    <div class={twMerge("relative inline-block", props.class)} style={props.style}>
      <div ref={popconfirm.triggerRef}>
        {props.children}
      </div>
      <Portal>
        <Show when={popconfirm.mounted()}>
          <div
            ref={(el) => { popconfirm.layerRef(el); popconfirm.bindLayerHover() }}
            class={twMerge(
              popconfirmOverlayClass({ visible: popconfirm.open(), placement: popconfirm.actualPlacement() }),
              props.overlayClass
            )}
            style={{ ...popconfirm.layerStyle(), ...props.overlayStyle }}
            role="dialog"
          >
          <div class="flex items-start gap-[8px] p-3">
            <Show when={showIcon()}>
              <Show when={props.icon} fallback={<span class={popconfirmIconClass({})} />}>
                <span class="shrink-0 mt-[2px]">{props.icon}</span>
              </Show>
            </Show>
            <div class="flex-1 min-w-0">
              <div class={popconfirmMessageClass({ hasDescription: hasDescription() })}>
                {props.title}
              </div>
              <Show when={hasDescription()}>
                <div class={popconfirmDescriptionClass({})}>
                  {props.description}
                </div>
              </Show>
              <div class={popconfirmActionsClass({})}>
                <Button size="small" variant="outlined" {...props.cancelButtonProps} onClick={(e) => popconfirm.cancel(e)}>
                  {props.cancelText ?? '取消'}
                </Button>
                <Button size="small" variant="solid" color="primary" loading={loading()} {...props.okButtonProps} onClick={(e) => popconfirm.confirm(e)}>
                  {props.okText ?? '确定'}
                </Button>
              </div>
            </div>
          </div>
          <Show when={popconfirm.arrow()}>
            {(arrow) => (
              <span
                class={popconfirmArrowClass(arrow().side)}
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

export default Popconfirm
