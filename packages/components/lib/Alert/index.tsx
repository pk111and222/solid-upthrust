import { Errored, Show, children as resolveChildren, createMemo, createSignal, merge, omit, onCleanup } from 'solid-js'
import { Dynamic, type JSX } from '@solidjs/web'
import { createAlert, type AlertClosableConfig, type AlertType, type AlertVariant } from 'upthrust-competence'
import { CheckCircleFilled, CloseCircleFilled, CloseOutlined, ExclamationCircleFilled, InfoCircleFilled } from '../../common/antIcons'
import { mergeClass } from '../../common/merge'
import { numberToText } from '../../common/renderable'
import { resolveSemantic, type SemanticInput } from '../../common/semantic'
import {
  alertActionsClass, alertBuiltinIconClass, alertClass, alertCloseClass, alertCloseIconClass, alertDescriptionClass,
  alertIconClass, alertSectionClass, alertTitleClass,
} from './styles'

export type { AlertType, AlertVariant }

export type AlertClosable = AlertClosableConfig<MouseEvent, JSX.Element>

export interface AlertSemanticClassNames {
  root?: string; icon?: string; section?: string; title?: string; description?: string; actions?: string; close?: string
}
export interface AlertSemanticStyles {
  root?: JSX.CSSProperties; icon?: JSX.CSSProperties; section?: JSX.CSSProperties; title?: JSX.CSSProperties
  description?: JSX.CSSProperties; actions?: JSX.CSSProperties; close?: JSX.CSSProperties
}
/** 函数形式收到合并后的 props（type / variant / showIcon / closable 已按默认规则推导）。 */
export interface AlertSemanticInfo {
  props: AlertProps & { type: AlertType; variant: AlertVariant; showIcon: boolean; closable: boolean }
}

export interface AlertProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'title' | 'children' | 'class' | 'style' | 'role' | 'onClose'> {
  /** 类型，默认 'info'；banner 模式默认 'warning'。 */
  type?: AlertType
  /** 样式变体，默认 'outlined'；'filled' 无边框。 */
  variant?: AlertVariant
  /** 可关闭配置：true 显示默认关闭按钮；对象可设置 closeIcon / onClose / afterClose 与 aria-* / data-*。 */
  closable?: boolean | AlertClosable
  /** 警告提示内容。 */
  title?: JSX.Element
  /** @deprecated 请使用 title。 */
  message?: JSX.Element
  /** 辅助性文字介绍。 */
  description?: JSX.Element
  /** 是否显示图标；默认 false，banner 模式默认 true。 */
  showIcon?: boolean
  /** 自定义图标，showIcon 为 true 时有效。 */
  icon?: JSX.Element
  /** 用作顶部公告（无边框、无圆角）。 */
  banner?: boolean
  /** 自定义操作项。 */
  action?: JSX.Element
  /** @deprecated 请使用 closable.onClose。 */
  onClose?: (e: MouseEvent) => void
  /** @deprecated 请使用 closable.afterClose。 */
  afterClose?: () => void
  /** @deprecated 请使用 closable.closeIcon。 */
  closeIcon?: JSX.Element
  /** @deprecated 请使用 closable.closeIcon。 */
  closeText?: JSX.Element
  /** 默认 'alert'。 */
  role?: JSX.HTMLAttributes<HTMLDivElement>['role']
  classNames?: SemanticInput<AlertSemanticClassNames, AlertSemanticInfo>
  styles?: SemanticInput<AlertSemanticStyles, AlertSemanticInfo>
  class?: string
  style?: JSX.CSSProperties
  ref?: (el: HTMLDivElement) => void
}

const ICONS = { success: CheckCircleFilled, info: InfoCircleFilled, error: CloseCircleFilled, warning: ExclamationCircleFilled }

/** antd isReactRenderable：undefined / null / false / '' 视为空。 */
const renderable = (value: unknown): boolean => value !== undefined && value !== null && value !== false && value !== ''
  && !(Array.isArray(value) && value.every(item => !renderable(item)))

const OWN = [
  'type', 'variant', 'closable', 'title', 'message', 'description', 'showIcon', 'icon', 'banner', 'action', 'onClose', 'afterClose',
  'closeIcon', 'closeText', 'role', 'classNames', 'styles', 'class', 'style', 'ref',
] as const

/** antd motionDurationSlow + motionEaseInOutCirc；只做离场（motionAppear / motionEnter 为 false）。 */
const LEAVE_TRANSITION = ['max-height', 'opacity', 'padding-top', 'padding-bottom', 'margin-bottom']
  .map(prop => `${prop} 0.3s cubic-bezier(0.78, 0.14, 0.15, 0.86)`).join(', ')
const LEAVE_TIMEOUT = 400

type LeavePhase = 'none' | 'start' | 'active' | 'done'

const AlertComponent = (rawProps: AlertProps): JSX.Element => {
  const props = merge({ role: 'alert' } as const, rawProps)
  const rest = omit(rawProps, ...OWN)
  const alert = createAlert<MouseEvent, JSX.Element>(props)

  const title = resolveChildren(() => props.title ?? props.message)
  const description = resolveChildren(() => props.description)
  const action = resolveChildren(() => props.action)
  const icon = resolveChildren(() => props.icon)
  const withDescription = () => renderable(description())

  const info = (): AlertSemanticInfo => ({
    props: merge(props, {
      get type() { return alert.type() }, get variant() { return alert.variant() },
      get showIcon() { return alert.showIcon() }, get closable() { return alert.closable() },
    }) as AlertSemanticInfo['props'],
  })
  const classNames = createMemo(() => resolveSemantic(props.classNames, info()))
  const styles = createMemo(() => resolveSemantic(props.styles, info()))

  // ============================ 离场动画 ============================
  // start：锁定当前高度并挂上 transition；下一帧 active：收起到 0；transitionend / 兜底计时后卸载并回调 afterClose。
  let root: HTMLDivElement | undefined
  const [phase, setPhase] = createSignal<LeavePhase>('none')
  const [startHeight, setStartHeight] = createSignal(0)
  let frame = 0
  let leaving = false
  let timer: ReturnType<typeof setTimeout> | undefined
  const finish = () => {
    if (phase() === 'done' || phase() === 'none') return
    if (timer) clearTimeout(timer)
    timer = undefined
    setPhase('done')
    alert.afterClose()
  }
  const handleClose = (e: MouseEvent) => {
    if (leaving) return
    leaving = true
    alert.close(e)
    setStartHeight(root?.offsetHeight ?? 0)
    setPhase('start')
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => setPhase('active'))
    })
    timer = setTimeout(finish, LEAVE_TIMEOUT)
  }
  onCleanup(() => { cancelAnimationFrame(frame); if (timer) clearTimeout(timer) })

  const motionStyle = (): JSX.CSSProperties => {
    const current = phase()
    if (current === 'start') return { overflow: 'hidden', opacity: 1, transition: LEAVE_TRANSITION, 'max-height': `${startHeight()}px` }
    if (current === 'active') return { overflow: 'hidden', opacity: 0, transition: LEAVE_TRANSITION, 'max-height': '0px', 'padding-top': '0px', 'padding-bottom': '0px' }
    return {}
  }

  const closeIcon = () => {
    const value = alert.closeIcon()
    return value === true || value === undefined ? <CloseOutlined class={alertCloseIconClass} /> : numberToText(value)
  }

  return (
    <Show when={phase() !== 'done'}>
      <div
        {...rest}
        ref={(el) => { root = el; props.ref?.(el) }}
        role={props.role}
        data-show={String(!alert.closed())}
        data-alert-type={alert.type()}
        data-alert-variant={alert.variant()}
        class={mergeClass(
          alertClass({
            tone: `${alert.variant()}-${alert.type()}`, withDescription: withDescription(), banner: !!props.banner, leaving: phase() === 'active',
          }),
          props.class, classNames().root,
        )}
        style={{ ...styles().root, ...props.style, ...motionStyle() }}
        onTransitionEnd={(e) => { if (e.target === root && e.propertyName === 'max-height' && phase() === 'active') finish() }}
      >
        <Show when={alert.showIcon()}>
          <span
            class={mergeClass(alertIconClass({ type: alert.type(), withDescription: withDescription() }), classNames().icon)}
            style={styles().icon}
            data-alert-part="icon"
          >
            <Show when={renderable(icon())} fallback={<Dynamic component={ICONS[alert.type()]} class={alertBuiltinIconClass} name={alert.type()} />}>
              {icon()}
            </Show>
          </span>
        </Show>
        <div class={mergeClass(alertSectionClass, classNames().section)} style={styles().section} data-alert-part="section">
          <Show when={renderable(title())}>
            <div class={mergeClass(alertTitleClass({ withDescription: withDescription() }), classNames().title)} style={styles().title} data-alert-part="title">
              {numberToText(title())}
            </div>
          </Show>
          <Show when={withDescription()}>
            <div class={mergeClass(alertDescriptionClass({ type: alert.type() }), classNames().description)} style={styles().description} data-alert-part="description">
              {numberToText(description())}
            </div>
          </Show>
        </div>
        <Show when={renderable(action())}>
          <div class={mergeClass(alertActionsClass, classNames().actions)} style={styles().actions} data-alert-part="actions">{action()}</div>
        </Show>
        <Show when={alert.closable()}>
          <button
            {...alert.closeAttrs()}
            type="button"
            tabindex={0}
            class={mergeClass(alertCloseClass, classNames().close)}
            style={styles().close}
            data-alert-part="close"
            onClick={handleClose}
          >
            {closeIcon()}
          </button>
        </Show>
      </div>
    </Show>
  )
}

export interface AlertErrorBoundaryProps {
  /** 自定义错误标题；未指定时显示错误信息。 */
  title?: JSX.Element
  /** @deprecated 请使用 title。 */
  message?: JSX.Element
  /** 自定义错误内容；未指定时显示错误堆栈。 */
  description?: JSX.Element
  id?: string
  children?: JSX.Element
}

/**
 * antd Alert.ErrorBoundary：子树抛错时渲染 error 类型的 Alert。
 * 基于 Solid 的 Errored；Solid 没有 React 的 componentStack，默认描述改为 error.stack。
 */
const ErrorBoundary = (props: AlertErrorBoundaryProps): JSX.Element => (
  <Errored
    fallback={(error: () => unknown) => {
      const err = () => error() as { stack?: string } | undefined
      const mergedTitle = () => props.title ?? props.message
      return (
        <AlertComponent
          id={props.id}
          type="error"
          title={mergedTitle() ?? String(error())}
          description={<pre style={{ 'font-size': '0.9em', 'overflow-x': 'auto' }}>{props.description ?? err()?.stack ?? null}</pre>}
        />
      )
    }}
  >
    {props.children}
  </Errored>
)

const Alert = Object.assign(AlertComponent, { ErrorBoundary })
export default Alert
