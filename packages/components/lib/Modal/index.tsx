import { ConfigPortal as Portal } from '../ConfigProvider/Portal'
import { useComponentProps } from '../ConfigProvider/context'
import { Component, createEffect, createMemo, createSignal, merge, onCleanup, Show } from 'solid-js'
import { type JSX } from '@solidjs/web'
import { createDialog, type DialogIns } from 'upthrust-competence'
import {
  modalMaskClass, modalWrapperClass, modalPanelClass, modalHeaderClass,
  modalTitleClass, modalBodyClass, modalFooterClass, modalCloseClass, MODAL_CLOSE_ICON,
} from './styles'
import Button, { type ButtonProps } from '../Button'
import { registerDialog, unregisterDialog } from '../_dialogStack'
import { twMerge } from 'tailwind-merge'
import { createModalMethods } from './static'
export type { ModalStaticConfig, ModalStaticResult } from './static'

export interface ModalProps {
  open?: boolean
  /** Uncontrolled initial open. */
  defaultOpen?: boolean
  title?: JSX.Element
  /** Body content. */
  children?: JSX.Element
  /** Custom footer; null hides it, undefined renders default ok/cancel row. */
  footer?: JSX.Element | null
  okText?: JSX.Element
  cancelText?: JSX.Element
  /** Button variant of the OK button. Default 'solid' (primary). */
  okVariant?: 'solid' | 'outlined' | 'text' | 'dashed' | 'link'
  okButtonProps?: Partial<ButtonProps>
  cancelButtonProps?: Partial<ButtonProps>
  /** Loading state of the OK button while an async onOk is pending. */
  confirmLoading?: boolean
  /** Fires on every closing intent BEFORE the close (veto with false). */
  onOk?: (e: MouseEvent) => void | boolean | Promise<unknown>
  onCancel?: (e: MouseEvent | KeyboardEvent) => void | boolean | Promise<unknown>
  afterClose?: () => void
  afterOpenChange?: (open: boolean) => void
  /** Close on mask click. Default true. */
  maskClosable?: boolean
  /** Close on Escape. Default true. */
  keyboard?: boolean
  /** Show the × button. Default true. */
  closable?: boolean
  /** Vertically center the panel. Default false (antd top-aligned 100px). */
  centered?: boolean
  /** Panel width, px. Default 520 (antd). */
  width?: number | string
  /** Render the mask scrim. Default true. */
  mask?: boolean
  /** Unmount the panel after close. Default false. */
  destroyOnHidden?: boolean
  zIndex?: number
  getContainer?: () => HTMLElement
  class?: string
  /** Extra class on the panel element. */
  wrapClass?: string
  style?: JSX.CSSProperties
  ref?: (val: DialogIns) => void
}

const ModalComponent: Component<ModalProps> = (providedProps) => {
  const rawProps = useComponentProps('Modal', providedProps)
  const props = merge(
    {
      maskClosable: true,
      keyboard: true,
      closable: true,
      centered: false,
      width: 520,
      mask: true,
    } as Partial<ModalProps>,
    rawProps,
  )

  let closeEvent: MouseEvent | KeyboardEvent | undefined
  // A rejected callback or explicit false keeps the modal open for retry.
  const dialog = createDialog({
    get open() { return props.open },
    get defaultOpen() { return props.defaultOpen },
    get destroyOnHidden() { return props.destroyOnHidden },
    get shouldClose() {
      return (intent: 'mask' | 'keyboard' | 'close' | 'ok' | 'cancel') => {
        try {
          const result = intent === 'ok'
            ? props.onOk?.(closeEvent as MouseEvent)
            : props.onCancel?.(closeEvent as MouseEvent | KeyboardEvent)
          return result instanceof Promise || (result && typeof result === 'object' && 'then' in result)
            ? Promise.resolve(result).then(value => value !== false, () => false)
            : result !== false
        } catch {
          return false
        }
      }
    },
    get afterClose() { return props.afterClose },
    get afterOpenChange() { return props.afterOpenChange },
  })
  const requestClose = (intent: 'mask' | 'keyboard' | 'close' | 'ok' | 'cancel', event?: MouseEvent | KeyboardEvent) => {
    closeEvent = event
    dialog.requestClose(intent)
  }

  props.ref?.(dialog)

  // ---- enter phase ---------------------------------------------------------
  // The dialog tree mounts (via <Show when={animatedOpen}>) already carrying
  // its final visible classes — a freshly-inserted element cannot transition
  // from anything, so the zoom-in/mask fade-in would never play. The
  // component is created once at page setup, so the enter phase must restart
  // on every animatedOpen RISING EDGE: flip to 'enter' the moment the tree is
  // about to mount, and to 'live' one macrotask later — the class change then
  // lands on a mounted element and the transitions run.
  const [phase, setPhase] = createSignal<'idle' | 'enter' | 'live'>('idle')
  createEffect(
    () => dialog.animatedOpen(),
    (animated, prev) => {
      // Rising edge only (prev = previous COMPUTE value, undefined on the
      // first run): restart the enter phase when the tree freshly mounts.
      // A reopen during the leave window (animatedOpen never dipped false)
      // needs no re-enter — the live DOM just reverses the transition.
      if (animated && prev !== true) {
        setPhase('enter')
        setTimeout(() => setPhase('live'), 0)
      }
    },
  )
  const visibleNow = createMemo(() => phase() === 'enter' ? false : dialog.open())

  // ---- DOM wiring ---------------------------------------------------------
  let wrapperEl: HTMLDivElement | undefined
  let panelEl: HTMLDivElement | undefined

  // ESC routing: register with the SHARED dialog stack (Drawer uses the same
  // one) — a single document listener closes only the TOP-MOST open dialog,
  // so stacked Modal/Drawer layers peel off one at a time (antd semantics).
  const stackId = Symbol('modal')
  const effectiveZIndex = () => props.zIndex ?? 1000
  createEffect(
    () => dialog.animatedOpen(),
    (animated) => {
      if (animated) {
        registerDialog({ id: stackId, zIndex: effectiveZIndex(), onEscape: () => { if (props.keyboard !== false) requestClose('keyboard', new KeyboardEvent('keydown', { key: 'Escape' })) } })
      } else {
        unregisterDialog(stackId)
      }
    },
  )
  onCleanup(() => unregisterDialog(stackId))

  // Save focus on open; restore after the leave completes.
  createEffect(
    () => dialog.open(),
    (isOpen) => {
      if (isOpen && !dialog.lastActiveElement()) {
        dialog.setLastActiveElement(document.activeElement as HTMLElement)
      }
      if (!isOpen) {
        const el = dialog.lastActiveElement()
        if (el instanceof HTMLElement) {
          try { el.focus({ preventScroll: true }) } catch { /* detached */ }
          dialog.setLastActiveElement(undefined)
        }
      }
    },
  )

  // Scroll lock while open (antd autoLock). Counts reentrancy for nested
  // dialogs — the last one out restores the scrollbar.
  createEffect(
    () => dialog.animatedOpen(),
    (animated) => {
      if (animated) lockScroll()
      else unlockScroll()
    },
  )
  let locked = false
  const lockScroll = () => {
    if (locked) return
    locked = true
    const count = Number(document.body.dataset.utDialogLock ?? '0') + 1
    document.body.dataset.utDialogLock = String(count)
    document.body.style.overflow = 'hidden'
  }
  const unlockScroll = () => {
    if (!locked) return
    locked = false
    const count = Number(document.body.dataset.utDialogLock ?? '1') - 1
    if (count <= 0) {
      delete document.body.dataset.utDialogLock
      document.body.style.overflow = ''
    } else {
      document.body.dataset.utDialogLock = String(count)
    }
  }
  onCleanup(unlockScroll)

  const panelWidth = createMemo(() =>
    typeof props.width === 'number' ? `${props.width}px` : props.width)

  const hasHeader = createMemo(() => props.title !== undefined && props.title !== null)
  const showFooter = createMemo(() => props.footer !== null)
  const busy = createMemo(() => dialog.busy())
  const okLoading = createMemo(() => busy() || !!props.confirmLoading)

  const onMaskClick = (e: MouseEvent) => {
    // Only direct clicks on the mask region itself (not bubbled from panel).
    if (e.target !== e.currentTarget) return
    if (!props.maskClosable) return
    requestClose('mask', e)
  }

  const ariaId = `ut-modal-${Math.random().toString(36).slice(2, 9)}`

  return (
    <Portal mount={props.getContainer?.()}>
      <Show when={dialog.animatedOpen()}>
        <div style={{ 'z-index': String(props.zIndex ?? 1000) }} class="fixed inset-0">
          <Show when={props.mask}>
            <div class={modalMaskClass({ visible: visibleNow() })} />
          </Show>
          <div
            ref={wrapperEl}
            class={modalWrapperClass({ visible: visibleNow(), centered: props.centered })}
            onClick={onMaskClick}
            onTransitionEnd={(e) => {
              // Leaving transition finished → tell the machine it may unmount.
              if (!dialog.open() && e.target === wrapperEl) dialog.notifyLeaveDone()
            }}
          >
            <div
              ref={panelEl}
              role="dialog"
              aria-modal="true"
              aria-labelledby={hasHeader() ? ariaId : undefined}
              tabindex={-1}
              class={twMerge(modalPanelClass({ visible: visibleNow() }), props.wrapClass)}
              style={{ ...props.style, width: panelWidth() }}
            >
              <Show when={hasHeader()}>
                <div class={modalHeaderClass({})}>
                  <div id={ariaId} class={modalTitleClass({})}>{props.title}</div>
                </div>
              </Show>
              <Show when={props.closable}>
                {/* Glyph is a CHILD span — hover:bg-on-surface/6 on the same
                    element would override the mask icon's currentColor fill. */}
                <button
                  type="button"
                  class={modalCloseClass({})}
                  aria-label="close"
                  onClick={e => requestClose('close', e)}
                >
                  <span class={MODAL_CLOSE_ICON} />
                </button>
              </Show>
              <div class={modalBodyClass({ bare: !hasHeader() && !showFooter() })}>
                {props.children}
              </div>
              <Show when={showFooter()}>
                <Show when={props.footer === undefined} fallback={<div class={modalFooterClass({})}>{props.footer}</div>}>
                  <div class={modalFooterClass({})}>
                    <Button variant="outlined" {...props.cancelButtonProps} onClick={e => requestClose('cancel', e)}>
                      {props.cancelText ?? '取消'}
                    </Button>
                    <Button variant={props.okVariant ?? 'solid'} color="primary" loading={okLoading()} {...props.okButtonProps} onClick={e => requestClose('ok', e)}>
                      {props.okText ?? '确定'}
                    </Button>
                  </div>
                </Show>
              </Show>
            </div>
          </div>
        </div>
      </Show>
    </Portal>
  )
}

const Modal = /* @__PURE__ */ Object.assign(ModalComponent, createModalMethods(ModalComponent))
export default Modal
