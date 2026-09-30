import { ConfigPortal as Portal } from '../ConfigProvider/Portal'
import { Component, For, Show, createEffect, createMemo, createSignal, merge, onCleanup, untrack } from 'solid-js'
import { render, type JSX } from '@solidjs/web'
import {
  getNotificationManager,
  NOTIFICATION_PLACEMENTS,
  notificationStackLayout,
  type NotificationItem,
  type NotificationPlacement,
  type NotificationType,
} from 'upthrust-competence'
import {
  notificationListClass, notificationWrapperClass, notificationNoticeClass, notificationContentClass,
  notificationIconClass, notificationTitleClass, notificationDescriptionClass, notificationActionsClass,
  notificationCloseClass, notificationProgressClass, notificationProgressFillClass,
} from './styles'
import { CheckCircleFilled, CloseCircleFilled, CloseOutlined, ExclamationCircleFilled, InfoCircleFilled } from '../../common/antIcons'
import { mergeClass } from '../../common/merge'
import { numberToText } from '../../common/renderable'
import { resolveSemantic, type SemanticInput } from '../../common/semantic'

export type { NotificationPlacement, NotificationType } from 'upthrust-competence'

export interface NotificationSemanticClassNames {
  /** The notice card. */
  root?: string
  title?: string
  description?: string
  actions?: string
  icon?: string
}
export interface NotificationSemanticStyles {
  root?: JSX.CSSProperties
  title?: JSX.CSSProperties
  description?: JSX.CSSProperties
  actions?: JSX.CSSProperties
  icon?: JSX.CSSProperties
}
export interface NotificationSemanticInfo { props: NotificationArgsProps }

/** closable object form: custom icon, extra close callback and aria-* for the close button. */
export interface NotificationClosableConfig {
  closeIcon?: JSX.Element | null | false
  /** Fires before `onClose` whenever the notice closes. */
  onClose?: () => void
  'aria-label'?: string
  [aria: `aria-${string}`]: string | undefined
}

/** antd ArgsProps — the object form of every open call. */
export interface NotificationArgsProps {
  title?: JSX.Element
  /** @deprecated Use `title`. */
  message?: JSX.Element
  description?: JSX.Element
  /** Action area (usually buttons), floated right under the description. */
  actions?: JSX.Element
  /** @deprecated Use `actions`. */
  btn?: JSX.Element
  /** Custom icon; replaces the type icon. */
  icon?: JSX.Element
  type?: NotificationType
  /** Unique key: reopening with the same key replaces the notice in place. */
  key?: string | number
  /** Seconds before auto-close; 0 / null / false = never. Default 4.5 (notification.config). */
  duration?: number | null | false
  /** Show the countdown progress bar. */
  showProgress?: boolean
  /** Pause the countdown while hovered. Default true. */
  pauseOnHover?: boolean
  placement?: NotificationPlacement
  /** Fired when this notice closes (countdown, × or destroy(key)); not by destroy(). */
  onClose?: () => void
  onClick?: (e: MouseEvent) => void
  /** Custom close icon; null / false hides the close button. */
  closeIcon?: JSX.Element | null | false
  /** Default true. */
  closable?: boolean | NotificationClosableConfig
  /** ARIA role of the content. Default 'alert'. */
  role?: JSX.HTMLAttributes<HTMLDivElement>['role']
  /** Extra DOM attributes on the notice card. */
  props?: JSX.HTMLAttributes<HTMLDivElement> & Record<`data-${string}`, string>
  class?: string
  style?: JSX.CSSProperties
  classNames?: SemanticInput<NotificationSemanticClassNames, NotificationSemanticInfo>
  styles?: SemanticInput<NotificationSemanticStyles, NotificationSemanticInfo>
}
/** @deprecated Use NotificationArgsProps. */
export type NotificationOpenProps = NotificationArgsProps

/** Result handle returned by open / info / … (library extension; antd returns void). */
export interface NotificationResult {
  key: string
  /** Update the live notice in place; the countdown restarts. */
  update: (patch: Partial<Omit<NotificationArgsProps, 'key'>>) => void
  /** Start the leave animation and remove the notice (fires onClose). */
  close: () => void
}

/** notification.config / NotificationProvider / useNotification options. */
export interface NotificationConfigOptions {
  /** Default placement. Default 'topRight'. */
  placement?: NotificationPlacement
  /** Distance of the top stacks from the viewport top, px. Default 24. */
  top?: number
  /** Distance of the bottom stacks from the viewport bottom, px. Default 24. */
  bottom?: number
  /** Default auto-close delay, seconds; 0 / null / false = never. Default 4.5. */
  duration?: number | null | false
  showProgress?: boolean
  /** Default true. */
  pauseOnHover?: boolean
  /** Most notices shown at once; the oldest are dropped first. Default unlimited. */
  maxCount?: number
  /** Collapse a corner into a card stack beyond `threshold` (default 3) notices. Default true. */
  stack?: boolean | { threshold?: number }
  /** Render the lists into this node (still fixed to the viewport). */
  getContainer?: () => HTMLElement
  closeIcon?: JSX.Element | null | false
  closable?: boolean | NotificationClosableConfig
  classNames?: SemanticInput<NotificationSemanticClassNames, NotificationSemanticInfo>
  styles?: SemanticInput<NotificationSemanticStyles, NotificationSemanticInfo>
}

export interface NotificationProviderProps extends NotificationConfigOptions {
  /** Extra class on every placement list. */
  class?: string
}

export interface NotificationInstance {
  open: (args: NotificationArgsProps) => NotificationResult
  info: (args: NotificationArgsProps) => NotificationResult
  success: (args: NotificationArgsProps) => NotificationResult
  warning: (args: NotificationArgsProps) => NotificationResult
  error: (args: NotificationArgsProps) => NotificationResult
  /** With a key: close that notice. Without: close every notice. */
  destroy: (key?: string | number) => void
}

// Renderer-owned presentation fields, carried through the headless item's `extra`.
type NoticeExtra = { args: NotificationArgsProps }

// Global UI config (notification.config): the parts the headless defaults do not model.
type UiConfig = Pick<NotificationConfigOptions, 'getContainer' | 'closeIcon' | 'closable' | 'classNames' | 'styles'>
const [uiConfig, setUiConfig] = createSignal<UiConfig>({}, { ownedWrite: true })

/**
 * Mounted-provider registry (same rule as MessageProvider): the singleton
 * renders through exactly ONE provider — the most recently mounted.
 */
const mountedProviders: symbol[] = []
const [topProviderVersion, setTopProviderVersion] = createSignal(0, { ownedWrite: true })
const bumpTopProvider = () => setTopProviderVersion(v => v + 1)

const LEAVE_MS = 300

const TYPE_ICONS: Record<NotificationType, () => JSX.Element> = {
  info: () => <InfoCircleFilled />,
  success: () => <CheckCircleFilled />,
  error: () => <CloseCircleFilled />,
  warning: () => <ExclamationCircleFilled />,
}

const renderable = (value: unknown) => value !== undefined && value !== null && value !== false && value !== ''

const enterState = (placement: NotificationPlacement) =>
  placement === 'top' ? 'enter-top' as const
    : placement === 'bottom' ? 'enter-bottom' as const
      : placement.endsWith('Left') ? 'enter-left' as const : 'enter-right' as const

type Box = { height: number; width: number }

/**
 * Renders the global notification lists — one per placement that has notices.
 * Mount it once high in the tree to keep notices inside a ConfigProvider theme
 * scope; without any provider the first imperative call mounts a fallback
 * holder on document.body (antd static parity).
 */
export const NotificationProvider: Component<NotificationProviderProps> = (rawProps) => {
  const props = merge({} as const, rawProps)
  const manager = getNotificationManager()

  const providerId = Symbol('notification-provider')
  mountedProviders.push(providerId)
  bumpTopProvider()
  onCleanup(() => {
    const idx = mountedProviders.indexOf(providerId)
    if (idx >= 0) mountedProviders.splice(idx, 1)
    bumpTopProvider()
  })
  const isTopProvider = () => {
    void topProviderVersion()
    return mountedProviders[mountedProviders.length - 1] === providerId
  }

  // Declarative props → manager defaults (tracked: toggling a prop reconfigures in place).
  createEffect(
    () => ({
      placement: props.placement, top: props.top, bottom: props.bottom, duration: props.duration,
      showProgress: props.showProgress, pauseOnHover: props.pauseOnHover, maxCount: props.maxCount,
      ...(props.stack !== undefined ? { stack: props.stack !== false } : {}),
      threshold: typeof props.stack === 'object' ? props.stack.threshold : undefined,
    }),
    (patch) => { manager.configure(patch) },
  )

  const placements = createMemo(() => NOTIFICATION_PLACEMENTS.filter(p => manager.allItems().some(i => i.placement === p)))

  return (
    <Portal mount={props.getContainer?.() ?? uiConfig().getContainer?.()}>
      <Show when={isTopProvider()}>
        <For each={placements()}>
          {(placement) => <NotificationList placement={placement} class={props.class} ui={props} />}
        </For>
      </Show>
    </Portal>
  )
}

/**
 * One placement's list. Keyed by notification key (the manager replaces item
 * OBJECTS on every mutation, a reference-keyed For would remount live notices
 * and lose their leave transition). Owns the stack: measured notice boxes,
 * hover-expand state and the rc NoticeList transforms.
 */
const NotificationList: Component<{ placement: NotificationPlacement; class?: string; ui: UiConfig }> = (props) => {
  const manager = getNotificationManager()
  const items = createMemo(() => manager.items(props.placement))
  const keys = createMemo(() => items().map(i => i.key))
  const itemByKey = (key: string): NotificationItem => items().find(i => i.key === key)
    ?? ({ key, title: '', description: undefined, icon: undefined, actions: undefined, duration: 0, showProgress: false, pauseOnHover: false, placement: props.placement, revision: 0, closing: true })

  const [boxes, setBoxes] = createSignal<Record<string, Box>>({}, { ownedWrite: true })
  const [hoverKeys, setHoverKeys] = createSignal<string[]>([], { ownedWrite: true })
  const report = (key: string, box: Box | undefined) => setBoxes(prev => {
    if (!box) { if (!(key in prev)) return prev; const next = { ...prev }; delete next[key]; return next }
    const old = prev[key]
    return old && old.height === box.height && old.width === box.width ? prev : { ...prev, [key]: box }
  })
  const hover = (key: string, on: boolean) => setHoverKeys(prev => on ? (prev.includes(key) ? prev : [...prev, key]) : prev.filter(k => k !== key))

  const stacked = () => manager.defaults().stack
  // Live notices newest first — index 0 hugs the anchor edge.
  const live = createMemo(() => items().filter(i => !i.closing).map(i => i.key).reverse())
  // Hover keys of notices that have gone are ignored (rc cleans them up the same way).
  const hovering = () => stacked() && hoverKeys().some(k => live().includes(k))
  const expanded = () => stacked() && (hovering() || live().length <= manager.defaults().threshold)
  const layout = createMemo(() => {
    if (!stacked()) return new Map<string, { style: ReturnType<typeof notificationStackLayout>[number]; index: number }>()
    const order = live()
    const sizes = boxes()
    const styles = notificationStackLayout(props.placement, order.map(k => sizes[k] ?? { height: 0, width: 0 }), expanded())
    return new Map(order.map((k, index) => [k, { style: styles[index], index }]))
  })

  const offsetStyle = (): JSX.CSSProperties => props.placement.startsWith('top')
    ? { top: `${manager.defaults().top}px` }
    : { bottom: `${manager.defaults().bottom}px` }

  return (
    <div
      class={mergeClass(notificationListClass({ placement: props.placement }), props.class)}
      style={offsetStyle()}
      data-notification-part="list"
      data-notification-placement={props.placement}
      data-notification-stack={stacked() ? (expanded() ? 'expanded' : 'collapsed') : undefined}
    >
      <For each={keys()}>
        {(key) => (
          <NotificationNotice
            item={() => itemByKey(key)}
            ui={props.ui}
            stacked={stacked()}
            expanded={expanded()}
            forcedHover={hovering()}
            slot={layout().get(key)}
            report={report}
            hover={hover}
          />
        )}
      </For>
    </div>
  )
}

type Slot = { style: { transform: string; height?: number }; index: number }

/**
 * One notice. Owns the visual lifecycle: enter animation on mount, the
 * pause-aware countdown + progress bar, the leave animation, then `remove`
 * back into the singleton queue.
 */
const NotificationNotice: Component<{
  item: () => NotificationItem
  ui: UiConfig
  stacked: boolean
  expanded: boolean
  forcedHover: boolean
  slot?: Slot
  report: (key: string, box: Box | undefined) => void
  hover: (key: string, on: boolean) => void
}> = (props) => {
  const manager = getNotificationManager()
  const item = () => props.item()
  const key = untrack(() => item().key)
  const args = () => ((item().extra ?? {}) as Partial<NoticeExtra>).args ?? {}

  // Enter: mount off-state, flip to visible on the second frame so the
  // transition has a committed start style. In-place updates never remount.
  const [entered, setEntered] = createSignal(untrack(() => item().revision > 0), { ownedWrite: true })
  if (!untrack(entered)) requestAnimationFrame(() => requestAnimationFrame(() => setEntered(true)))
  const state = () => item().closing ? 'leave' as const : entered() ? 'visible' as const : enterState(item().placement)

  // ---- measurement (stack layout input) -----------------------------------
  let noticeEl: HTMLDivElement | undefined
  let wrapperEl: HTMLDivElement | undefined
  const measure = () => { if (noticeEl?.isConnected) props.report(key, { height: noticeEl.offsetHeight, width: noticeEl.offsetWidth }) }
  let ro: ResizeObserver | undefined
  const setNoticeRef = (el: HTMLDivElement) => {
    noticeEl = el
    // Refs run before attributes / insertion: measure on the next frame.
    requestAnimationFrame(measure)
    if (typeof ResizeObserver !== 'undefined') { ro = new ResizeObserver(measure); ro.observe(el) }
  }
  onCleanup(() => { ro?.disconnect(); props.report(key, undefined); props.hover(key, false) })

  // ---- countdown + progress (seconds, pause-aware) -------------------------
  const [hovering, setHovering] = createSignal(false, { ownedWrite: true })
  const [percent, setPercent] = createSignal(0, { ownedWrite: true })
  const durationMs = () => item().duration > 0 ? item().duration * 1000 : 0
  // rc: in a stack, hovering ANY notice pauses every notice of that corner.
  const paused = () => item().pauseOnHover && (hovering() || props.forcedHover)
  const showProgress = () => item().showProgress && durationMs() > 0

  // Elapsed ms banked across hover pauses; a new revision restarts the budget.
  // Cleanups are RETURNED (Solid 2 rc: onCleanup inside an effect callback never registers).
  let spent = 0
  let revision = -1
  createEffect(
    () => ({ dur: durationMs(), rev: item().revision, closing: item().closing, paused: paused(), progress: showProgress() }),
    ({ dur, rev, closing, paused, progress }) => {
      if (rev !== revision) { revision = rev; spent = 0; setPercent(0) }
      if (closing || dur === 0 || paused) return
      const start = Date.now()
      const base = spent
      const timer = setTimeout(() => manager.close(key), Math.max(0, dur - base))
      let frame = 0
      if (progress && typeof requestAnimationFrame !== 'undefined') {
        const tick = () => {
          frame = requestAnimationFrame(() => {
            const p = Math.min((Date.now() - start + base) / dur, 1)
            setPercent(p * 100)
            if (p < 1) tick()
          })
        }
        tick()
      }
      return () => { clearTimeout(timer); if (frame) cancelAnimationFrame(frame); spent = base + Date.now() - start }
    },
  )

  // ---- leave → remove -----------------------------------------------------
  // Non-stack lists collapse the row (max-height / margin → 0, antd fade-leave);
  // a stack only fades (the remaining cards re-flow through their transforms).
  const [collapse, setCollapse] = createSignal<'none' | 'measured' | 'zero'>('none', { ownedWrite: true })
  let collapseFrom = 0
  createEffect(
    () => item().closing,
    (closing: boolean) => {
      if (!closing) { setCollapse('none'); return }
      let frame = 0
      if (!untrack(() => props.stacked) && wrapperEl) {
        collapseFrom = wrapperEl.offsetHeight
        setCollapse('measured')
        frame = requestAnimationFrame(() => { frame = requestAnimationFrame(() => setCollapse('zero')) })
      }
      const timer = setTimeout(() => manager.remove(key), LEAVE_MS)
      return () => { clearTimeout(timer); if (frame) cancelAnimationFrame(frame) }
    },
  )
  // ---- presentation -------------------------------------------------------
  const info = (): NotificationSemanticInfo => ({ props: args() })
  const classNames = createMemo(() => ({ ...resolveSemantic(props.ui.classNames ?? uiConfig().classNames, info()), ...resolveSemantic(args().classNames, info()) }))
  const styles = createMemo(() => ({ ...resolveSemantic(props.ui.styles ?? uiConfig().styles, info()), ...resolveSemantic(args().styles, info()) }))

  const icon = () => {
    if (renderable(item().icon)) return item().icon as JSX.Element
    const type = item().type
    return type ? TYPE_ICONS[type]() : null
  }
  const hasIcon = () => renderable(item().icon) || !!item().type

  // closable: per-notice → config (provider prop / notification.config) → default true.
  const closeInfo = createMemo(() => {
    const a = args()
    const closable = a.closable ?? props.ui.closable ?? uiConfig().closable ?? true
    const closeIcon = a.closeIcon !== undefined ? a.closeIcon : props.ui.closeIcon !== undefined ? props.ui.closeIcon : uiConfig().closeIcon
    if (closable === false || closeIcon === null || closeIcon === false) return null
    const obj: NotificationClosableConfig = typeof closable === 'object' ? closable : {}
    if (obj.closeIcon === null || obj.closeIcon === false) return null
    const aria = Object.fromEntries(Object.entries(obj).filter(([k]) => k.startsWith('aria-')))
    return { icon: (obj.closeIcon ?? closeIcon) as JSX.Element | undefined, aria }
  })

  const layer = () => {
    if (!props.stacked || !props.slot) return 'front' as const
    if (props.expanded) return 'bridge' as const
    const index = props.slot.index
    return index === 0 ? 'front' as const : index < 3 ? 'peek' as const : 'hidden' as const
  }
  const concealed = () => props.stacked && !props.expanded && !!props.slot && props.slot.index > 0
  // A leaving card drops out of the layout; it keeps its last slot while it fades.
  let lastStack: JSX.CSSProperties | undefined
  const wrapperStyle = (): JSX.CSSProperties => {
    if (props.stacked) {
      const slot = props.slot
      if (!slot) return lastStack ?? {}
      lastStack = { transform: slot.style.transform, ...(slot.style.height !== undefined ? { height: `${slot.style.height}px` } : {}) }
      return lastStack
    }
    const c = collapse()
    if (c === 'none') return {}
    return { 'max-height': c === 'zero' ? '0px' : `${collapseFrom}px`, ...(c === 'zero' ? { 'margin-bottom': '0px' } : {}), overflow: 'hidden' }
  }

  const close = () => manager.close(key)

  return (
    <div
      ref={el => { wrapperEl = el }}
      class={notificationWrapperClass({ stacked: props.stacked, anchor: item().placement, state: state(), layer: layer() })}
      style={wrapperStyle()}
      onMouseEnter={() => { setHovering(true); props.hover(key, true) }}
      onMouseLeave={() => { setHovering(false); props.hover(key, false) }}
      data-notification-part="wrapper"
      data-notification-key={key}
      data-notification-closing={item().closing ? 'true' : undefined}
    >
      <div
        {...(args().props ?? {})}
        ref={setNoticeRef}
        class={mergeClass(notificationNoticeClass({}), notificationContentClass({ concealed: concealed() }), classNames().root, args().class)}
        style={{ ...styles().root, ...args().style }}
        onClick={(e) => args().onClick?.(e)}
        data-notification-part="root"
        data-notification-type={item().type}
      >
        <div role={args().role ?? 'alert'} data-notification-part="content">
          <Show when={icon()}>
            {(node) => (
              <span class={mergeClass(notificationIconClass({ type: renderable(item().icon) ? 'none' : item().type ?? 'none' }), classNames().icon)} style={styles().icon} data-notification-part="icon">
                {node()}
              </span>
            )}
          </Show>
          <Show when={renderable(item().title)}>
            <div class={mergeClass(notificationTitleClass({ closable: !!closeInfo(), withIcon: hasIcon() }), classNames().title)} style={styles().title} data-notification-part="title">
              {numberToText(item().title as JSX.Element)}
            </div>
          </Show>
          <Show when={renderable(item().description)}>
            <div class={mergeClass(notificationDescriptionClass({ first: !renderable(item().title), withIcon: hasIcon() }), classNames().description)} style={styles().description} data-notification-part="description">
              {numberToText(item().description as JSX.Element)}
            </div>
          </Show>
          <Show when={renderable(item().actions)}>
            <div class={mergeClass(notificationActionsClass({}), classNames().actions)} style={styles().actions} data-notification-part="actions">
              {item().actions as JSX.Element}
            </div>
          </Show>
        </div>
        <Show when={closeInfo()}>
          {(ci) => (
            <button
              type="button"
              aria-label="Close"
              {...ci().aria}
              class={notificationCloseClass({})}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); close() } }}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); close() }}
              data-notification-part="close"
            >
              {ci().icon ?? <CloseOutlined />}
            </button>
          )}
        </Show>
        <Show when={showProgress()}>
          {/* rc: the bar shows the REMAINING share (100 − elapsed %). */}
          <div class={notificationProgressClass({})} role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={String(Math.round(100 - percent()))} data-notification-part="progress">
            <div class={notificationProgressFillClass({})} style={{ width: `${100 - percent()}%` }} />
          </div>
        </Show>
      </div>
    </div>
  )
}

// ---- imperative API --------------------------------------------------------

const manager = () => getNotificationManager()

// antd static methods work without a holder: the first call with no mounted
// provider renders a fallback NotificationProvider into document.body.
let fallback: { host: HTMLElement; dispose: () => void } | undefined
const ensureHolder = () => {
  if (typeof document === 'undefined') return
  if (fallback && !fallback.host.isConnected) { fallback.dispose(); fallback = undefined }
  if (fallback || mountedProviders.length > 0) return
  const host = document.createElement('div')
  host.setAttribute('data-notification-holder', '')
  document.body.append(host)
  // The lists portal into the host itself, so removing the host keeps the subtree consistent.
  fallback = { host, dispose: render(() => <NotificationProvider getContainer={() => host} />, host) }
}

const toManagerConfig = (args: NotificationArgsProps) => {
  const closable = args.closable
  const closableClose = typeof closable === 'object' ? closable.onClose : undefined
  return {
    title: args.title ?? args.message,
    description: args.description,
    icon: args.icon,
    actions: args.actions ?? args.btn,
    type: args.type,
    duration: args.duration,
    showProgress: args.showProgress,
    pauseOnHover: args.pauseOnHover,
    placement: args.placement,
    // rc order: closable.onClose, then onClose.
    onClose: closableClose || args.onClose ? () => { closableClose?.(); args.onClose?.() } : undefined,
    extra: { args } satisfies NoticeExtra,
  }
}

const openWith = (type: NotificationType | undefined, input: NotificationArgsProps): NotificationResult => {
  ensureHolder()
  let current: NotificationArgsProps = type ? { ...input, type } : input
  const key = manager().open({ ...toManagerConfig(current), key: current.key })
  return {
    key,
    update: (patch) => {
      current = { ...current, ...patch }
      // A deprecated alias in the patch overrides the canonical field set at open time.
      if (patch.message !== undefined && patch.title === undefined) current.title = undefined
      if (patch.btn !== undefined && patch.actions === undefined) current.actions = undefined
      manager().update(key, toManagerConfig(current))
    },
    close: () => { manager().close(key) },
  }
}

/** Global notification options (antd notification.config). Applies to every provider. */
const config = (options: NotificationConfigOptions) => {
  manager().configure({
    placement: options.placement, top: options.top, bottom: options.bottom, duration: options.duration,
    showProgress: options.showProgress, pauseOnHover: options.pauseOnHover, maxCount: options.maxCount,
    ...(options.stack !== undefined ? { stack: options.stack !== false } : {}),
    threshold: typeof options.stack === 'object' ? options.stack.threshold : undefined,
  })
  setUiConfig(prev => {
    const next = { ...prev }
    for (const k of ['getContainer', 'closeIcon', 'closable', 'classNames', 'styles'] as const) {
      if (k in options) (next as Record<string, unknown>)[k] = options[k]
    }
    return next
  })
}

const destroy = (key?: string | number) => {
  if (key === undefined) manager().close()
  else manager().close(String(key))
}

const api: NotificationInstance = {
  open: (args) => openWith(undefined, args),
  info: (args) => openWith('info', args),
  success: (args) => openWith('success', args),
  warning: (args) => openWith('warning', args),
  error: (args) => openWith('error', args),
  destroy,
}

/**
 * antd notification.useNotification: returns the api plus a holder to render
 * inside the current context (ConfigProvider theme scope). The queue is still
 * the page singleton, so the options apply globally.
 */
const useNotification = (options?: NotificationProviderProps): readonly [NotificationInstance, JSX.Element] =>
  [api, <NotificationProvider {...options} />] as const

/** Global imperative API — usable without mounting a provider. */
export const notification = {
  ...api,
  config,
  useNotification,
  /** Close one notice by key (alias of destroy(key)). */
  close: (key: string | number) => destroy(key),
}

export default notification
