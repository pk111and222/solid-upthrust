import { ConfigPortal as Portal } from '../ConfigProvider/Portal'
import { useComponentProps } from '../ConfigProvider/context'
import { Component, createEffect, createMemo, createSignal, merge, onCleanup, Show } from 'solid-js'
import { type JSX } from '@solidjs/web'
import { createDialog, type DialogIns } from 'upthrust-competence'
import {
  drawerMaskClass, drawerWrapperClass, drawerPanelClass, drawerHeaderClass,
  drawerTitleClass, drawerBodyClass, drawerFooterClass, drawerCloseClass,
  DRAWER_CLOSE_ICON, DRAWER_SIZE_PRESET,
} from './styles'
import Button, { type ButtonProps } from '../Button'
import { registerDialog, unregisterDialog, isPushed } from '../_dialogStack'
import { twMerge } from 'tailwind-merge'

export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom'

/** Default push distance, px (antd default 180). */
const PUSH_DISTANCE = 180

export interface DrawerProps {
  open?: boolean
  defaultOpen?: boolean
  /** Which screen edge the panel hugs. Default 'right'. */
  placement?: DrawerPlacement
  title?: JSX.Element
  children?: JSX.Element
  /** Custom footer; null hides it, undefined renders default ok/cancel row. */
  footer?: JSX.Element | null
  okText?: JSX.Element
  cancelText?: JSX.Element
  okButtonProps?: Partial<ButtonProps>
  cancelButtonProps?: Partial<ButtonProps>
  onClose?: (e: MouseEvent | KeyboardEvent) => void | Promise<unknown>
  afterClose?: () => void
  afterOpenChange?: (open: boolean) => void
  /** Close on mask click. Default true. */
  maskClosable?: boolean
  /** Close on Escape. Default true. */
  keyboard?: boolean
  /** Show the × button. Default true. */
  closable?: boolean
  /** Render the mask scrim. Default true. */
  mask?: boolean
  /** Panel size: named preset or explicit px. Horizontal = width, vertical = height. */
  size?: 'default' | 'large'
  width?: number | string
  height?: number | string
  /**
   * Push the drawer aside when a higher-layer drawer opens on top (antd
   * push). Default true; false disables the offset. A number sets the
   * distance in px (default 180).
   */
  push?: boolean | number
  /** Unmount the panel after close. Default false. */
  destroyOnHidden?: boolean
  zIndex?: number
  getContainer?: () => HTMLElement
  class?: string
  /** Extra class on the panel element. */
  panelClass?: string
  style?: JSX.CSSProperties
  ref?: (val: DialogIns) => void
}

const Drawer: Component<DrawerProps> = (providedProps) => {
  const rawProps = useComponentProps('Drawer', providedProps)
  const props = merge(
    {
      placement: 'right' as DrawerPlacement,
      maskClosable: true,
      keyboard: true,
      closable: true,
      mask: true,
      size: 'default' as const,
    } as Partial<DrawerProps>,
    rawProps,
  )

  // ---- shared dialog state machine (identical to Modal) ------------------
  const dialog = createDialog({
    get open() { return props.open },
    get defaultOpen() { return props.defaultOpen },
    get destroyOnHidden() { return props.destroyOnHidden },
    // rc-drawer routes EVERY close intent (mask/Escape/×) through onClose;
    // an async onClose holds the drawer open until it settles.
    get shouldClose() {
      return () => {
        const r = props.onClose?.(undefined as unknown as MouseEvent)
        if (r && typeof (r as Promise<unknown>).then === 'function') {
          return (r as Promise<unknown>).then(() => true, () => true)
        }
        return true
      }
    },
    get afterClose() { return props.afterClose },
    get afterOpenChange() { return props.afterOpenChange },
  })

  props.ref?.(dialog)

  // ---- enter phase ---------------------------------------------------------
  // The panel mounts (via <Show when={animatedOpen}>) already carrying its
  // final visible class — a freshly-inserted element cannot transition from
  // anything, so the slide-in would never play. The component itself,
  // however, is created ONCE at page setup (long before the first open), so
  // the enter phase must restart on every animatedOpen RISING EDGE: flip
  // phase to 'enter' the moment the panel is about to mount, and to 'live'
  // one macrotask later — the class change then lands on a mounted element
  // and the transform transition runs.
  const [phase, setPhase] = createSignal<'idle' | 'enter' | 'live'>('idle')
  createEffect(
    () => dialog.animatedOpen(),
    (animated, prev) => {
      // Rising edge only (prev is the previous COMPUTE value — undefined on
      // the first run). Reading phase in the callback would be an untracked
      // read, and writing it from the compute would loop; the edge test
      // avoids both. A reopen DURING the leave window (animatedOpen never
      // dipped false) needs no re-enter — the live DOM just plays the
      // reverse transition.
      if (animated && prev !== true) {
        setPhase('enter')
        setTimeout(() => setPhase('live'), 0)
      }
    },
  )
  // Effective visible state for class purposes: always false during the enter
  // frame; afterwards it simply mirrors the dialog's open signal.
  const panelVisible = createMemo(() => phase() === 'enter' ? false : dialog.open())

  // ---- DOM wiring ---------------------------------------------------------
  let panelEl: HTMLDivElement | undefined

  // ESC routing: register with the SHARED dialog stack (Modal uses the same
  // one) — a single document listener closes only the TOP-MOST open dialog.
  // Per-dialog listeners would all fire at once and one Escape would close
  // every layer.
  const stackId = Symbol('drawer')
  const effectiveZIndex = () => props.zIndex ?? 1000
  createEffect(
    () => dialog.animatedOpen(),
    (animated) => {
      if (animated) {
        registerDialog({ id: stackId, zIndex: effectiveZIndex(), onEscape: () => { if (props.keyboard !== false) dialog.requestClose('keyboard') } })
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

  // Scroll lock (shared body-counter protocol with Modal for nesting).
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
  createEffect(
    () => dialog.animatedOpen(),
    (animated) => {
      if (animated) lockScroll()
      else unlockScroll()
    },
  )
  onCleanup(unlockScroll)

  // Panel size: explicit width/height beats the size preset. Horizontal
  // placements use width; vertical use height.
  const isVertical = createMemo(() => props.placement === 'top' || props.placement === 'bottom')
  const panelSizeStyle = createMemo(() => {
    const style: Record<string, string> = {}
    if (!isVertical()) {
      const w = props.width !== undefined ? props.width : DRAWER_SIZE_PRESET[props.size ?? 'default']
      style.width = typeof w === 'number' ? `${w}px` : w
    } else {
      const h = props.height !== undefined ? props.height : DRAWER_SIZE_PRESET[props.size ?? 'default'] / 2
      style.height = typeof h === 'number' ? `${h}px` : h
    }
    return style
  })

  // ---- push (nested drawers) ----------------------------------------------
  // While a HIGHER-zIndex dialog is open (drawer OR modal — one shared stack),
  // this panel is PUSHED TOWARD THE SCREEN CENTER by the push distance —
  // rc-drawer's exact transforms: right → translateX(-d), left → translateX(+d),
  // top → translateY(+d), bottom → translateY(-d). The underlying drawer
  // stays visible, nudged inward, instead of sliding off-screen or being
  // fully covered. The slide rides the SAME transform transition as the
  // open/close motion.
  const pushDistance = () => typeof props.push === 'number' ? props.push : props.push === false ? 0 : PUSH_DISTANCE
  const pushed = createMemo(() => dialog.open() && props.push !== false && isPushed(stackId, effectiveZIndex()))
  const pushStyle = createMemo(() => {
    if (!pushed() || pushDistance() === 0) return {}
    const placement = props.placement ?? 'right'
    const sign = { right: '-', left: '', top: '', bottom: '-' }[placement] ?? '-'
    const axis = isVertical() ? 'Y' : 'X'
    return { transform: `translate${axis}(${sign}${pushDistance()}px)` }
  })

  const hasHeader = createMemo(() =>
    (props.title !== undefined && props.title !== null) || props.closable)
  const showFooter = createMemo(() => props.footer !== null)
  const busy = createMemo(() => dialog.busy())

  const ariaId = `ut-drawer-${Math.random().toString(36).slice(2, 9)}`

  return (
    <Portal mount={props.getContainer?.()}>
      <Show when={dialog.animatedOpen()}>
        <div class={drawerWrapperClass({ placement: props.placement })} style={{ 'z-index': String(props.zIndex ?? 1000) }}>
          <Show when={props.mask}>
            <div
              class={drawerMaskClass({ visible: dialog.open() })}
              onClick={() => { if (props.maskClosable) dialog.requestClose('mask') }}
            />
          </Show>
          <div
            ref={panelEl}
            role="dialog"
            aria-modal="true"
            aria-labelledby={props.title !== undefined && props.title !== null ? ariaId : undefined}
            tabindex={-1}
            class={twMerge(drawerPanelClass({ placement: props.placement, visible: panelVisible() }), props.panelClass)}
            style={{ ...props.style, ...panelSizeStyle(), ...pushStyle() }}
            onTransitionEnd={(e) => {
              if (!dialog.open() && e.target === panelEl) dialog.notifyLeaveDone()
            }}
          >
            <Show when={hasHeader()}>
              <div class={drawerHeaderClass({})}>
                <div id={ariaId} class={drawerTitleClass({})}>{props.title}</div>
                <Show when={props.closable}>
                  {/* Glyph is a CHILD span — hover:bg-on-surface/6 on the same
                      element would override the mask icon's currentColor fill. */}
                  <button
                    type="button"
                    class={drawerCloseClass({})}
                    aria-label="close"
                    onClick={() => dialog.requestClose('close')}
                  >
                    <span class={DRAWER_CLOSE_ICON} />
                  </button>
                </Show>
              </div>
            </Show>
            <div class={drawerBodyClass({})}>
              {props.children}
            </div>
            <Show when={showFooter()}>
              <Show when={props.footer === undefined} fallback={<div class={drawerFooterClass({})}>{props.footer}</div>}>
                <div class={drawerFooterClass({})}>
                  <Button variant="outlined" {...props.cancelButtonProps} onClick={() => dialog.requestClose('cancel')}>
                    {props.cancelText ?? '取消'}
                  </Button>
                  <Button variant="solid" color="primary" loading={busy()} {...props.okButtonProps} onClick={() => dialog.requestClose('ok')}>
                    {props.okText ?? '确定'}
                  </Button>
                </div>
              </Show>
            </Show>
          </div>
        </div>
      </Show>
    </Portal>
  )
}

export default Drawer
