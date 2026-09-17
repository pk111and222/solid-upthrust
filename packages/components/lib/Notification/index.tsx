import { ConfigPortal as Portal } from '../ConfigProvider/Portal'
import { Component, For, Show, createEffect, createMemo, createSignal, merge, onCleanup } from 'solid-js'
import { type JSX } from '@solidjs/web'
import {
  getNotificationManager,
  NOTIFICATION_PLACEMENTS,
  type NotificationIns,
  type NotificationItem,
  type NotificationPlacement,
  type NotificationType,
} from 'upthrust-competence'
import {
  notificationViewportClass,
  notificationNoticeClass,
  notificationEnterClass,
  notificationBodyClass,
  notificationMessageClass,
  notificationDescriptionClass,
  notificationIconClass,
  notificationCloseClass,
  notificationActionsClass,
  notificationProgressClass,
  notificationProgressFillClass,
  NOTIFICATION_CLOSE_ICON,
} from './styles'
import { twMerge } from 'tailwind-merge'

export type { NotificationPlacement, NotificationType } from 'upthrust-competence'

/** imperative open() options — antd ArgsProps surface. */
export interface NotificationOpenProps {
  message: JSX.Element
  description?: JSX.Element
  icon?: JSX.Element
  btn?: JSX.Element
  type?: NotificationType
  /** Seconds before auto-close; 0 disables. Default 4.5 (manager default). */
  duration?: number | null
  /** Show the countdown progress bar. */
  showProgress?: boolean
  /** Pause the countdown while the pointer rests on the notice. Default true. */
  pauseOnHover?: boolean
  /** Unique key: reopening with the same key updates in place. */
  key?: string | number
  placement?: NotificationPlacement
  onClose?: () => void
}

/** Result handle returned by notification.open(...) etc. */
export interface NotificationResult {
  key: string
  /** Update the live notice in place. */
  update: (patch: Partial<Omit<NotificationOpenProps, 'key'>>) => void
  /** Start the leave animation and remove the notice. */
  close: () => void
}

/** Which horizontal side a placement enters from (drives the slide direction). */
const sideOf = (placement: NotificationPlacement): 'left' | 'right' | 'center' =>
  placement.endsWith('Left') ? 'left' : placement.endsWith('Right') ? 'right' : 'center'

/**
 * Mounted-provider registry — the singleton renders through exactly ONE
 * provider at a time (same rule as MessageProvider): a scoped demo provider
 * shadows the app-root one instead of duplicating every notice.
 */
const mountedProviders: symbol[] = []
const [topProviderVersion, setTopProviderVersion] = createSignal(0, { ownedWrite: true })
const bumpTopProvider = () => setTopProviderVersion(v => v + 1)

/**
 * Renders the global notification stacks — all six placements at once. Mount
 * ONCE, high in the tree: every imperative call routes into the page-wide
 * singleton this provider displays.
 */
export const NotificationProvider: Component<{
  placement?: NotificationPlacement
  duration?: number | null
  showProgress?: boolean
  pauseOnHover?: boolean
  maxCount?: number
  class?: string
}> = (rawProps) => {
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

  // Declarative props → manager defaults. Tracked so toggling a prop
  // reconfigures the live manager in place.
  createEffect(
    () => ({
      placement: props.placement,
      duration: props.duration,
      showProgress: props.showProgress,
      pauseOnHover: props.pauseOnHover,
      maxCount: props.maxCount,
    }),
    ({ placement, duration, showProgress, pauseOnHover, maxCount }) => {
      manager.configure({
        ...(placement ? { placement } : {}),
        ...(duration !== undefined ? { duration } : {}),
        ...(showProgress !== undefined ? { showProgress } : {}),
        ...(pauseOnHover !== undefined ? { pauseOnHover } : {}),
        ...(maxCount !== undefined ? { maxCount } : {}),
      })
    },
  )

  return (
    <Portal>
      <Show when={isTopProvider()}>
        <For each={NOTIFICATION_PLACEMENTS}>
          {(placement) => <NotificationStack placement={placement} class={props.class} />}
        </For>
      </Show>
    </Portal>
  )
}

/** One placement's column. Keyed by notification key (not item reference) so
 *  manager mutations never remount live notices — the visible → closing
 *  transition must run on the SAME DOM node. */
const NotificationStack: Component<{ placement: NotificationPlacement; class?: string }> = (rawProps) => {
  const props = merge({} as const, rawProps)
  const manager = getNotificationManager()

  const items = createMemo(() => manager.items(props.placement))
  const keys = createMemo(() => items().map(i => i.key))
  const itemByKey = (key: string) => items().find(i => i.key === key)

  return (
    <div class={twMerge(notificationViewportClass({ placement: props.placement }), props.class)}>
      <For each={keys()}>
        {(key) => {
          // Tombstone: during the removal flush the lookup misses briefly —
          // closing:true keeps the leaving notice in its end state.
          const item = () => itemByKey(key)
            ?? ({ key, type: 'info' as const, message: '', description: undefined, icon: undefined, btn: undefined, duration: 0, showProgress: false, pauseOnHover: false, placement: props.placement, revision: 0, closing: true })
          return <NotificationNotice item={item} />
        }}
      </For>
    </div>
  )
}

/**
 * One notice card. Owns the visual lifecycle: enter animation on mount,
 * pause-aware countdown timer + progress bar, leave animation on closing,
 * then `remove` back into the singleton queue.
 */
const NotificationNotice: Component<{ item: () => NotificationItem }> = (rawProps) => {
  const props = merge({} as const, rawProps)
  const manager = getNotificationManager()

  const item = () => props.item()

  // ---- enter / leave phase ---------------------------------------------
  const [phase, setPhase] = createSignal<'enter' | 'visible'>(item().revision === 0 ? 'enter' : 'visible')
  if (item().revision === 0) setTimeout(() => setPhase('visible'), 0)
  const state = () => item().closing ? 'closing' as const : phase()

  // ---- countdown (pause-aware) ------------------------------------------
  // elapsed ms accumulated across pause periods; reset by revision changes.
  const [hovering, setHovering] = createSignal(false)
  const [spentMs, setSpentMs] = createSignal(0)
  const [progress, setProgress] = createSignal(0)

  const durationMs = () => {
    const d = item().duration
    return d === null || d === undefined ? 0 : Math.max(0, d * 1000)
  }
  const paused = () => item().pauseOnHover && hovering()
  const showProgress = () => item().showProgress && durationMs() > 0

  // Countdown timer: re-armed whenever duration, revision or hover changes.
  // While paused, the remaining budget is banked into spentMs (antd's
  // pauseOnHover semantics: time only counts while the pointer is away).
  // NOTE: cleanups are RETURNED (not onCleanup) — Solid 2's effect callback
  // runs under a null owner in this rc, so onCleanup never registers and the
  // pause banking would silently never happen.
  createEffect(
    () => ({ dur: durationMs(), rev: item().revision, closing: item().closing, paused: paused() }),
    ({ dur, closing, paused }) => {
      if (closing || dur === 0) return
      if (paused) {
        // Bank the time spent since this effect run started.
        const start = Date.now() - spentMs()
        setSpentMs(Date.now() - start)
        return
      }
      const start = Date.now() - spentMs()
      const t = setTimeout(() => manager.close(item().key), dur - spentMs())
      return () => {
        clearTimeout(t)
        setSpentMs(Date.now() - start)
      }
    },
  )

  // Progress bar: rAF-driven 0..1 while running, frozen while paused.
  createEffect(
    () => ({ show: showProgress(), rev: item().revision, paused: paused(), dur: durationMs() }),
    ({ show, paused }) => {
      if (!show || paused) return
      const start = performance.now()
      let raf = 0
      const tick = () => {
        raf = requestAnimationFrame(() => {
          const runtime = (performance.now() - start) + spentMs()
          const p = Math.min(runtime / durationMs(), 1)
          setProgress(p)
          if (p < 1) tick()
        })
      }
      tick()
      return () => cancelAnimationFrame(raf)
    },
  )

  // Leave → remove after the animation window.
  createEffect(
    () => item().closing,
    (closing: boolean) => {
      if (!closing) return
      const t = setTimeout(() => manager.remove(item().key), 300)
      return () => clearTimeout(t)
    },
  )

  const hasDescription = () => item().description !== undefined && item().description !== null
  const hasIcon = () => item().icon !== undefined || true  // type icon always shown (antd with-icon)
  const customIcon = () => item().icon
  const hasBtn = () => item().btn !== undefined && item().btn !== null

  return (
    <div
      class={twMerge(
        notificationNoticeClass({ state: state() }),
        state() === 'enter' ? notificationEnterClass({ side: sideOf(item().placement) }) : '',
      )}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      role={item().type === 'error' ? 'alert' : 'status'}
    >
      <div class={notificationBodyClass({})}>
        <Show when={customIcon()} fallback={<span class={notificationIconClass({ type: item().type })} />}>
          <span class={twMerge(notificationIconClass({ type: item().type }), 'i-none')}>{customIcon() as JSX.Element}</span>
        </Show>
        <div class={notificationMessageClass({ withIcon: hasIcon() })}>{item().message as JSX.Element}</div>
        <Show when={hasDescription()}>
          <div class={notificationDescriptionClass({ withIcon: hasIcon() })}>{item().description as JSX.Element}</div>
        </Show>
        <Show when={hasBtn()}>
          <div class={notificationActionsClass({})}>{item().btn as JSX.Element}</div>
        </Show>
        {/* Glyph is a CHILD span — hover:bg-on-surface/6 on the same element
            would override the mask icon's currentColor fill. */}
        <button
          type="button"
          class={notificationCloseClass({})}
          aria-label="close"
          onClick={() => manager.close(item().key)}
        >
          <span class={NOTIFICATION_CLOSE_ICON} />
        </button>
      </div>
      <Show when={showProgress()}>
        <div class={notificationProgressClass({})}>
          <div class={notificationProgressFillClass({})} style={{ width: `${Math.round(progress() * 100)}%` }} />
        </div>
      </Show>
    </div>
  )
}

// ---- imperative API --------------------------------------------------------

const manager = () => getNotificationManager()

const openWith = (type: NotificationType | undefined, props: NotificationOpenProps): NotificationResult => {
  const key = manager().open({
    message: props.message,
    description: props.description,
    icon: props.icon,
    btn: props.btn,
    type: props.type ?? type,
    duration: props.duration,
    showProgress: props.showProgress,
    pauseOnHover: props.pauseOnHover,
    key: props.key,
    placement: props.placement,
    onClose: props.onClose,
  })
  return {
    key,
    update: (patch) => { manager().update(key, patch) },
    close: () => { manager().close(key) },
  }
}

/** Global imperative API — antd notification.xxx(config) surface. */
export const notification = {
  open: (props: NotificationOpenProps) => openWith(undefined, props),
  info: (props: NotificationOpenProps) => openWith('info', props),
  success: (props: NotificationOpenProps) => openWith('success', props),
  warning: (props: NotificationOpenProps) => openWith('warning', props),
  error: (props: NotificationOpenProps) => openWith('error', props),
  /** Close every open notice (starts leave animations). */
  destroy: () => { manager().close() },
  /** Close one notice by key (starts its leave animation). */
  close: (key: string) => { manager().close(key) },
}

export default notification
