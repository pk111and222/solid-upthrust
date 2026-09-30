import { ConfigPortal as Portal } from '../ConfigProvider/Portal'
import { Show, children as resolveChildren, createMemo, merge, omit, untrack, useContext } from 'solid-js'
import { type JSX } from '@solidjs/web'
import { createTooltip } from 'upthrust-competence'
import { mergeClass } from '../../common/merge'
import { resolveSemantic, type SemanticInput } from '../../common/semantic'
import { FileTextOutlined } from '../../common/antIcons'
import Badge, { type BadgeProps } from '../Badge'
import type { TooltipProps } from '../Tooltip'
import { tooltipArrowClass, tooltipOverlayClass } from '../Tooltip/styles'
import {
  FloatButtonGroupContext,
  type FloatButtonSemanticClassNames, type FloatButtonSemanticStyles, type FloatButtonShape, type FloatButtonType,
} from './context'
import { floatButtonBadgeClass, floatButtonClass, floatButtonContentClass, floatButtonIconClass } from './styles'

/** antd FloatButtonBadgeProps：Badge 去掉 status / text / title / children。 */
export type FloatButtonBadgeProps = Omit<BadgeProps, 'status' | 'text' | 'title' | 'children'>
/** tooltip 传节点即 title，传对象即 Tooltip 属性（antd convertToTooltipProps）。 */
export type FloatButtonTooltipProps = Omit<TooltipProps, 'children' | 'ref' | 'class' | 'style'>
export interface FloatButtonSemanticInfo { props: FloatButtonProps }

export interface FloatButtonProps extends Omit<JSX.HTMLAttributes<HTMLElement>, 'class' | 'style' | 'children' | 'onClick' | 'ref' | 'content'> {
  /** 按钮类型，默认 default。 */
  type?: FloatButtonType
  /** 按钮形状，默认 circle；在 Group 内由 Group 的 shape 决定。 */
  shape?: FloatButtonShape
  /** 图标；icon 与 content 都未设置时显示 FileTextOutlined。 */
  icon?: JSX.Element
  /** 文字内容（建议配合 square 形状）。 */
  content?: JSX.Element
  /** @deprecated 使用 `content`。 */
  description?: JSX.Element
  /** 气泡提示：节点即标题，对象即 Tooltip 属性。 */
  tooltip?: JSX.Element | FloatButtonTooltipProps
  /** 链接地址，设置后渲染为 `<a>`。 */
  href?: string
  /** 链接打开方式（同 `<a target>`）。 */
  target?: string
  /** 徽标（Badge 属性，不含 status / text / title / children）。 */
  badge?: FloatButtonBadgeProps
  /** 原生 button type，默认 button。 */
  htmlType?: 'button' | 'submit' | 'reset'
  'aria-label'?: string
  disabled?: boolean
  onClick?: (e: MouseEvent) => void
  classNames?: SemanticInput<FloatButtonSemanticClassNames, FloatButtonSemanticInfo>
  styles?: SemanticInput<FloatButtonSemanticStyles, FloatButtonSemanticInfo>
  class?: string
  style?: JSX.CSSProperties
  /** 根节点（button / a）。 */
  ref?: (el: HTMLElement) => void
}

const OWN = [
  'type', 'shape', 'icon', 'content', 'description', 'tooltip', 'href', 'target', 'badge', 'htmlType',
  'disabled', 'onClick', 'classNames', 'styles', 'class', 'style', 'ref',
] as const

const isRenderable = (node: unknown) =>
  Array.isArray(node) ? node.some(isRenderable) : node !== undefined && node !== null && node !== false && node !== true && node !== ''

const isTooltipConfig = (value: unknown): value is FloatButtonTooltipProps =>
  !!value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype

// computeArrow reports the arrow CENTER; the 8px square is placed by its top-left corner.
const ARROW_HALF = 4

/**
 * FloatButton — antd 6 FloatButton：size=large 的 Button 纵向排布（40 宽、最小 40 高），
 * 单独使用时 fixed 在右下角（right 24 / bottom 48 / z 1000 / boxShadowSecondary）；
 * 在 Group 内由 GroupContext 覆盖 shape，并决定各自带阴影（circle）还是并入 Compact（square）。
 * tooltip 直接把 trigger 绑在按钮本身上，不额外包一层 div（否则会破坏 fixed / Compact 的首尾圆角）。
 */
const FloatButton = (rawProps: FloatButtonProps): JSX.Element => {
  const group = useContext(FloatButtonGroupContext)
  const props = merge({ type: 'default' as FloatButtonType, shape: 'circle' as FloatButtonShape }, rawProps)
  const rest = omit(rawProps, ...OWN)

  const shape = () => group?.shape ?? props.shape
  const layout = () => !group ? 'fixed' as const : group.individual ? 'item' as const : 'compact' as const

  // JSX 属性每次读取都会新建节点：content / icon 各解析一次后复用。
  const content = resolveChildren(() => props.content ?? props.description)
  const icon = resolveChildren(() => props.icon)
  const hasContent = createMemo(() => isRenderable(content()))
  const hasIcon = createMemo(() => isRenderable(icon()))

  const info = { get props() { return merge(rawProps, { type: props.type, shape: shape() }) as FloatButtonProps } }
  const cn = createMemo(() => ({ ...group?.classNames }))
  const own = createMemo(() => resolveSemantic(props.classNames, info))
  const st = createMemo(() => ({ ...group?.styles }))
  const ownStyles = createMemo(() => resolveSemantic(props.styles, info))

  const rootClass = createMemo(() => mergeClass(
    floatButtonClass({
      colorScheme: props.disabled ? 'disabled' : props.type === 'primary' ? 'primary' : 'default',
      shape: shape(),
      layout: layout(),
      compact: layout() === 'compact' ? group!.axis : 'none',
      clickable: !props.disabled,
    }),
    cn().root, own().root, props.class,
  ))
  const rootStyle = createMemo((): JSX.CSSProperties => ({ ...st().root, ...ownStyles().root, ...props.style }))

  // ---- tooltip ------------------------------------------------------------
  // 普通函数而非 memo：createTrigger 在组件体内读取初始 open / placement，memo 读会触发 STRICT_READ_UNTRACKED。
  const tooltipProps = (): FloatButtonTooltipProps | undefined => {
    const t = props.tooltip
    if (t === undefined || t === null || t === false) return undefined
    return isTooltipConfig(t) ? t : { title: t as JSX.Element }
  }
  const hasTitle = createMemo(() => isRenderable(tooltipProps()?.title))
  const tooltip = createTooltip({
    get open() { return tooltipProps()?.open },
    get defaultOpen() { return tooltipProps()?.defaultOpen },
    get disabled() { return !!tooltipProps()?.disabled || !hasTitle() },
    get trigger() { return tooltipProps()?.trigger },
    get placement() { return tooltipProps()?.placement },
    get mouseEnterDelay() { return tooltipProps()?.mouseEnterDelay },
    get mouseLeaveDelay() { return tooltipProps()?.mouseLeaveDelay },
    get onOpenChange() { return tooltipProps()?.onOpenChange },
    get getContainer() { return tooltipProps()?.getContainer },
  })
  const tooltipVisible = createMemo(() => tooltip.open() && hasTitle())

  const setRef = (el: HTMLElement) => {
    tooltip.triggerRef(el)
    untrack(() => props.ref?.(el))
  }

  // ---- body -----------------------------------------------------------------
  const body = () => <>
    <Show when={hasIcon() || !hasContent()}>
      <span
        data-float-button-part="icon"
        class={mergeClass(floatButtonIconClass({ iconOnly: !hasContent() }), cn().icon, own().icon)}
        style={{ ...st().icon, ...ownStyles().icon }}
      >
        <Show when={hasIcon()} fallback={<FileTextOutlined />}>{icon()}</Show>
      </span>
    </Show>
    <Show when={hasContent()}>
      <span
        data-float-button-part="content"
        class={mergeClass(floatButtonContentClass, cn().content, own().content)}
        style={{ ...st().content, ...ownStyles().content }}
      >{content()}</span>
    </Show>
    <Show when={props.badge}>
      {(badge) => {
        const b = badge() as FloatButtonBadgeProps & Record<string, unknown>
        const clean = omit(b, 'status' as never, 'text' as never, 'title' as never, 'children' as never) as FloatButtonBadgeProps
        const offset = () => (shape() === 'square' ? 'square' : 'circle') + (b.dot ? '-dot' : '') as 'circle' | 'circle-dot' | 'square' | 'square-dot'
        return <Badge {...clean} data-float-button-part="badge" class={mergeClass(floatButtonBadgeClass({ offset: offset() }), b.class)} />
      }}
    </Show>
  </>

  const button = (
    <Show
      when={props.href !== undefined}
      fallback={
        <button
          {...rest}
          ref={setRef}
          type={props.htmlType ?? 'button'}
          disabled={props.disabled}
          data-float-button-part="root"
          data-float-button-shape={shape()}
          data-float-button-type={props.type}
          class={rootClass()}
          style={rootStyle()}
          onClick={(e) => props.onClick?.(e)}
        >{body()}</button>
      }
    >
      <a
        {...rest}
        ref={setRef}
        href={props.disabled ? undefined : props.href}
        target={props.target}
        aria-disabled={props.disabled ? 'true' : undefined}
        data-float-button-part="root"
        data-float-button-shape={shape()}
        data-float-button-type={props.type}
        class={rootClass()}
        style={rootStyle()}
        onClick={(e) => { if (props.disabled) { e.preventDefault(); return } props.onClick?.(e) }}
      >{body()}</a>
    </Show>
  )

  return <>
    {button}
    <Show when={tooltipProps()}>
      <Portal mount={tooltipProps()?.getContainer?.()}>
        <Show when={tooltip.mounted()}>
          <div
            ref={(el) => { tooltip.layerRef(el); tooltip.bindLayerHover() }}
            data-float-button-part="tooltip"
            class={mergeClass(tooltipOverlayClass({ visible: tooltipVisible(), placement: tooltip.actualPlacement() }), tooltipProps()?.overlayClass)}
            style={{ ...tooltip.layerStyle(), ...tooltipProps()?.overlayStyle }}
            role="tooltip"
            aria-hidden={!tooltipVisible() ? 'true' : undefined}
            inert={!tooltipVisible()}
          >
            {tooltipProps()?.title}
            <Show when={tooltip.arrow()}>
              {(arrow) => (
                <span
                  class={tooltipArrowClass(arrow().side)}
                  style={arrow().side === 'left' || arrow().side === 'right'
                    ? { top: `${arrow().y - ARROW_HALF}px` }
                    : { left: `${arrow().x - ARROW_HALF}px` }}
                />
              )}
            </Show>
          </div>
        </Show>
      </Portal>
    </Show>
  </>
}

export default FloatButton
