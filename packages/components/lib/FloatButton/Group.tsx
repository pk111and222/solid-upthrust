import { Show, createEffect, createMemo, merge, omit } from 'solid-js'
import { type JSX } from '@solidjs/web'
import {
  createFloatButtonGroup, floatButtonGroupPlacement,
  type FloatButtonDirection, type FloatButtonGroupPlacement, type FloatButtonGroupTrigger,
} from 'upthrust-competence'
import { mergeClass } from '../../common/merge'
import { resolveSemantic, type SemanticInput } from '../../common/semantic'
import { CloseOutlined, FileTextOutlined } from '../../common/antIcons'
import FloatButton, { type FloatButtonProps } from './FloatButton'
import { FloatButtonGroupContext, type FloatButtonGroupContextValue, type FloatButtonShape, type FloatButtonType } from './context'
import { createPresence } from './presence'
import { floatGroupClass, floatGroupListClass } from './styles'

export interface FloatButtonGroupSemanticClassNames {
  root?: string
  list?: string
  item?: string
  itemIcon?: string
  itemContent?: string
  trigger?: string
  triggerIcon?: string
  triggerContent?: string
}

export interface FloatButtonGroupSemanticStyles {
  root?: JSX.CSSProperties
  list?: JSX.CSSProperties
  item?: JSX.CSSProperties
  itemIcon?: JSX.CSSProperties
  itemContent?: JSX.CSSProperties
  trigger?: JSX.CSSProperties
  triggerIcon?: JSX.CSSProperties
  triggerContent?: JSX.CSSProperties
}

export interface FloatButtonGroupSemanticInfo { props: FloatButtonGroupProps }

export interface FloatButtonGroupProps extends Omit<FloatButtonProps, 'classNames' | 'styles' | 'shape' | 'children'> {
  /** 子按钮形状，默认 circle（各自独立 + 间距 16）；square 时合并为紧凑列表。 */
  shape?: FloatButtonShape
  /** 菜单模式的触发方式；不设置时直接平铺子按钮。 */
  trigger?: FloatButtonGroupTrigger
  /** 受控展开（需配合 trigger）。 */
  open?: boolean
  /** 非受控初始展开（本库保留）。 */
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** 菜单展开方向，默认 top。 */
  placement?: FloatButtonGroupPlacement
  /** @deprecated 使用 `placement`（up → top、down → bottom）。 */
  direction?: FloatButtonDirection
  /** 触发按钮图标，默认 FileTextOutlined。 */
  icon?: JSX.Element
  /** 展开时触发按钮的图标，默认 CloseOutlined。 */
  closeIcon?: JSX.Element
  classNames?: SemanticInput<FloatButtonGroupSemanticClassNames, FloatButtonGroupSemanticInfo>
  styles?: SemanticInput<FloatButtonGroupSemanticStyles, FloatButtonGroupSemanticInfo>
  children?: JSX.Element
}

/** antd list motion：`transition: all 0.3s`（motionDurationSlow）。 */
const LIST_MOTION_MS = 300

const OWN = [
  'shape', 'trigger', 'open', 'defaultOpen', 'onOpenChange', 'placement', 'direction', 'icon', 'closeIcon',
  'classNames', 'styles', 'class', 'style', 'children', 'type', 'onClick', 'ref',
] as const

/**
 * FloatButton.Group — antd 6 FloatButtonGroup：根节点 fixed 在右下角。
 *  - 无 trigger：直接平铺 list（circle = Flex gap 16，各自带阴影；square = Space.Compact，list 带阴影与 8px 圆角）
 *  - trigger 'click' | 'hover'：菜单模式，list 绝对定位在触发按钮 56px 外，从 ±40px + 透明度 0 过渡进出；
 *    click 模式点击触发按钮切换、document 捕获阶段点击组外关闭；hover 模式根节点移入移出开合。
 * 子按钮通过 GroupContext 继承 shape / 紧凑布局 / item* 语义化，触发按钮继承 trigger* 语义化。
 */
const FloatButtonGroup = (rawProps: FloatButtonGroupProps): JSX.Element => {
  const props = merge({ shape: 'circle' as FloatButtonShape, type: 'default' as FloatButtonType }, rawProps)
  const triggerProps = omit(rawProps, ...OWN)

  const placement = createMemo(() => floatButtonGroupPlacement(props.placement, props.direction))
  const axis = () => placement() === 'top' || placement() === 'bottom' ? 'vertical' as const : 'horizontal' as const
  const individual = () => props.shape === 'circle'

  const machine = createFloatButtonGroup({
    get trigger() { return props.trigger },
    get defaultOpen() { return props.defaultOpen },
    get open() { return props.open },
    get onOpenChange() { return props.onOpenChange },
  })
  const menuMode = () => machine.menuMode()

  const info = { get props() { return merge(rawProps, { shape: props.shape, type: props.type, placement: placement() }) as FloatButtonGroupProps } }
  const cn = createMemo(() => resolveSemantic(props.classNames, info))
  const st = createMemo(() => resolveSemantic(props.styles, info))

  const listContext: FloatButtonGroupContextValue = {
    get shape() { return props.shape },
    get individual() { return individual() },
    get axis() { return axis() },
    get classNames() { return { root: cn().item, icon: cn().itemIcon, content: cn().itemContent } },
    get styles() { return { root: st().item, icon: st().itemIcon, content: st().itemContent } },
  }
  const triggerContext: FloatButtonGroupContextValue = {
    get shape() { return props.shape },
    individual: true,
    get axis() { return axis() },
    get classNames() { return { root: cn().trigger, icon: cn().triggerIcon, content: cn().triggerContent } },
    get styles() { return { root: st().trigger, icon: st().triggerIcon, content: st().triggerContent } },
  }

  // ---- click: document capture 阶段点击组外关闭 -----------------------------
  let rootEl: HTMLDivElement | undefined
  createEffect(() => props.trigger === 'click', (click: boolean) => {
    if (!click || typeof document === 'undefined') return
    const onDocClick = (e: MouseEvent) => {
      if (rootEl?.contains(e.target as Node)) return
      machine.onOutsideClick()
    }
    document.addEventListener('click', onDocClick, { capture: true })
    return () => document.removeEventListener('click', onDocClick, { capture: true })
  })

  const presence = createPresence(() => menuMode() && machine.open(), LIST_MOTION_MS)
  const motion = () => !menuMode() ? 'none' as const
    : presence.entered() ? 'visible' as const
    : `hidden-${placement()}` as const

  const list = () => (
    <div
      data-float-button-part="list"
      data-float-button-open={menuMode() ? (machine.open() ? 'true' : 'false') : undefined}
      class={mergeClass(floatGroupListClass({ axis: axis(), individual: individual(), menu: menuMode() ? placement() : 'none', motion: motion() }), cn().list)}
      style={st().list}
    >{props.children}</div>
  )

  return (
    <FloatButtonGroupContext value={listContext}>
      <div
        ref={(el) => { rootEl = el }}
        data-float-button-part="group"
        data-float-button-placement={menuMode() ? placement() : undefined}
        data-float-button-shape={props.shape}
        class={mergeClass(floatGroupClass, cn().root, props.class)}
        style={{ ...st().root, ...props.style }}
        onMouseEnter={() => machine.onMouseEnter()}
        onMouseLeave={() => machine.onMouseLeave()}
      >
        <Show when={menuMode()} fallback={list()}>
          <Show when={presence.mounted()}>{list()}</Show>
          <FloatButtonGroupContext value={triggerContext}>
            <FloatButton
              {...triggerProps}
              type={props.type}
              icon={machine.open() ? (props.closeIcon ?? <CloseOutlined />) : (props.icon ?? <FileTextOutlined />)}
              aria-expanded={machine.open() ? 'true' : 'false'}
              data-float-button-trigger=""
              onClick={(e) => { machine.onTriggerClick(); props.onClick?.(e) }}
            />
          </FloatButtonGroupContext>
        </Show>
      </div>
    </FloatButtonGroupContext>
  )
}

export default FloatButtonGroup
