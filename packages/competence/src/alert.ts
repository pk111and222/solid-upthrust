import { createMemo, createSignal } from "solid-js";

/**
 * Headless logic for Alert — antd 6 Alert 的状态推导：banner 默认类型 / 图标、
 * closable 各入口（对象、closeText、已废弃 closeIcon）的合并与关闭状态。
 * 离场动画（max-height 收起）由 UI 层完成后调用 afterClose。
 */

export type AlertType = 'success' | 'info' | 'warning' | 'error'
export type AlertVariant = 'outlined' | 'filled'

export interface AlertClosableConfig<E = unknown, I = unknown> {
  closeIcon?: I
  onClose?: (e: E) => void
  afterClose?: () => void
  [aria: `aria-${string}`]: string | undefined
  [data: `data-${string}`]: string | undefined
}

export type AlertConfig<E = unknown, I = unknown> = {
  type?: AlertType
  variant?: AlertVariant
  banner?: boolean
  showIcon?: boolean
  closable?: boolean | AlertClosableConfig<E, I>
  /** @deprecated antd 已废弃，请用 closable.closeIcon。 */
  closeText?: I
  /** @deprecated antd 已废弃，请用 closable.closeIcon。 */
  closeIcon?: I
  /** @deprecated antd 已废弃，请用 closable.onClose。 */
  onClose?: (e: E) => void
  /** @deprecated antd 已废弃，请用 closable.afterClose。 */
  afterClose?: () => void
}

const isObject = <T>(value: T): value is Exclude<T, boolean | undefined | null> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/** 未指定 type 时 banner 为 warning，否则 info。 */
export const resolveAlertType = (type: AlertType | undefined, banner?: boolean): AlertType => type ?? (banner ? 'warning' : 'info')

/** banner 模式在未显式设置时默认显示图标；普通模式默认不显示。 */
export const resolveAlertShowIcon = (showIcon: boolean | undefined, banner?: boolean): boolean =>
  banner && showIcon === undefined ? true : !!showIcon

/** 是否可关闭：closable 对象 → true；closeText → true；布尔 closable；否则非空 closeIcon（含 0 / ''）。 */
export const resolveAlertClosable = <E, I>(config: Pick<AlertConfig<E, I>, 'closable' | 'closeText' | 'closeIcon'>): boolean => {
  if (isObject(config.closable)) return true
  if (config.closeText) return true
  if (typeof config.closable === 'boolean') return config.closable
  return config.closeIcon !== false && config.closeIcon !== undefined && config.closeIcon !== null
}

/** 关闭图标来源优先级：closable.closeIcon → closeText → closeIcon；`true` / undefined 表示默认图标。 */
export const resolveAlertCloseIcon = <E, I>(config: Pick<AlertConfig<E, I>, 'closable' | 'closeText' | 'closeIcon'>): I | true | undefined => {
  if (isObject(config.closable) && config.closable.closeIcon) return config.closable.closeIcon
  if (config.closeText) return config.closeText
  return config.closeIcon
}

/** closable 对象上的 aria-* / data-* 透传到关闭按钮。 */
export const pickAlertCloseAttrs = <E, I>(closable: AlertConfig<E, I>['closable']): Record<string, string> => {
  if (!isObject(closable)) return {}
  return Object.fromEntries(Object.entries(closable).filter(([key, value]) => /^(aria|data)-/.test(key) && value !== undefined)) as Record<string, string>
}

export function createAlert<E = unknown, I = unknown>(config: AlertConfig<E, I> = {}) {
  // closedNow 是同步镜像：Solid 2 的信号写入是批处理的，同一批内再次 close 读 closed() 仍是旧值。
  const [closed, setClosed] = createSignal(false, { ownedWrite: true })
  let closedNow = false
  const type = createMemo(() => resolveAlertType(config.type, config.banner))
  const variant = createMemo((): AlertVariant => config.variant ?? 'outlined')
  const showIcon = createMemo(() => resolveAlertShowIcon(config.showIcon, config.banner))
  const closable = createMemo(() => resolveAlertClosable(config))
  const closeIcon = createMemo(() => resolveAlertCloseIcon(config))
  const closeAttrs = createMemo(() => pickAlertCloseAttrs(config.closable))

  /** 点击关闭：标记 closed 并调用 closable.onClose（优先）或 onClose。重复调用无效。 */
  const close = (e: E) => {
    if (closedNow) return
    closedNow = true
    setClosed(true)
    const onClose = isObject(config.closable) ? config.closable.onClose : undefined
    ;(onClose ?? config.onClose)?.(e)
  }

  /** 离场动画结束：closable.afterClose（优先）或 afterClose。 */
  const afterClose = () => {
    const after = isObject(config.closable) ? config.closable.afterClose : undefined
    ;(after ?? config.afterClose)?.()
  }

  return { type, variant, showIcon, closable, closeIcon, closeAttrs, closed, close, afterClose }
}

export type AlertIns = ReturnType<typeof createAlert>

export const alertConfigSplits: (keyof AlertConfig)[] = [
  'type', 'variant', 'banner', 'showIcon', 'closable', 'closeText', 'closeIcon', 'onClose', 'afterClose',
]
