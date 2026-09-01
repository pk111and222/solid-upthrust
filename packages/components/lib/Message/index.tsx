import { Component, For, Show, createEffect, createMemo, createSignal, merge, onCleanup } from 'solid-js'
import { Portal, type JSX } from '@solidjs/web'
import { getMessageManager, type MessageIns, type MessageItem, type MessagePlacement, type MessageType } from 'upthrust-competence'
import { messageViewportClass, messageNoticeClass, messageIconClass, messageContentClass, MESSAGE_ICONS } from './styles'
import { twMerge } from 'tailwind-merge'

export type { MessagePlacement, MessageType } from 'upthrust-competence'

/** imperative open() options — content plus overrides for the manager defaults. */
export interface MessageOpenProps {
  content: JSX.Element
  type?: MessageType
  /** ms before auto-close; 0 disables. Default 3000 (loading: never). */
  duration?: number
  /** Unique key: reopening with the same key updates in place. */
  key?: string | number
}

/** Result handle returned by message.info(...) etc. */
export interface MessageResult {
  key: string
  /** Update the live notice in place (content/type/duration). */
  update: (patch: Partial<Omit<MessageOpenProps, 'key'>>) => void
  /** Start the leave animation and remove the notice. */
  close: () => void
}

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

/**
 * Renders the global message stack. Mount ONCE, high in the tree (usually in
 * the app root): every imperative call routes into the page-wide singleton
 * queue that this provider displays.
 */
export const MessageProvider: Component<{
  /** Reroute stack placement and defaults for all future notifications. */
  placement?: MessagePlacement
  duration?: number
  maxCount?: number
  class?: string
}> = (rawProps) => {
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
    () => ({
      placement: props.placement,
      duration: props.duration,
      maxCount: props.maxCount,
    }),
    ({ placement, duration, maxCount }) => {
      manager.configure({
        ...(placement ? { placement } : {}),
        ...(duration !== undefined ? { duration } : {}),
        ...(maxCount !== undefined ? { maxCount } : {}),
      })
    },
  )

  const items = createMemo(() => manager.items())

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
  const itemByKey = (key: string) => items().find(i => i.key === key)
    ?? ({ key, type: 'info' as const, content: '', revision: 0, closing: true })

  return (
    <Portal>
      {/* Only the top-most mounted provider renders the queue; shadowed ones
          (an app-root provider plus a scoped demo provider) stay empty so
          notices are never duplicated across viewports. */}
      <Show when={isTopProvider()}>
        <div class={twMerge(messageViewportClass({ placement: manager.placement() }), props.class)}>
          <For each={keys()}>
            {(key) => <MessageNotice item={() => itemByKey(key)!} />}
          </For>
        </div>
      </Show>
    </Portal>
  )
}

/**
 * One notice row. Owns the visual lifecycle: enter animation on mount,
 * auto-close timer (per-item duration), leave animation on closing, then
 * `remove` back into the singleton queue. Receives a GETTER that resolves
 * the live item object by key, so manager updates flow in without ever
 * remounting this component.
 */
const MessageNotice: Component<{ item: () => MessageItem }> = (rawProps) => {
  const props = merge({} as const, rawProps)
  const manager = getMessageManager()

  const item = () => props.item()

  // Enter animation: one frame as `enter`, then `visible`. In-place updates
  // (same key) bump `revision`; the component is never remounted, so
  // revision > 0 skips the entrance and swaps content in place.
  const [phase, setPhase] = createSignal<'enter' | 'visible'>(item().revision === 0 ? 'enter' : 'visible')
  if (item().revision === 0) setTimeout(() => setPhase('visible'), 0)
  const state = () => item().closing ? 'closing' as const : phase()

  // Per-item duration: loading never auto-closes unless asked to; an
  // explicit item duration (from open/update options) beats the manager
  // default. Tracked: item() is reactive, so update() re-arms the timer.
  const defaults = () => manager.defaults()
  const duration = () => item().duration !== undefined
    ? item().duration
    : item().type === 'loading' ? 0 : defaults().duration

  // Auto-close timer, armed per item generation (duration can change via update).
  // Cleanup is RETURNED — Solid 2's effect callback runs under a null owner
  // in this rc, so onCleanup inside it never registers (the old timer would
  // stay live across a duration update).
  createEffect(
    () => ({ dur: duration(), closing: item().closing }),
    ({ dur, closing }) => {
      if (closing || dur === 0) return
      const t = setTimeout(() => manager.close(item().key), dur)
      return () => clearTimeout(t)
    },
  )

  // Leave → remove after the animation window. Solid 2's effect fn receives
  // (value, prevComputeValue), and its RETURN value is the cleanup — a
  // function or undefined, never a boolean sentinel (that throws `invalid
  // cleanup value` and halts the whole reactive system). Arming is guarded by
  // the closing flag alone: an item can mount already-closing (queue trim),
  // and then prev is undefined on the very run that must arm removal.
  createEffect(
    () => item().closing,
    (closing: boolean) => {
      if (!closing) return
      const t = setTimeout(() => manager.remove(item().key), 250)
      return () => clearTimeout(t)
    },
  )

  return (
    <div class={messageNoticeClass({ type: item().type, state: state() })}>
      <span class={twMerge(messageIconClass({ type: item().type }), MESSAGE_ICONS[item().type])} />
      <div class={messageContentClass({})}>{item().content as JSX.Element}</div>
    </div>
  )
}
// ---- imperative API --------------------------------------------------------

const manager = () => getMessageManager()

const openWith = (type: MessageType, props: MessageOpenProps | JSX.Element): MessageResult => {
  const opts = typeof props === 'object' && props !== null && 'content' in (props as MessageOpenProps)
    ? props as MessageOpenProps
    : { content: props as JSX.Element }
  const key = manager().open({
    content: opts.content,
    type: opts.type ?? type,
    duration: opts.duration,
    key: opts.key,
  })
  return {
    key,
    update: (patch) => { manager().update(key, patch) },
    close: () => { manager().close(key) },
  }
}

/** Global imperative API — usable without any provider import. */
export const message = {
  open: (props: MessageOpenProps | JSX.Element) => openWith('info', props),
  info: (props: MessageOpenProps | JSX.Element) => openWith('info', props),
  success: (props: MessageOpenProps | JSX.Element) => openWith('success', props),
  warning: (props: MessageOpenProps | JSX.Element) => openWith('warning', props),
  error: (props: MessageOpenProps | JSX.Element) => openWith('error', props),
  loading: (props: MessageOpenProps | JSX.Element) => openWith('loading', props),
  /** Close every open notice (starts leave animations). */
  destroy: () => { manager().close() },
  /** Close one notice by key (starts its leave animation). */
  close: (key: string) => { manager().close(key) },
}

export default message
