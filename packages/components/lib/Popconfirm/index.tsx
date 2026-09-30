import { ConfigPortal as Portal } from '../ConfigProvider/Portal'
import { useComponentProps } from '../ConfigProvider/context'
import { Component, children as resolveChildren, createMemo, merge, Show, untrack } from 'solid-js'
import { type JSX } from '@solidjs/web'
import { createPopconfirm, type PopconfirmIns, type TriggerPlacement, type TriggerAction } from 'upthrust-competence'
import {
  popconfirmOverlayClass, popconfirmContainerClass, popconfirmMessageClass, popconfirmIconClass,
  popconfirmTitleClass, popconfirmDescriptionClass, popconfirmButtonsClass, popconfirmArrowClass,
} from './styles'
import Button, { type ButtonProps, type ButtonType } from '../Button'
import { ExclamationCircleFilled } from '../../common/antIcons'
import { mergeClass } from '../../common/merge'
import { resolveSemantic, type SemanticInput } from '../../common/semantic'

// computeArrow reports the arrow CENTER; the 8px square is placed by its top-left corner.
const ARROW_HALF = 4

export type { PopconfirmIns } from 'upthrust-competence'
export type PopconfirmPlacement = TriggerPlacement
export type PopconfirmTrigger = TriggerAction
/** antd LegacyButtonType: a Button type, or 'danger' (default-type danger button). */
export type PopconfirmOkType = ButtonType | 'danger'

export interface PopconfirmSemanticClassNames {
  root?: string
  container?: string
  arrow?: string
  icon?: string
  title?: string
  /** The description block. */
  content?: string
}
export interface PopconfirmSemanticStyles {
  root?: JSX.CSSProperties
  container?: JSX.CSSProperties
  arrow?: JSX.CSSProperties
  icon?: JSX.CSSProperties
  title?: JSX.CSSProperties
  content?: JSX.CSSProperties
}
export interface PopconfirmSemanticInfo { props: PopconfirmProps }

export interface PopconfirmProps {
  /** Confirmation question. A function is called at render time (antd RenderFunction). */
  title?: JSX.Element | (() => JSX.Element)
  /** Additional description under the title. */
  description?: JSX.Element | (() => JSX.Element)
  /** Default 'click'. */
  trigger?: PopconfirmTrigger
  /** Default 'top'. */
  placement?: PopconfirmPlacement
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Clicking the trigger does not open the popconfirm. */
  disabled?: boolean
  /** Default '确定'. */
  okText?: JSX.Element
  /** Default 'primary'. */
  okType?: PopconfirmOkType
  /** Default '取消'. */
  cancelText?: JSX.Element
  okButtonProps?: Partial<ButtonProps>
  cancelButtonProps?: Partial<ButtonProps>
  /** Show the cancel button. Default true. */
  showCancel?: boolean
  /** Custom icon; null / false hides it. Default ExclamationCircleFilled (warning color). */
  icon?: JSX.Element | false
  /** Sync: closes at once. Promise: loading OK button, closes on resolve, stays open on reject. */
  onConfirm?: (e?: Event) => void | Promise<unknown>
  /** Closes the panel, then fires. */
  onCancel?: (e?: Event) => void
  /** Click anywhere inside the popup content. */
  onPopupClick?: (e: MouseEvent) => void
  /** Show the pointing arrow. Default true; the arrow always points at the trigger center. */
  arrow?: boolean | { pointAtCenter?: boolean }
  /** Hover open delay (hover trigger), ms. Default 100. */
  mouseEnterDelay?: number
  /** Hover close delay, ms. Default 100. */
  mouseLeaveDelay?: number
  /** Default 1060 (antd zIndexPopupBase + 60). */
  zIndex?: number
  getContainer?: () => HTMLElement
  classNames?: SemanticInput<PopconfirmSemanticClassNames, PopconfirmSemanticInfo>
  styles?: SemanticInput<PopconfirmSemanticStyles, PopconfirmSemanticInfo>
  /** @deprecated Use classNames.root. */
  overlayClass?: string
  /** @deprecated Use styles.root. */
  overlayStyle?: JSX.CSSProperties
  children: JSX.Element
  class?: string
  style?: JSX.CSSProperties
  ref?: (val: PopconfirmIns) => void
}

const renderable = (value: unknown) => value !== undefined && value !== null && value !== false && value !== ''

const Popconfirm: Component<PopconfirmProps> = (providedProps) => {
  const rawProps = useComponentProps('Popconfirm', providedProps)
  const props = merge(
    { trigger: 'click' as PopconfirmTrigger, placement: 'top' as PopconfirmPlacement, okType: 'primary' as PopconfirmOkType, showCancel: true },
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
    get arrow() { return props.arrow !== false },
    get mouseEnterDelay() { return props.mouseEnterDelay },
    get mouseLeaveDelay() { return props.mouseLeaveDelay },
  })

  // children() resolves RenderFunction titles / descriptions as well as plain nodes.
  const title = resolveChildren(() => props.title as JSX.Element)
  const description = resolveChildren(() => props.description as JSX.Element)
  const hasTitle = () => renderable(title())
  const hasDescription = () => renderable(description())
  const showIcon = () => props.icon !== false && props.icon !== null

  const classNames = createMemo(() => resolveSemantic(props.classNames, { props }))
  const styles = createMemo(() => resolveSemantic(props.styles, { props }))

  const okTypeProps = (): Partial<ButtonProps> => props.okType === 'danger' ? { danger: true } : { type: props.okType as ButtonType }

  untrack(() => props.ref?.(popconfirm.refs))

  return (
    <div class={mergeClass("relative inline-block", props.class)} style={props.style}>
      <div ref={popconfirm.triggerRef}>
        {props.children}
      </div>
      <Portal mount={props.getContainer?.()}>
        <Show when={popconfirm.mounted()}>
          <div
            ref={(el) => { popconfirm.layerRef(el); popconfirm.bindLayerHover() }}
            class={mergeClass(
              popconfirmOverlayClass({ visible: popconfirm.open(), placement: popconfirm.actualPlacement() }),
              props.overlayClass,
              classNames().root,
            )}
            style={{ ...popconfirm.layerStyle(), 'z-index': String(props.zIndex ?? 1060), ...props.overlayStyle, ...styles().root }}
            role="dialog"
            aria-hidden={!popconfirm.open() ? 'true' : undefined}
            inert={!popconfirm.open()}
            data-popconfirm-part="root"
          >
            <div class={mergeClass(popconfirmContainerClass({}), classNames().container)} style={styles().container} data-popconfirm-part="container">
              <div onClick={(e) => props.onPopupClick?.(e)}>
                <div class={popconfirmMessageClass({})}>
                  <Show when={showIcon()}>
                    <span class={mergeClass(popconfirmIconClass({}), classNames().icon)} style={styles().icon} data-popconfirm-part="icon">
                      {props.icon ?? <ExclamationCircleFilled class="flex" />}
                    </span>
                  </Show>
                  <div class="min-w-0">
                    <Show when={hasTitle()}>
                      <div class={mergeClass(popconfirmTitleClass({ strong: hasDescription() }), classNames().title)} style={styles().title} data-popconfirm-part="title">
                        {title()}
                      </div>
                    </Show>
                    <Show when={hasDescription()}>
                      <div class={mergeClass(popconfirmDescriptionClass({}), classNames().content)} style={styles().content} data-popconfirm-part="description">
                        {description()}
                      </div>
                    </Show>
                  </div>
                </div>
                <div class={popconfirmButtonsClass({})} data-popconfirm-part="buttons">
                  <Show when={props.showCancel}>
                    <Button size="small" {...props.cancelButtonProps} onClick={(e) => popconfirm.cancel(e)}>
                      {props.cancelText ?? '取消'}
                    </Button>
                  </Show>
                  <Button size="small" {...okTypeProps()} loading={popconfirm.loading()} {...props.okButtonProps} onClick={(e) => popconfirm.confirm(e)}>
                    {props.okText ?? '确定'}
                  </Button>
                </div>
              </div>
            </div>
            <Show when={popconfirm.arrow()}>
              {(arrow) => (
                <span
                  class={mergeClass(popconfirmArrowClass(arrow().side), classNames().arrow)}
                  // Cross-axis position via inline style; the side class owns
                  // the main axis. Never set both (over-constrained).
                  style={{
                    ...(arrow().side === 'left' || arrow().side === 'right' ? { top: `${arrow().y - ARROW_HALF}px` } : { left: `${arrow().x - ARROW_HALF}px` }),
                    ...styles().arrow,
                  }}
                  data-popconfirm-part="arrow"
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
