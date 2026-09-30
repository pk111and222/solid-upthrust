import { ConfigPortal as Portal } from '../ConfigProvider/Portal'
import { useComponentProps } from '../ConfigProvider/context'
import { Component, createMemo, createSignal, merge, onCleanup, Show } from 'solid-js'
import { type JSX } from '@solidjs/web'
import { createDialog, type DialogIns, type DialogIntent } from 'upthrust-competence'
import {
  drawerRootClass, drawerMaskClass, drawerWrapperClass, drawerSectionClass, drawerHeaderClass, drawerHeaderTitleClass,
  drawerTitleClass, drawerExtraClass, drawerBodyClass, drawerFooterClass, drawerCloseClass, drawerDraggerClass,
  DRAWER_SIZE_PRESET,
} from './styles'
import Skeleton from '../Skeleton'
import { CloseOutlined } from '../../common/antIcons'
import { mergeClass } from '../../common/merge'
import { resolveSemantic, type SemanticInput } from '../../common/semantic'
import { useWatermarkPanel } from '../Watermark/context'
import {
  createDialogLayer, cssSize, resolveClosable, resolveMask, type DialogFocusable, type DialogMaskConfig,
} from '../_dialogLayer'
export type { DialogMaskConfig as DrawerMaskConfig, DialogFocusable as DrawerFocusable } from '../_dialogLayer'

export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom'

/** Default push distance, px (antd default 180). */
const PUSH_DISTANCE = 180

export interface DrawerClosableConfig {
  closeIcon?: JSX.Element
  disabled?: boolean
  /** Close button position relative to the title. Default 'start'. */
  placement?: 'start' | 'end'
}

export interface DrawerResizableConfig {
  onResizeStart?: () => void
  onResize?: (size: number) => void
  onResizeEnd?: () => void
}

export interface DrawerSemanticClassNames {
  root?: string; mask?: string; wrapper?: string; section?: string; header?: string; title?: string
  extra?: string; body?: string; footer?: string; dragger?: string; close?: string
}
export interface DrawerSemanticStyles {
  root?: JSX.CSSProperties; mask?: JSX.CSSProperties; wrapper?: JSX.CSSProperties; section?: JSX.CSSProperties
  header?: JSX.CSSProperties; title?: JSX.CSSProperties; extra?: JSX.CSSProperties; body?: JSX.CSSProperties
  footer?: JSX.CSSProperties; dragger?: JSX.CSSProperties; close?: JSX.CSSProperties
}
export interface DrawerSemanticInfo { props: DrawerProps }

export interface DrawerProps {
  open?: boolean
  defaultOpen?: boolean
  /** Which screen edge the panel hugs. Default 'right'. */
  placement?: DrawerPlacement
  title?: JSX.Element
  /** Operations at the right of the header. */
  extra?: JSX.Element
  children?: JSX.Element
  /** Footer; nothing is rendered when omitted. */
  footer?: JSX.Element | null
  /** Every close intent (mask / Escape / ×). A promise holds the drawer; false or a rejection keeps it open. */
  onClose?: (e: MouseEvent | KeyboardEvent) => void | boolean | Promise<unknown>
  afterClose?: () => void
  afterOpenChange?: (open: boolean) => void
  /** Mask: boolean or { enabled, blur, closable }. Default true. */
  mask?: boolean | DialogMaskConfig
  /** @deprecated Use mask.closable. Close on mask click. Default true. */
  maskClosable?: boolean
  /** Close on Escape. Default true. */
  keyboard?: boolean
  /** Show the × button; an object customises it. Default true. */
  closable?: boolean | DrawerClosableConfig
  /** Custom × icon; null / false hides the button. */
  closeIcon?: JSX.Element | null | false
  /** Preset ('default' 378 / 'large' 736), px or CSS length. Width for left/right, height for top/bottom. */
  size?: 'default' | 'large' | number | string
  /** @deprecated Use size. */
  width?: number | string
  /** @deprecated Use size. */
  height?: number | string
  /** Upper bound of a resizable drawer, px. */
  maxSize?: number
  /** Drag the inner edge to resize. */
  resizable?: boolean | DrawerResizableConfig
  /** Nested-drawer push. Default { distance: 180 }; a number sets the distance. */
  push?: boolean | number | { distance?: number | string }
  /** Show a skeleton instead of the body. */
  loading?: boolean
  /** Unmount the DOM after close. Default false (kept alive, hidden). */
  destroyOnHidden?: boolean
  /** Render the DOM before the first open. */
  forceRender?: boolean
  /** Focus trap and restore. Default { trap: true, focusTriggerAfterClose: true }. */
  focusable?: DialogFocusable
  /** Wrap the section node. */
  drawerRender?: (node: JSX.Element) => JSX.Element
  zIndex?: number
  /** Portal target; false renders in place (the parent must be positioned). */
  getContainer?: (() => HTMLElement) | false
  /** Class on the section (antd className). */
  class?: string
  /** Style on the section. */
  style?: JSX.CSSProperties
  rootClass?: string
  rootStyle?: JSX.CSSProperties
  /** @deprecated Use class. */
  panelClass?: string
  classNames?: SemanticInput<DrawerSemanticClassNames, DrawerSemanticInfo>
  styles?: SemanticInput<DrawerSemanticStyles, DrawerSemanticInfo>
  ref?: (val: DialogIns) => void
}

const Drawer: Component<DrawerProps> = (providedProps) => {
  const rawProps = useComponentProps('Drawer', providedProps)
  const props = merge({ keyboard: true } as Partial<DrawerProps>, rawProps)
  const placement = () => props.placement ?? 'right'

  let closeEvent: MouseEvent | KeyboardEvent | undefined
  // rc-drawer routes EVERY close intent (mask/Escape/×) through onClose.
  const dialog = createDialog({
    get open() { return props.open },
    get defaultOpen() { return props.defaultOpen },
    get destroyOnHidden() { return props.destroyOnHidden },
    get forceRender() { return props.forceRender },
    shouldClose: () => {
      try {
        const result = props.onClose?.(closeEvent as MouseEvent | KeyboardEvent)
        return result && typeof (result as PromiseLike<unknown>).then === 'function'
          ? Promise.resolve(result).then(value => value !== false)
          : result !== false
      } catch {
        return false
      }
    },
    get afterClose() { return props.afterClose },
    get afterOpenChange() { return props.afterOpenChange },
  })
  const requestClose = (intent: DialogIntent, event?: MouseEvent | KeyboardEvent) => {
    closeEvent = event
    dialog.requestClose(intent)
  }

  props.ref?.(dialog)

  const semanticInfo = (): DrawerSemanticInfo => ({ props })
  const classNames = createMemo(() => resolveSemantic(props.classNames, semanticInfo()))
  const styles = createMemo(() => resolveSemantic(props.styles, semanticInfo()))
  const maskInfo = createMemo(() => resolveMask(props.mask, props.maskClosable))
  const closableInfo = createMemo(() => resolveClosable(props.closable, props.closeIcon, true))

  let sectionEl: HTMLDivElement | undefined
  let wrapperEl: HTMLDivElement | undefined
  const layer = createDialogLayer({
    dialog,
    kind: 'drawer',
    zIndex: () => props.zIndex ?? 1000,
    keyboard: () => props.keyboard !== false,
    onEscape: () => requestClose('keyboard', new KeyboardEvent('keydown', { key: 'Escape' })),
    panel: () => sectionEl,
    trap: () => props.focusable?.trap !== false && maskInfo().enabled,
    restoreFocus: () => props.focusable?.focusTriggerAfterClose !== false,
    lock: () => maskInfo().enabled && props.getContainer !== false,
  })
  // antd usePanelRef：外层 Watermark（inherit）把水印也挂到弹层面板上。
  useWatermarkPanel(() => dialog.animatedOpen(), () => sectionEl)

  // ---- size ----------------------------------------------------------------
  const isVertical = createMemo(() => placement() === 'top' || placement() === 'bottom')
  const [dragSize, setDragSize] = createSignal<number | undefined>(undefined, { ownedWrite: true })
  const [dragging, setDragging] = createSignal(false, { ownedWrite: true })
  const baseSize = createMemo(() => {
    const size = props.size
    if (size === 'default' || size === 'large') return DRAWER_SIZE_PRESET[size]
    if (size !== undefined) return size
    const legacy = isVertical() ? props.height : props.width
    return legacy ?? DRAWER_SIZE_PRESET.default
  })
  const sizeStyle = createMemo((): JSX.CSSProperties => {
    const value = cssSize(dragSize() ?? baseSize())
    return isVertical() ? { height: value } : { width: value }
  })

  // ---- resize --------------------------------------------------------------
  const resizeConfig = () => typeof props.resizable === 'object' ? props.resizable : undefined
  let stopDrag: (() => void) | undefined
  const onDraggerDown = (e: PointerEvent) => {
    if (!wrapperEl) return
    e.preventDefault()
    const rect = wrapperEl.getBoundingClientRect()
    const start = isVertical() ? rect.height : rect.width
    const origin = isVertical() ? e.clientY : e.clientX
    // Growing direction: a right drawer grows when the pointer moves left.
    const sign = placement() === 'right' || placement() === 'bottom' ? -1 : 1
    setDragging(true)
    resizeConfig()?.onResizeStart?.()
    const move = (ev: PointerEvent) => {
      const delta = ((isVertical() ? ev.clientY : ev.clientX) - origin) * sign
      const viewport = isVertical() ? window.innerHeight : window.innerWidth
      const next = Math.round(Math.max(0, Math.min(start + delta, props.maxSize ?? viewport, viewport)))
      setDragSize(next)
      resizeConfig()?.onResize?.(next)
    }
    const up = () => {
      stopDrag?.()
      setDragging(false)
      resizeConfig()?.onResizeEnd?.()
    }
    stopDrag = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      stopDrag = undefined
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }
  onCleanup(() => stopDrag?.())

  // ---- push (nested drawers) ----------------------------------------------
  // While a HIGHER drawer is open, this one is pushed toward the screen center
  // (rc-drawer: right → -X, left → +X, top → +Y, bottom → -Y).
  const pushDistance = () => {
    const push = props.push
    if (push === false) return 0
    if (typeof push === 'number') return push
    if (typeof push === 'object' && push !== null && push.distance !== undefined) return push.distance
    return PUSH_DISTANCE
  }
  const pushStyle = createMemo((): JSX.CSSProperties => {
    const distance = pushDistance()
    if (!layer.pushed() || !distance) return {}
    const sign = placement() === 'right' || placement() === 'bottom' ? '-' : ''
    return { transform: `translate${isVertical() ? 'Y' : 'X'}(${sign}${cssSize(distance)})` }
  })

  const hasTitle = createMemo(() => props.title !== undefined && props.title !== null && props.title !== false)
  const hasExtra = createMemo(() => props.extra !== undefined && props.extra !== null && props.extra !== false)
  const hasHeader = createMemo(() => hasTitle() || hasExtra() || closableInfo().show)
  const closeSide = () => closableInfo().config?.placement === 'end' ? 'end' : 'start'
  const hasFooter = createMemo(() => props.footer !== undefined && props.footer !== null && props.footer !== false)

  const ariaId = `ut-drawer-${Math.random().toString(36).slice(2, 9)}`

  const closeButton = () => (
    <button
      type="button"
      class={mergeClass(drawerCloseClass({ side: closeSide(), disabled: closableInfo().disabled }), classNames().close)}
      style={styles().close}
      aria-label="Close"
      disabled={closableInfo().disabled}
      onClick={e => requestClose('close', e)}
    >
      {(closableInfo().icon as JSX.Element) ?? <CloseOutlined />}
    </button>
  )

  const section = () => (
    <div
      ref={sectionEl}
      role="dialog"
      aria-modal={maskInfo().enabled ? 'true' : undefined}
      aria-labelledby={hasTitle() ? ariaId : undefined}
      tabindex={-1}
      class={mergeClass(drawerSectionClass({}), classNames().section, props.panelClass, props.class)}
      style={{ ...styles().section, ...props.style }}
      data-drawer-part="section"
    >
      <Show when={hasHeader()}>
        <div
          class={mergeClass(drawerHeaderClass({ closeOnly: closableInfo().show && !hasTitle() && !hasExtra() }), classNames().header)}
          style={styles().header}
          data-drawer-part="header"
        >
          <div class={drawerHeaderTitleClass({})}>
            <Show when={closableInfo().show && closeSide() === 'start'}>{closeButton()}</Show>
            <Show when={hasTitle()}>
              <div id={ariaId} class={mergeClass(drawerTitleClass({}), classNames().title)} style={styles().title}>{props.title}</div>
            </Show>
          </div>
          <Show when={hasExtra()}>
            <div class={mergeClass(drawerExtraClass({}), classNames().extra)} style={styles().extra}>{props.extra}</div>
          </Show>
          <Show when={closableInfo().show && closeSide() === 'end'}>{closeButton()}</Show>
        </div>
      </Show>
      <div class={mergeClass(drawerBodyClass({ loading: !!props.loading }), classNames().body)} style={styles().body} data-drawer-part="body">
        <Show when={props.loading} fallback={props.children}>
          <Skeleton active title={false} paragraph={{ rows: 5 }} />
        </Show>
      </div>
      <Show when={hasFooter()}>
        <div class={mergeClass(drawerFooterClass({}), classNames().footer)} style={styles().footer} data-drawer-part="footer">{props.footer}</div>
      </Show>
    </div>
  )

  const tree = () => (
    <div
      class={mergeClass(drawerRootClass({ inline: props.getContainer === false, hidden: !dialog.animatedOpen() }), props.rootClass, classNames().root)}
      style={{ 'z-index': String(props.zIndex ?? 1000), ...props.rootStyle, ...styles().root }}
      data-drawer-part="root"
      data-placement={placement()}
    >
      <Show when={maskInfo().enabled}>
        <div
          class={mergeClass(drawerMaskClass({ visible: layer.visible(), blur: maskInfo().blur }), classNames().mask)}
          style={styles().mask}
          data-drawer-part="mask"
          onClick={(e) => { if (maskInfo().closable) requestClose('mask', e) }}
        />
      </Show>
      <div
        ref={wrapperEl}
        class={mergeClass(
          drawerWrapperClass({ placement: placement(), motion: layer.visible() ? 'visible' : `${placement()}-hidden`, dragging: dragging() }),
          classNames().wrapper,
        )}
        style={{ ...sizeStyle(), ...pushStyle(), ...styles().wrapper }}
        data-drawer-part="wrapper"
        onTransitionEnd={(e) => {
          if (!dialog.open() && e.target === wrapperEl) dialog.notifyLeaveDone()
        }}
      >
        <Show when={props.resizable}>
          <div
            class={mergeClass(drawerDraggerClass({ placement: placement(), dragging: dragging() }), classNames().dragger)}
            style={styles().dragger}
            data-drawer-part="dragger"
            onPointerDown={onDraggerDown}
          />
        </Show>
        {props.drawerRender ? props.drawerRender(section()) : section()}
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

export default Drawer
