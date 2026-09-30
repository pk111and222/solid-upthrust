import { ConfigPortal as Portal } from '../ConfigProvider/Portal'
import { Component, For, Show, createEffect, createMemo, createSignal, merge, onCleanup, untrack } from 'solid-js'
import { render, type JSX } from '@solidjs/web'
import { getMessageManager, type MessageItem, type MessagePlacement, type MessageType } from 'upthrust-competence'
import {
  messageListClass, messageListContentClass, messageRowClass, messageRowInnerClass, messageRowPadClass,
  messageNoticeClass, messageWrapperClass, messageIconClass, messageTitleClass, MESSAGE_LOADING_SPIN,
} from './styles'
import { CheckCircleFilled, CloseCircleFilled, ExclamationCircleFilled, InfoCircleFilled, LoadingOutlined } from '../../common/antIcons'
import { mergeClass } from '../../common/merge'
import { numberToText } from '../../common/renderable'
import { resolveSemantic, type SemanticInput } from '../../common/semantic'

export type { MessagePlacement, MessageType } from 'upthrust-competence'

export interface MessageSemanticClassNames {
  /** The fixed list holder. */
  list?: string
  /** The flex column inside the list. */
  listContent?: string
  /** One notice card. */
  root?: string
  /** Icon + title row inside the card. */
  wrapper?: string
  icon?: string
  title?: string
}
export interface MessageSemanticStyles {
  list?: JSX.CSSProperties
  listContent?: JSX.CSSProperties
  root?: JSX.CSSProperties
  wrapper?: JSX.CSSProperties
  icon?: JSX.CSSProperties
  title?: JSX.CSSProperties
}
export interface MessageSemanticInfo { props: MessageArgsProps }

/** antd ArgsProps — the object form of every open call. */
export interface MessageArgsProps {
  content: JSX.Element
  /** Seconds before auto-close; 0 / null = never. Default 3 (message.config). */
  duration?: number | null
  type?: MessageType
  /** Fired when the notice closes (countdown, result() or destroy(key)); not by destroy(). */
  onClose?: () => void
  /** Custom icon; replaces the type icon. */
  icon?: JSX.Element
  /** Unique key: reopening with the same key updates in place. */
  key?: string | number
  class?: string
  style?: JSX.CSSProperties
  classNames?: SemanticInput<MessageSemanticClassNames, MessageSemanticInfo>
  styles?: SemanticInput<MessageSemanticStyles, MessageSemanticInfo>
  onClick?: (e: MouseEvent) => void
  /** Pause the countdown while hovered. Default true. */
  pauseOnHover?: boolean
}
/** @deprecated Use MessageArgsProps. */
export type MessageOpenProps = MessageArgsProps

/** Content node, or the full args object. */
export type MessageJointContent = JSX.Element | MessageArgsProps

/**
 * antd MessageType: call it to close the notice; `.then` resolves (true) once it has closed.
 * `key` / `update` / `close` are kept from the previous API.
 */
export interface MessageResult extends PromiseLike<boolean> {
  (): void
  key: string
  promise: Promise<boolean>
  /** Update the live notice in place; the countdown restarts. */
  update: (patch: Partial<Omit<MessageArgsProps, 'key'>>) => void
  close: () => void
}

export type MessageTypeOpen = (content: MessageJointContent, duration?: number | null | (() => void), onClose?: () => void) => MessageResult

/** message.config / MessageProvider / useMessage options. */
export interface MessageConfigOptions {
  /** Distance from the viewport top (bottom for placement="bottom"), px. Default 8. */
  top?: number
  /** Default auto-close delay, seconds. Default 3. */
  duration?: number
  /** Most notices shown at once; the oldest are dropped first. Default unlimited. */
  maxCount?: number
  /** Default true. */
  pauseOnHover?: boolean
  /** Render the list into this node (still fixed to the viewport). */
  getContainer?: () => HTMLElement
  /** Library extension: stack anchor. Default 'top'. */
  placement?: MessagePlacement
  classNames?: SemanticInput<MessageSemanticClassNames, MessageSemanticInfo>
  styles?: SemanticInput<MessageSemanticStyles, MessageSemanticInfo>
}

export interface MessageProviderProps extends MessageConfigOptions {
  /** Extra class on the list holder. */
  class?: string
}

export interface MessageInstance {
  open: (args: MessageArgsProps) => MessageResult
  info: MessageTypeOpen
  success: MessageTypeOpen
  warning: MessageTypeOpen
  error: MessageTypeOpen
  loading: MessageTypeOpen
  /** With a key: close that notice. Without: close every notice. */
  destroy: (key?: string | number) => void
}

// Renderer-owned presentation fields, carried through the headless item's `extra`.
type NoticeExtra = Pick<MessageArgsProps, 'class' | 'style' | 'classNames' | 'styles' | 'onClick'> & { args: MessageArgsProps }

// Global UI config (message.config): the parts the headless defaults do not model.
const [uiConfig, setUiConfig] = createSignal<Pick<MessageConfigOptions, 'getContainer' | 'classNames' | 'styles'>>({}, { ownedWrite: true })

/**
 * Mounted-provider registry: the singleton queue renders through exactly ONE
 * viewport at a time. If several MessageProviders are mounted (app root plus a
 * scoped demo), the most recently mounted one owns the rendering — mounting
 * does not duplicate every notice across viewports. Unmounting hands control
 * back to the previous provider in the stack.
 */
const mountedProviders: symbol[] = []
const [topProviderVersion, setTopProviderVersion] = createSignal(0, { ownedWrite: true })
const bumpTopProvider = () => setTopProviderVersion(v => v + 1)

const LEAVE_MS = 300

const TYPE_ICONS: Record<MessageType, () => JSX.Element> = {
  info: () => <InfoCircleFilled />,
  success: () => <CheckCircleFilled />,
  error: () => <CloseCircleFilled />,
  warning: () => <ExclamationCircleFilled />,
  loading: () => <LoadingOutlined class={mergeClass('inline-block', MESSAGE_LOADING_SPIN)} />,
}

const renderable = (value: unknown) => value !== undefined && value !== null && value !== false && value !== ''

/**
 * Renders the global message stack. Mount it once high in the tree to keep
 * notices inside a ConfigProvider theme scope; without any provider the first
 * imperative call mounts a fallback holder on document.body (antd static parity).
 */
export const MessageProvider: Component<MessageProviderProps> = (rawProps) => {
  const props = merge({} as const, rawProps)
  const manager = getMessageManager()

  const providerId = Symbol('message-provider')
  mountedProviders.push(providerId)
  bumpTopProvider()
  onCleanup(() => {
    const idx = mountedProviders.indexOf(providerId)
    if (idx >= 0) mountedProviders.splice(idx, 1)
    bumpTopProvider()
  })
  // Tracked through topProviderVersion so <Show> re-evaluates when the
  // registry changes (a provider mounts/unmounts and ownership flips).
  const isTopProvider = () => {
    void topProviderVersion()
    return mountedProviders[mountedProviders.length - 1] === providerId
  }

  // Declarative props → manager defaults. Tracked, so toggling a prop (e.g. the
  // placement demo in the example app) reconfigures the live manager in place.
  createEffect(
    () => ({ placement: props.placement, duration: props.duration, maxCount: props.maxCount, top: props.top, pauseOnHover: props.pauseOnHover }),
    (patch) => { manager.configure(patch) },
  )

  const items = createMemo(() => manager.items())
  const placement = () => manager.placement()
  const semanticInfo = (): MessageSemanticInfo => ({ props: { content: undefined } })
  const classNames = createMemo(() => ({ ...resolveSemantic(uiConfig().classNames, semanticInfo()), ...resolveSemantic(props.classNames, semanticInfo()) }))
  const styles = createMemo(() => ({ ...resolveSemantic(uiConfig().styles, semanticInfo()), ...resolveSemantic(props.styles, semanticInfo()) }))
  const offsetStyle = (): JSX.CSSProperties => {
    const top = `${manager.defaults().top}px`
    if (placement() === 'bottom') return { bottom: top }
    if (placement() === 'center') return {}
    return { top }
  }

  // Keyed rendering: `For` compares by reference, but every manager mutation
  // replaces the changed item's OBJECT ({...i, closing: true} etc.) — a direct
  // `<For each={items()}>` would therefore DISPOSE and remount the notice on
  // close/update, and a remounted node can never play the visible → closing
  // transition (it mounts already in the end state). Rendering over the
  // stable KEY string and reading the item through a lookup keeps one
  // component instance per key for the item's whole lifetime.
  // The lookup may briefly miss during the removal flush (the item is gone
  // from the queue while this notice is still disposing) — a tombstone keeps
  // the getters from throwing on that last read.
  const keys = createMemo(() => items().map(i => i.key))
  const itemByKey = (key: string): MessageItem => items().find(i => i.key === key)
    ?? ({ key, content: '', revision: 0, closing: true })

  return (
    <Portal mount={props.getContainer?.() ?? uiConfig().getContainer?.()}>
      {/* Only the top-most mounted provider renders the queue; shadowed ones
          (an app-root provider plus a scoped demo provider) stay empty so
          notices are never duplicated across viewports. */}
      <Show when={isTopProvider()}>
        <div
          class={mergeClass(messageListClass({ placement: placement() }), classNames().list, props.class)}
          style={{ ...offsetStyle(), ...styles().list }}
          aria-live="polite"
          data-message-part="list"
          data-message-placement={placement()}
        >
          <div class={mergeClass(messageListContentClass({ placement: placement() }), classNames().listContent)} style={styles().listContent} data-message-part="list-content">
            <For each={keys()}>
              {(key) => <MessageNotice item={() => itemByKey(key)} placement={placement()} />}
            </For>
          </div>
        </div>
      </Show>
    </Portal>
  )
}

/**
 * One notice row. Owns the visual lifecycle: enter animation on mount,
 * the pause-aware countdown, the leave animation (card fades toward the edge
 * while the row collapses), then `remove` back into the singleton queue.
 */
const MessageNotice: Component<{ item: () => MessageItem; placement: MessagePlacement }> = (props) => {
  const manager = getMessageManager()
  const item = () => props.item()
  const extra = () => (item().extra ?? {}) as Partial<NoticeExtra>

  // Enter: mount off-state, then flip to visible on the second frame so the
  // transition has a committed start style. In-place updates never remount.
  const [entered, setEntered] = createSignal(untrack(() => item().revision > 0), { ownedWrite: true })
  if (!untrack(entered)) requestAnimationFrame(() => requestAnimationFrame(() => setEntered(true)))
  const offState = () => props.placement === 'bottom' ? 'enter-bottom' as const : 'enter-top' as const
  const state = () => item().closing || !entered() ? offState() : 'visible' as const

  // ---- countdown (seconds, pause-aware) -----------------------------------
  const [hovering, setHovering] = createSignal(false, { ownedWrite: true })
  const durationMs = () => {
    const d = item().duration === undefined ? manager.defaults().duration : item().duration
    return typeof d === 'number' && d > 0 ? d * 1000 : 0
  }
  const pauseOnHover = () => item().pauseOnHover ?? manager.defaults().pauseOnHover
  const paused = () => pauseOnHover() && hovering()

  // Elapsed ms banked across hover pauses; a new revision (update / same-key
  // reopen) restarts the budget. Cleanups are RETURNED (Solid 2 rc: onCleanup
  // inside an effect callback never registers).
  let spent = 0
  let revision = -1
  createEffect(
    () => ({ dur: durationMs(), rev: item().revision, closing: item().closing, paused: paused() }),
    ({ dur, rev, closing, paused }) => {
      if (rev !== revision) { revision = rev; spent = 0 }
      if (closing || dur === 0 || paused) return
      const start = Date.now()
      const timer = setTimeout(() => manager.close(item().key), Math.max(0, dur - spent))
      return () => { clearTimeout(timer); spent += Date.now() - start }
    },
  )

  // Leave → remove after the animation window. An item can mount already
  // closing (queue trim), so arming keys off the flag alone.
  createEffect(
    () => item().closing,
    (closing: boolean) => {
      if (!closing) return
      const timer = setTimeout(() => manager.remove(item().key), LEAVE_MS)
      return () => clearTimeout(timer)
    },
  )

  const info = (): MessageSemanticInfo => ({ props: extra().args ?? { content: item().content as JSX.Element, type: item().type } })
  const classNames = createMemo(() => ({ ...resolveSemantic(uiConfig().classNames, info()), ...resolveSemantic(extra().classNames, info()) }))
  const styles = createMemo(() => ({ ...resolveSemantic(uiConfig().styles, info()), ...resolveSemantic(extra().styles, info()) }))

  const icon = () => {
    const custom = item().icon
    if (renderable(custom)) return custom as JSX.Element
    const type = item().type
    return type ? TYPE_ICONS[type]() : null
  }

  return (
    <div class={messageRowClass({ closing: item().closing })} data-message-part="row">
      <div class={messageRowInnerClass({ closing: item().closing })}>
        <div class={messageRowPadClass({ placement: props.placement })}>
          <div
            class={mergeClass(messageNoticeClass({ state: state() }), classNames().root, extra().class)}
            style={{ ...styles().root, ...extra().style }}
            onClick={(e) => extra().onClick?.(e)}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            data-message-part="root"
            data-message-type={item().type}
            data-message-key={item().key}
            data-message-closing={item().closing ? 'true' : undefined}
          >
            <div class={mergeClass(messageWrapperClass({}), classNames().wrapper)} style={styles().wrapper} data-message-part="wrapper">
              <Show when={icon()}>
                {(node) => (
                  <span class={mergeClass(messageIconClass({ type: item().type ?? 'none' }), classNames().icon)} style={styles().icon} data-message-part="icon">
                    {node()}
                  </span>
                )}
              </Show>
              <div class={mergeClass(messageTitleClass({}), classNames().title)} style={styles().title} data-message-part="title">
                {numberToText(item().content as JSX.Element)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---- imperative API --------------------------------------------------------

const manager = () => getMessageManager()

// antd static methods work without a holder: the first call with no mounted
// provider renders a fallback MessageProvider into document.body.
let fallback: { host: HTMLElement; dispose: () => void } | undefined
const ensureHolder = () => {
  if (typeof document === 'undefined') return
  // A detached fallback (the body was replaced) is rebuilt.
  if (fallback && !fallback.host.isConnected) { fallback.dispose(); fallback = undefined }
  if (fallback || mountedProviders.length > 0) return
  const host = document.createElement('div')
  host.setAttribute('data-message-holder', '')
  document.body.append(host)
  // The list portals into the host itself, so removing the host keeps the subtree consistent.
  fallback = { host, dispose: render(() => <MessageProvider getContainer={() => host} />, host) }
}

const toArgs = (content: MessageJointContent): MessageArgsProps =>
  content !== null && typeof content === 'object' && !(content instanceof Node) && !Array.isArray(content) && 'content' in content
    ? content as MessageArgsProps
    : { content: content as JSX.Element }

const toManagerConfig = (args: MessageArgsProps, onClose: (() => void) | undefined) => ({
  content: args.content,
  type: args.type,
  duration: args.duration,
  icon: args.icon,
  pauseOnHover: args.pauseOnHover,
  onClose,
  extra: { class: args.class, style: args.style, classNames: args.classNames, styles: args.styles, onClick: args.onClick, args } satisfies NoticeExtra,
})

const open = (args: MessageArgsProps): MessageResult => {
  ensureHolder()
  let resolve!: (closed: boolean) => void
  const promise = new Promise<boolean>(r => { resolve = r })
  const withResolve = (onClose?: () => void) => () => { onClose?.(); resolve(true) }
  let current = args
  const key = manager().open({ ...toManagerConfig(args, withResolve(args.onClose)), key: args.key })
  const close = () => { manager().close(key) }
  const result = Object.assign(() => close(), {
    key,
    promise,
    then: <A = boolean, B = never>(onFulfilled?: ((value: boolean) => A | PromiseLike<A>) | null, onRejected?: ((reason: unknown) => B | PromiseLike<B>) | null) =>
      promise.then(onFulfilled, onRejected),
    update: (patch: Partial<Omit<MessageArgsProps, 'key'>>) => {
      current = { ...current, ...patch }
      manager().update(key, toManagerConfig(current, withResolve(current.onClose)))
    },
    close,
  }) as MessageResult
  return result
}

const typeOpen = (type: MessageType): MessageTypeOpen => (content, duration, onClose) => {
  const args = toArgs(content)
  const fromArgs = typeof duration === 'function' ? { onClose: duration } : { duration, onClose }
  // Explicit object fields win over the positional duration / onClose (antd order).
  return open({ ...Object.fromEntries(Object.entries(fromArgs).filter(([, v]) => v !== undefined)), ...args, type } as MessageArgsProps)
}

/** Global message options (antd message.config). Applies to every provider. */
const config = (options: MessageConfigOptions) => {
  manager().configure({ top: options.top, duration: options.duration, maxCount: options.maxCount, pauseOnHover: options.pauseOnHover, placement: options.placement })
  setUiConfig(prev => ({
    ...prev,
    ...(options.getContainer !== undefined ? { getContainer: options.getContainer } : {}),
    ...(options.classNames !== undefined ? { classNames: options.classNames } : {}),
    ...(options.styles !== undefined ? { styles: options.styles } : {}),
  }))
}

const destroy = (key?: string | number) => {
  if (key === undefined) manager().close()
  else manager().close(String(key))
}

const api: MessageInstance = {
  open,
  info: typeOpen('info'),
  success: typeOpen('success'),
  warning: typeOpen('warning'),
  error: typeOpen('error'),
  loading: typeOpen('loading'),
  destroy,
}

/**
 * antd message.useMessage: returns the api plus a holder to render inside the
 * current context (ConfigProvider theme scope). The queue is still the page
 * singleton, so the options apply globally.
 */
const useMessage = (options?: MessageProviderProps): readonly [MessageInstance, JSX.Element] =>
  [api, <MessageProvider {...options} />] as const

/** Global imperative API — usable without mounting a provider. */
export const message = {
  ...api,
  config,
  useMessage,
  /** Close one notice by key (alias of destroy(key)). */
  close: (key: string | number) => destroy(key),
}

export default message
