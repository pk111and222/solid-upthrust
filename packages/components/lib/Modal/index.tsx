import { ConfigPortal as Portal } from '../ConfigProvider/Portal'
import { useComponentProps } from '../ConfigProvider/context'
import { Component, createMemo, merge, Show } from 'solid-js'
import { type JSX } from '@solidjs/web'
import { createBreakpoint, createDialog, SCREEN_KEYS, type DialogIns, type DialogIntent, type ResponsiveValue, type ScreenMap } from 'upthrust-competence'
import {
  modalRootClass, modalMaskClass, modalWrapperClass, modalPanelClass, modalContainerClass, modalHeaderClass,
  modalTitleClass, modalBodyClass, modalFooterClass, modalCloseClass,
} from './styles'
import Button, { type ButtonProps, type ButtonType } from '../Button'
import Skeleton from '../Skeleton'
import { CloseOutlined } from '../../common/antIcons'
import { mergeClass } from '../../common/merge'
import { resolveSemantic, type SemanticInput } from '../../common/semantic'
import { useWatermarkPanel } from '../Watermark/context'
import {
  createDialogLayer, cssSize, resolveClosable, resolveMask, type DialogFocusable, type DialogMaskConfig,
} from '../_dialogLayer'
import { createModalMethods } from './static'
export type { ModalStaticConfig, ModalStaticResult } from './static'
export type { DialogMaskConfig as ModalMaskConfig, DialogFocusable as ModalFocusable } from '../_dialogLayer'

export interface ModalClosableConfig {
  closeIcon?: JSX.Element
  disabled?: boolean
  /** Fires after the close animation (in addition to afterClose). */
  afterClose?: () => void
  /** Fires when the × button is clicked, before onCancel. */
  onClose?: () => void
}

export interface ModalSemanticClassNames {
  root?: string; mask?: string; wrapper?: string; container?: string
  header?: string; title?: string; body?: string; footer?: string; close?: string
}
export interface ModalSemanticStyles {
  root?: JSX.CSSProperties; mask?: JSX.CSSProperties; wrapper?: JSX.CSSProperties; container?: JSX.CSSProperties
  header?: JSX.CSSProperties; title?: JSX.CSSProperties; body?: JSX.CSSProperties; footer?: JSX.CSSProperties; close?: JSX.CSSProperties
}
export interface ModalSemanticInfo { props: ModalProps }

export interface ModalFooterExtra {
  OkBtn: Component
  CancelBtn: Component
}

export interface ModalProps {
  open?: boolean
  /** Uncontrolled initial open. */
  defaultOpen?: boolean
  title?: JSX.Element
  /** Body content. */
  children?: JSX.Element
  /**
   * Footer. undefined renders the default Cancel / OK row; null / false hides
   * it; a function receives the default row and the two buttons.
   */
  footer?: JSX.Element | null | false | ((originNode: JSX.Element, extra: ModalFooterExtra) => JSX.Element)
  okText?: JSX.Element
  cancelText?: JSX.Element
  /** OK button type. Default 'primary'. */
  okType?: ButtonType
  /** @deprecated Use okType / okButtonProps. */
  okVariant?: 'solid' | 'outlined' | 'text' | 'dashed' | 'link'
  okButtonProps?: Partial<ButtonProps>
  cancelButtonProps?: Partial<ButtonProps>
  /** Loading state of the OK button. */
  confirmLoading?: boolean
  /** OK intent. Return false / a rejecting promise to stay open; a promise holds the OK loading. */
  onOk?: (e: MouseEvent) => void | boolean | Promise<unknown>
  /** Cancel intent (mask / Escape / × / Cancel). Same veto rules as onOk. */
  onCancel?: (e: MouseEvent | KeyboardEvent) => void | boolean | Promise<unknown>
  afterClose?: () => void
  afterOpenChange?: (open: boolean) => void
  /** Mask: boolean or { enabled, blur, closable }. Default true. */
  mask?: boolean | DialogMaskConfig
  /** @deprecated Use mask.closable. Close on mask click. Default true. */
  maskClosable?: boolean
  /** Close on Escape. Default true. */
  keyboard?: boolean
  /** Show the × button; an object customises it. Default true. */
  closable?: boolean | ModalClosableConfig
  /** Custom × icon; null / false hides the button. */
  closeIcon?: JSX.Element | null | false
  /** Vertically center the panel. Default false (100px from the top). */
  centered?: boolean
  /** Panel width: px, CSS length or a breakpoint map. Default 520. */
  width?: number | string | ResponsiveValue<number | string>
  /** Show a skeleton instead of the body and hide the footer. */
  loading?: boolean
  /** Unmount the DOM after close. Default false (kept alive, hidden). */
  destroyOnHidden?: boolean
  /** Render the DOM before the first open. */
  forceRender?: boolean
  /** Focus trap and restore. Default { trap: true, focusTriggerAfterClose: true }. */
  focusable?: DialogFocusable
  /** Wrap the container node (e.g. to make it draggable). */
  modalRender?: (node: JSX.Element) => JSX.Element
  /** Lock body scroll while open. Default true. */
  scrollLock?: boolean
  zIndex?: number
  /** Portal target; false renders in place. */
  getContainer?: (() => HTMLElement) | false
  /** Class on the panel (antd className). */
  class?: string
  /** Style on the panel. */
  style?: JSX.CSSProperties
  /** Class on the root layer. */
  rootClass?: string
  rootStyle?: JSX.CSSProperties
  /** Class on the scroll wrapper (antd wrapClassName). */
  wrapClass?: string
  classNames?: SemanticInput<ModalSemanticClassNames, ModalSemanticInfo>
  styles?: SemanticInput<ModalSemanticStyles, ModalSemanticInfo>
  ref?: (val: DialogIns) => void
}

/**
 * antd width map: mobile-first cascade — `xs` is the base, each wider matching
 * breakpoint that defines a value overrides it (antd emits min-width media
 * queries). SSR (null screens) takes the base.
 */
const resolveWidth = (width: ModalProps['width'], screens: ScreenMap | null): number | string | undefined => {
  if (typeof width !== 'object' || width === null) return width
  let value = width.xs
  for (const screen of SCREEN_KEYS) {
    if (screen === 'xs' || !screens?.[screen]) continue
    if (width[screen] !== undefined) value = width[screen]
  }
  return value
}

const ModalComponent: Component<ModalProps> = (providedProps) => {
  const rawProps = useComponentProps('Modal', providedProps)
  const props = merge({ keyboard: true, centered: false, width: 520 } as Partial<ModalProps>, rawProps)

  let closeEvent: MouseEvent | KeyboardEvent | undefined
  const dialog = createDialog({
    get open() { return props.open },
    get defaultOpen() { return props.defaultOpen },
    get destroyOnHidden() { return props.destroyOnHidden },
    get forceRender() { return props.forceRender },
    // A rejected callback or explicit false keeps the modal open for retry.
    shouldClose: (intent) => {
      try {
        const result = intent === 'ok'
          ? props.onOk?.(closeEvent as MouseEvent)
          : props.onCancel?.(closeEvent as MouseEvent | KeyboardEvent)
        return result && typeof (result as PromiseLike<unknown>).then === 'function'
          ? Promise.resolve(result).then(value => value !== false)
          : result !== false
      } catch {
        return false
      }
    },
    afterClose: () => {
      closableInfo().config?.afterClose?.()
      props.afterClose?.()
    },
    get afterOpenChange() { return props.afterOpenChange },
  })
  const requestClose = (intent: DialogIntent, event?: MouseEvent | KeyboardEvent) => {
    closeEvent = event
    dialog.requestClose(intent)
  }

  props.ref?.(dialog)

  const semanticInfo = (): ModalSemanticInfo => ({ props })
  const classNames = createMemo(() => resolveSemantic(props.classNames, semanticInfo()))
  const styles = createMemo(() => resolveSemantic(props.styles, semanticInfo()))
  const maskInfo = createMemo(() => resolveMask(props.mask, props.maskClosable))
  const closableInfo = createMemo(() => resolveClosable(props.closable, props.closeIcon, true))

  let panelEl: HTMLDivElement | undefined
  const layer = createDialogLayer({
    dialog,
    kind: 'modal',
    zIndex: () => props.zIndex ?? 1000,
    keyboard: () => props.keyboard !== false,
    onEscape: () => requestClose('keyboard', new KeyboardEvent('keydown', { key: 'Escape' })),
    panel: () => panelEl,
    trap: () => props.focusable?.trap !== false,
    restoreFocus: () => props.focusable?.focusTriggerAfterClose !== false,
    lock: () => props.scrollLock !== false && props.getContainer !== false,
  })
  // antd usePanelRef：外层 Watermark（inherit）把水印也挂到弹层面板上。
  useWatermarkPanel(() => dialog.animatedOpen(), () => panelEl)

  const screens = createBreakpoint().screens
  const panelWidth = createMemo(() => cssSize(resolveWidth(props.width, screens()) ?? 520))

  const hasTitle = createMemo(() => props.title !== undefined && props.title !== null && props.title !== false)
  const okLoading = createMemo(() => dialog.busy() || !!props.confirmLoading)

  const onMaskClick = (e: MouseEvent) => {
    // Only direct clicks on the wrapper itself (not bubbled from the panel).
    if (e.target !== e.currentTarget || !maskInfo().closable) return
    requestClose('mask', e)
  }

  const CancelBtn: Component = () => (
    <Button {...props.cancelButtonProps} onClick={e => requestClose('cancel', e)}>
      {props.cancelText ?? '取消'}
    </Button>
  )
  const OkBtn: Component = () => (
    <Button
      {...(props.okVariant ? { variant: props.okVariant, color: 'primary' as const } : { type: props.okType ?? 'primary' })}
      loading={okLoading()}
      {...props.okButtonProps}
      onClick={e => requestClose('ok', e)}
    >
      {props.okText ?? '确定'}
    </Button>
  )

  const footerNode = () => {
    const footer = props.footer
    if (footer === null || footer === false || props.loading) return undefined
    if (typeof footer === 'function') return footer(<><CancelBtn /><OkBtn /></>, { OkBtn, CancelBtn })
    if (footer !== undefined) return footer
    return <><CancelBtn /><OkBtn /></>
  }

  const ariaId = `ut-modal-${Math.random().toString(36).slice(2, 9)}`

  const container = () => (
    <div class={mergeClass(modalContainerClass({}), classNames().container)} style={styles().container} data-modal-part="container">
      <Show when={closableInfo().show}>
        <button
          type="button"
          class={mergeClass(modalCloseClass({ disabled: closableInfo().disabled }), classNames().close)}
          style={styles().close}
          aria-label="Close"
          disabled={closableInfo().disabled}
          onClick={(e) => {
            closableInfo().config?.onClose?.()
            requestClose('close', e)
          }}
        >
          {(closableInfo().icon as JSX.Element) ?? <CloseOutlined />}
        </button>
      </Show>
      <Show when={hasTitle()}>
        <div class={mergeClass(modalHeaderClass({ closable: closableInfo().show }), classNames().header)} style={styles().header}>
          <div id={ariaId} class={mergeClass(modalTitleClass({}), classNames().title)} style={styles().title}>{props.title}</div>
        </div>
      </Show>
      <div class={mergeClass(modalBodyClass({}), classNames().body)} style={styles().body}>
        <Show when={props.loading} fallback={props.children}>
          <Skeleton active title={false} paragraph={{ rows: 4 }} />
        </Show>
      </div>
      {(() => {
        const node = footerNode()
        return node === undefined ? null : (
          <div class={mergeClass(modalFooterClass({}), classNames().footer)} style={styles().footer}>{node}</div>
        )
      })()}
    </div>
  )

  const tree = () => (
    <div
      class={mergeClass(modalRootClass({ hidden: !dialog.animatedOpen() }), props.rootClass, classNames().root)}
      style={{ 'z-index': String(props.zIndex ?? 1000), ...props.rootStyle, ...styles().root }}
      data-modal-part="root"
    >
      <Show when={maskInfo().enabled}>
        <div
          class={mergeClass(modalMaskClass({ visible: layer.visible(), blur: maskInfo().blur }), classNames().mask)}
          style={styles().mask}
          data-modal-part="mask"
        />
      </Show>
      <div
        class={mergeClass(modalWrapperClass({ visible: layer.visible(), centered: !!props.centered }), props.wrapClass, classNames().wrapper)}
        style={styles().wrapper}
        onClick={onMaskClick}
        data-modal-part="wrapper"
      >
        <div
          ref={panelEl}
          role="dialog"
          aria-modal="true"
          aria-labelledby={hasTitle() ? ariaId : undefined}
          tabindex={-1}
          class={mergeClass(modalPanelClass({ visible: layer.visible(), centered: !!props.centered }), props.class)}
          style={{ ...props.style, width: panelWidth() }}
          onTransitionEnd={(e) => {
            // Leave transition finished → the machine may hide / unmount.
            if (!dialog.open() && e.target === panelEl) dialog.notifyLeaveDone()
          }}
        >
          {props.modalRender ? props.modalRender(container()) : container()}
        </div>
      </div>
    </div>
  )

  return (
    <Show when={dialog.mounted()}>
      <Show when={props.getContainer !== false} fallback={tree()}>
        <Portal mount={typeof props.getContainer === 'function' ? props.getContainer() : undefined}>{tree()}</Portal>
      </Show>
    </Show>
  )
}

const Modal = /* @__PURE__ */ Object.assign(ModalComponent, createModalMethods(ModalComponent))
export default Modal
