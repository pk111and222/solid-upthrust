import { Show, children as resolveChildren, createMemo, merge, omit } from 'solid-js'
import { Dynamic, type JSX } from '@solidjs/web'
import { CheckCircleFilled, CloseCircleFilled, ExclamationCircleFilled, WarningFilled } from '../../common/antIcons'
import { mergeClass } from '../../common/merge'
import { numberToText } from '../../common/renderable'
import { resolveSemantic, type SemanticInput } from '../../common/semantic'
import { NoFound, ServerError, Unauthorized } from './images'
import {
  resultBodyClass, resultBuiltinIconClass, resultClass, resultExtraClass, resultIconClass, resultSubtitleClass, resultTitleClass,
} from './styles'

export type ResultExceptionStatus = 403 | 404 | 500 | '403' | '404' | '500'
export type ResultStatus = 'success' | 'error' | 'info' | 'warning' | ResultExceptionStatus

export interface ResultSemanticClassNames { root?: string; icon?: string; title?: string; subTitle?: string; extra?: string; body?: string }
export interface ResultSemanticStyles {
  root?: JSX.CSSProperties; icon?: JSX.CSSProperties; title?: JSX.CSSProperties
  subTitle?: JSX.CSSProperties; extra?: JSX.CSSProperties; body?: JSX.CSSProperties
}
export interface ResultSemanticInfo { props: ResultProps }

export interface ResultProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'title' | 'children' | 'class' | 'style'> {
  /** 结果状态，决定图标与颜色；403 / 404 / 500 显示异常插图。默认 'info'。 */
  status?: ResultStatus
  title?: JSX.Element
  subTitle?: JSX.Element
  /** 自定义图标；传 null / false 隐藏（异常状态始终显示插图）。 */
  icon?: JSX.Element | null | false
  /** 操作区。 */
  extra?: JSX.Element
  /** 补充内容区（body）。 */
  children?: JSX.Element
  classNames?: SemanticInput<ResultSemanticClassNames, ResultSemanticInfo>
  styles?: SemanticInput<ResultSemanticStyles, ResultSemanticInfo>
  class?: string
  style?: JSX.CSSProperties
}

const ICONS = { success: CheckCircleFilled, error: CloseCircleFilled, info: ExclamationCircleFilled, warning: WarningFilled }
const IMAGES: Record<string, () => JSX.Element> = { '403': Unauthorized, '404': NoFound, '500': ServerError }

/** antd isReactRenderable：undefined / null / false / '' 视为空。 */
const renderable = (value: unknown): boolean => value !== undefined && value !== null && value !== false && value !== ''
  && !(Array.isArray(value) && value.every(item => !renderable(item)))

const OWN = ['status', 'title', 'subTitle', 'icon', 'extra', 'children', 'classNames', 'styles', 'class', 'style'] as const

const Result = (rawProps: ResultProps): JSX.Element => {
  const props = merge({ status: 'info' } as const, rawProps)
  const rest = omit(rawProps, ...OWN)
  const classNames = createMemo(() => resolveSemantic(props.classNames, { props }))
  const styles = createMemo(() => resolveSemantic(props.styles, { props }))

  const status = () => String(props.status)
  const image = () => IMAGES[status()]
  const iconKey = () => (status() in ICONS ? status() : 'info') as keyof typeof ICONS

  const title = resolveChildren(() => props.title)
  const subTitle = resolveChildren(() => props.subTitle)
  const extra = resolveChildren(() => props.extra)
  const body = resolveChildren(() => props.children)
  const icon = resolveChildren(() => props.icon as JSX.Element)
  const iconHidden = () => !image() && (props.icon === null || props.icon === false)

  return (
    <div
      {...rest}
      class={mergeClass(resultClass(), props.class, classNames().root)}
      style={{ ...styles().root, ...props.style }}
      data-result-status={status()}
    >
      <Show when={!iconHidden()}>
        <div
          class={mergeClass(resultIconClass({ status: image() ? 'image' : iconKey() }), classNames().icon)}
          style={styles().icon}
          data-result-part="icon"
          data-result-image={image() ? 'true' : undefined}
        >
          <Show
            when={image()}
            fallback={<Show when={renderable(icon())} fallback={<Dynamic component={ICONS[iconKey()]} class={resultBuiltinIconClass} name={iconKey()} />}>{icon()}</Show>}
          >
            <Dynamic component={image()} />
          </Show>
        </div>
      </Show>
      <Show when={renderable(title())}>
        <div class={mergeClass(resultTitleClass(), classNames().title)} style={styles().title} data-result-part="title">{numberToText(title())}</div>
      </Show>
      <Show when={renderable(subTitle())}>
        <div class={mergeClass(resultSubtitleClass(), classNames().subTitle)} style={styles().subTitle} data-result-part="subTitle">{numberToText(subTitle())}</div>
      </Show>
      <Show when={renderable(extra())}>
        <div class={mergeClass(resultExtraClass(), classNames().extra)} style={styles().extra} data-result-part="extra">{extra()}</div>
      </Show>
      <Show when={renderable(body())}>
        <div class={mergeClass(resultBodyClass(), classNames().body)} style={styles().body} data-result-part="body">{numberToText(body())}</div>
      </Show>
    </div>
  )
}

/** 与 antd 一致的异常插图静态属性。 */
export default Object.assign(Result, {
  PRESENTED_IMAGE_403: Unauthorized,
  PRESENTED_IMAGE_404: NoFound,
  PRESENTED_IMAGE_500: ServerError,
})
